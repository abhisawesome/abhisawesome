import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SnakeGame } from './games/SnakeGame';
import { BootSequence } from './BootSequence';
import { MatrixRain } from './effects/MatrixRain';
import { Screensaver } from './effects/Screensaver';
import { HackAnimation } from './effects/HackAnimation';
import { SudoRm } from './effects/SudoRm';
import { NanoEditor } from './effects/NanoEditor';
import { TopViewer } from './effects/TopViewer';
import { createDefaultFileSystem } from '@/lib/defaultFileSystem';
import { processCommandWithPipes } from '@/lib/commandProcessor';
import { applyTheme, loadSavedTheme } from '@/lib/themes';
import { ProcessManager } from '@/lib/processManager';
import { ServiceManager } from '@/lib/serviceManager';

interface Command {
  text: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error';
  component?: React.ReactNode;
}

const QUICK_COMMANDS = [
  { label: 'help', cmd: 'help' },
  { label: 'about', cmd: 'about' },
  { label: 'skills', cmd: 'skills' },
  { label: 'resume', cmd: 'resume' },
  { label: 'projects', cmd: 'projects' },
  { label: 'contact', cmd: 'contact' },
  { label: 'ls', cmd: 'ls' },
  { label: 'tree', cmd: 'tree' },
  { label: 'neofetch', cmd: 'neofetch' },
  { label: 'theme', cmd: 'theme' },
  { label: 'cowsay hi', cmd: 'cowsay hi' },
  { label: 'matrix', cmd: 'matrix' },
  { label: 'snake', cmd: 'snake' },
];

const ALL_COMMANDS = [
  'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'rmdir', 'cp', 'mv',
  'echo', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'sort', 'uniq',
  'whoami', 'date', 'clear', 'help', 'about', 'resume', 'skills', 'projects',
  'contact', 'certifications', 'achievements', 'games', 'snake', 'theme',
  'neofetch', 'uname', 'hostname', 'uptime', 'history', 'man', 'which',
  'matrix', 'hack', 'nano', 'cowsay', 'weather', 'exit', 'sudo',
  'top', 'htop', 'ps', 'kill', 'systemctl', 'crontab',
  'df', 'free', 'chmod', 'ping', 'ssh', 'ifconfig', 'ip',
];

const IDLE_TIMEOUT = 30000; // 30 seconds

export const Terminal: React.FC = () => {
  const fsRef = useRef(createDefaultFileSystem());
  const pmRef = useRef(new ProcessManager());
  const smRef = useRef(new ServiceManager());
  const [cwd, setCwd] = useState('~');
  const [booting, setBooting] = useState(true);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [appArgs, setAppArgs] = useState<Record<string, string>>({});
  const [tabState, setTabState] = useState<{ partial: string; matches: string[]; index: number } | null>(null);
  const [showQuickCmds, setShowQuickCmds] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load saved theme
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Idle timer for screensaver
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (activeApp || booting) return;
    idleTimerRef.current = setTimeout(() => {
      if (!activeApp && !booting) setActiveApp('screensaver');
    }, IDLE_TIMEOUT);
  }, [activeApp, booting]);

  useEffect(() => {
    resetIdleTimer();
    const events = ['keydown', 'mousemove', 'click', 'touchstart'];
    const handler = () => resetIdleTimer();
    events.forEach(e => document.addEventListener(e, handler));
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const exitApp = useCallback(() => {
    setActiveApp(null);
    setAppArgs({});
    resetIdleTimer();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [resetIdleTimer]);

  const handleCommand = useCallback(async (cmd: string) => {
    const trimmedCmd = cmd.trim();

    setCommands(prev => [...prev, { text: `${cwd} $ ${cmd}`, timestamp: new Date(), type: 'input' }]);
    if (trimmedCmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
    setTabState(null);
    resetIdleTimer();

    if (!trimmedCmd) {
      setCurrentCommand('');
      return;
    }

    const result = processCommandWithPipes(trimmedCmd, fsRef.current, {
      isGameActive: activeApp !== null,
      processManager: pmRef.current,
      serviceManager: smRef.current,
    });

    if (result.clear) {
      setCommands([]);
      setCurrentCommand('');
      return;
    }

    // Handle theme change
    if (result.theme) {
      applyTheme(result.theme);
    }

    // Handle app launch
    if (result.launchApp) {
      if (result.output) {
        setCommands(prev => [...prev, { text: result.output, timestamp: new Date(), type: 'output' }]);
      }

      if (result.launchApp === 'exit-glitch') {
        setGlitching(true);
        setCommands(prev => [...prev, {
          text: "Nice try! You can never leave... 😈",
          timestamp: new Date(),
          type: 'error'
        }]);
        setTimeout(() => setGlitching(false), 1500);
      } else {
        setAppArgs(result.launchAppArgs || {});
        setTimeout(() => setActiveApp(result.launchApp!), 100);
      }
      setCurrentCommand('');
      return;
    }

    if (result.launchGame === 'snake') {
      setCommands(prev => [...prev, { text: result.output, timestamp: new Date(), type: 'output' }]);
      setTimeout(() => {
        setActiveApp('snake');
      }, 500);
      setCurrentCommand('');
      return;
    }

    if (result.output) {
      setCommands(prev => [...prev, { text: result.output, timestamp: new Date(), type: result.type }]);
    }

    // Handle async actions (weather)
    if (result.asyncAction) {
      const asyncResult = await result.asyncAction();
      setCommands(prev => [...prev, { text: asyncResult, timestamp: new Date(), type: 'output' }]);
    }

    setCwd(fsRef.current.getDisplayCwd());
    setCurrentCommand('');
  }, [cwd, activeApp, resetIdleTimer]);

  const handleTabComplete = useCallback(() => {
    const input = currentCommand;
    const tokens = input.split(' ');
    const partial = tokens[tokens.length - 1] || '';

    if (tabState && tabState.partial === partial && tabState.matches.length > 1) {
      const nextIndex = (tabState.index + 1) % tabState.matches.length;
      const newTokens = [...tokens];
      newTokens[newTokens.length - 1] = tabState.matches[nextIndex];
      setCurrentCommand(newTokens.join(' '));
      setTabState({ ...tabState, index: nextIndex });
      return;
    }

    try {
      const fs = fsRef.current;
      let searchDir: string;
      let prefix: string;

      if (partial.includes('/')) {
        const lastSlash = partial.lastIndexOf('/');
        searchDir = partial.slice(0, lastSlash + 1) || '/';
        prefix = partial.slice(lastSlash + 1);
      } else {
        searchDir = '.';
        prefix = partial;
      }

      if (tokens.length === 1) {
        const matches = ALL_COMMANDS.filter(c => c.startsWith(prefix.toLowerCase()));
        if (matches.length === 1) {
          setCurrentCommand(matches[0] + ' ');
          setTabState(null);
        } else if (matches.length > 1) {
          setTabState({ partial, matches, index: 0 });
          const newTokens = [...tokens];
          newTokens[newTokens.length - 1] = matches[0];
          setCurrentCommand(newTokens.join(' '));
        }
        return;
      }

      const children = fs.listDir(searchDir === '.' ? undefined : searchDir);
      const matches = children.filter(c => c.toLowerCase().startsWith(prefix.toLowerCase()));

      if (matches.length === 1) {
        const match = matches[0];
        const dirPrefix = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : '';
        const fullMatch = dirPrefix + match;
        const resolved = fs.resolvePath(fullMatch);
        const suffix = fs.isDirectory(resolved) ? '/' : ' ';
        const newTokens = [...tokens];
        newTokens[newTokens.length - 1] = fullMatch + suffix;
        setCurrentCommand(newTokens.join(' '));
        setTabState(null);
      } else if (matches.length > 1) {
        const dirPrefix = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : '';
        const fullMatches = matches.map(m => dirPrefix + m);
        setTabState({ partial, matches: fullMatches, index: 0 });
        const newTokens = [...tokens];
        newTokens[newTokens.length - 1] = fullMatches[0];
        setCurrentCommand(newTokens.join(' '));
      }
    } catch {
      // ignore
    }
  }, [currentCommand, tabState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTabState(null);
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTabState(null);
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setCommands([]);
    } else {
      setTabState(null);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [commands]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Boot sequence
  if (booting) {
    return <BootSequence onComplete={() => {
      setBooting(false);
      setCommands([{
        text: `Welcome to Abhijith V's Interactive Terminal Portfolio
=====================================================
R&D Engineer @appmaker.xyz | 7+ years experience

Type "help" for available commands
Type "ls" to explore the filesystem
Type "theme" to switch color themes`,
        timestamp: new Date(),
        type: 'output'
      }]);
    }} />;
  }

  // Render active fullscreen apps
  const renderActiveApp = () => {
    switch (activeApp) {
      case 'snake':
        return (
          <SnakeGame
            fullscreen={true}
            onGameOver={(score: number) => {
              exitApp();
              setCommands(prev => [...prev, { text: `Game Over! Your score: ${score}`, timestamp: new Date(), type: 'output' }]);
            }}
            onExit={() => {
              exitApp();
              setCommands(prev => [...prev, { text: 'Game exited.', timestamp: new Date(), type: 'output' }]);
            }}
          />
        );
      case 'matrix':
        return <MatrixRain onExit={exitApp} />;
      case 'screensaver':
        return <Screensaver onExit={exitApp} />;
      case 'hack':
        return <HackAnimation onExit={exitApp} />;
      case 'sudo-rm':
        return <SudoRm onExit={exitApp} />;
      case 'top':
        return <TopViewer processManager={pmRef.current} onExit={exitApp} />;
      case 'nano': {
        const filename = appArgs.filename || 'untitled';
        let initialContent = '';
        let readOnly = false;
        try {
          initialContent = fsRef.current.readFile(filename);
        } catch {
          // New file
        }
        // Check if protected
        try {
          fsRef.current.writeFile('__nano_test_' + Date.now(), '');
          fsRef.current.deleteFile('__nano_test_' + Date.now());
        } catch { /* ignore */ }

        const resolved = fsRef.current.resolvePath(filename);
        const node = fsRef.current.getNode(resolved);
        if (node) {
          try {
            // Test write permission by checking if it's protected
            const testContent = initialContent;
            fsRef.current.writeFile(filename, testContent);
            readOnly = false;
          } catch {
            readOnly = true;
          }
        }

        return (
          <NanoEditor
            filename={filename}
            initialContent={initialContent}
            readOnly={readOnly}
            onSave={(content: string) => {
              try {
                fsRef.current.writeFile(filename, content);
                return null;
              } catch (e) {
                return (e as Error).message;
              }
            }}
            onExit={exitApp}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full h-[100dvh] bg-background flex flex-col overflow-hidden transition-all duration-100",
      glitching && "animate-glitch"
    )}>
      {renderActiveApp()}

      {/* Terminal window */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-1 sm:p-2 md:p-4 min-h-0">
        <div className="flex-1 flex flex-col border border-border/60 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,255,100,0.06)] min-h-0">

          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 bg-secondary/60 border-b border-border/40 shrink-0 select-none">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-wider">
                visitor@abhi-portfolio: {cwd}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickCmds(!showQuickCmds); }}
              className="sm:hidden text-muted-foreground hover:text-foreground p-0.5 transition-colors"
              aria-label="Quick commands"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Quick commands bar (mobile) */}
          {showQuickCmds && (
            <div className="sm:hidden flex gap-1.5 px-2 py-2 bg-secondary/40 border-b border-border/30 overflow-x-auto shrink-0 scrollbar-hide">
              {QUICK_COMMANDS.map(({ label, cmd }) => (
                <button
                  key={cmd}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommand(cmd);
                    setShowQuickCmds(false);
                  }}
                  className="shrink-0 px-2.5 py-1 text-[11px] rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 active:bg-primary/35 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Terminal body */}
          <div
            className="flex-1 cursor-text overflow-hidden min-h-0"
            onClick={handleTerminalClick}
          >
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5">
                {commands.map((cmd, index) => (
                  <div key={index}>
                    {cmd.component ? (
                      <div className="my-2">{cmd.component}</div>
                    ) : (
                      <div className={cn(
                        "font-mono text-[11px] sm:text-xs md:text-sm leading-relaxed break-words",
                        cmd.type === 'input' && "text-primary",
                        cmd.type === 'output' && "text-foreground whitespace-pre-wrap",
                        cmd.type === 'error' && "text-destructive"
                      )}>
                        {cmd.text}
                      </div>
                    )}
                  </div>
                ))}

                {!activeApp && (
                  <div className="flex items-center font-mono text-[11px] sm:text-xs md:text-sm">
                    <span className="text-primary shrink-0 mr-1">{cwd}</span>
                    <span className="text-primary shrink-0 mr-1.5">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 min-w-0 bg-transparent outline-none text-foreground caret-primary"
                      autoFocus
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <span className="animate-terminal-blink text-primary shrink-0">_</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Mobile input helpers */}
        {!activeApp && (
          <div className="sm:hidden flex gap-1 px-1 py-1.5 shrink-0">
            <button
              onClick={() => handleCommand('clear')}
              className="px-2 py-1.5 text-[10px] rounded bg-secondary/60 text-muted-foreground border border-border/40 active:bg-secondary transition-colors"
            >
              CLR
            </button>
            <button
              onClick={() => {
                if (historyIndex < commandHistory.length - 1) {
                  const newIndex = historyIndex + 1;
                  setHistoryIndex(newIndex);
                  setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
                }
              }}
              className="px-2 py-1.5 text-[10px] rounded bg-secondary/60 text-muted-foreground border border-border/40 active:bg-secondary transition-colors"
            >
              UP
            </button>
            <button
              onClick={() => {
                if (historyIndex > 0) {
                  const newIndex = historyIndex - 1;
                  setHistoryIndex(newIndex);
                  setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
                } else if (historyIndex === 0) {
                  setHistoryIndex(-1);
                  setCurrentCommand('');
                }
              }}
              className="px-2 py-1.5 text-[10px] rounded bg-secondary/60 text-muted-foreground border border-border/40 active:bg-secondary transition-colors"
            >
              DN
            </button>
            <button
              onClick={handleTabComplete}
              className="px-2 py-1.5 text-[10px] rounded bg-secondary/60 text-muted-foreground border border-border/40 active:bg-secondary transition-colors"
            >
              TAB
            </button>
            <div className="flex-1" />
            <button
              onClick={() => handleCommand(currentCommand)}
              className="px-3 py-1.5 text-[10px] rounded bg-primary/20 text-primary border border-primary/30 active:bg-primary/30 transition-colors font-semibold"
            >
              RUN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

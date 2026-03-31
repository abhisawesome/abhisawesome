import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SnakeGame } from './games/SnakeGame';
import { createDefaultFileSystem } from '@/lib/defaultFileSystem';
import { processCommand } from '@/lib/commandProcessor';

interface Command {
  text: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error';
  component?: React.ReactNode;
}

export const Terminal: React.FC = () => {
  const fsRef = useRef(createDefaultFileSystem());
  const [cwd, setCwd] = useState('~');
  const [commands, setCommands] = useState<Command[]>([
    {
      text: `Initializing terminal...`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `[OK] Terminal v2.0.0 loaded`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `[OK] Virtual filesystem mounted`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `[OK] Portfolio modules loaded`,
      timestamp: new Date(),
      type: 'output'
    },
    {
      text: `
Welcome to Abhijith V's Interactive Terminal Portfolio
=====================================================
R&D Engineer @appmaker.xyz | 7+ years experience

Type "help" for available commands
Type "ls" to explore the filesystem
Type "games" to see available games`,
      timestamp: new Date(),
      type: 'output'
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [tabState, setTabState] = useState<{ partial: string; matches: string[]; index: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();

    // Add command to display
    setCommands(prev => [...prev, { text: `${cwd} $ ${cmd}`, timestamp: new Date(), type: 'input' }]);
    if (trimmedCmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
    setTabState(null);

    if (!trimmedCmd) {
      setCurrentCommand('');
      return;
    }

    const result = processCommand(trimmedCmd, fsRef.current, { isGameActive });

    if (result.clear) {
      setCommands([]);
      setCurrentCommand('');
      return;
    }

    if (result.launchGame === 'snake') {
      setCommands(prev => [...prev, {
        text: result.output,
        timestamp: new Date(),
        type: 'output'
      }]);

      setTimeout(() => {
        setIsGameActive(true);
        const handleGameOver = (score: number) => {
          setIsGameActive(false);
          setCommands(prev => [...prev, {
            text: `Game Over! Your score: ${score}`,
            timestamp: new Date(),
            type: 'output'
          }]);
        };
        const handleExit = () => {
          setIsGameActive(false);
          setCommands(prev => [...prev, {
            text: 'Game exited.',
            timestamp: new Date(),
            type: 'output'
          }]);
        };
        setCommands(prev => [...prev, {
          text: '',
          timestamp: new Date(),
          type: 'output',
          component: (
            <SnakeGame
              fullscreen={true}
              onGameOver={handleGameOver}
              onExit={handleExit}
            />
          )
        }]);
      }, 500);
    } else if (result.output) {
      setCommands(prev => [...prev, {
        text: result.output,
        timestamp: new Date(),
        type: result.type
      }]);
    }

    // Update cwd display
    setCwd(fsRef.current.getDisplayCwd());
    setCurrentCommand('');
  };

  const handleTabComplete = () => {
    const input = currentCommand;
    const tokens = input.split(' ');
    const partial = tokens[tokens.length - 1] || '';

    // If continuing tab completion cycle
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
      // Determine directory to search and prefix typed
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

      // If it's the first token (command name), also include command names
      if (tokens.length === 1) {
        const cmdNames = [
          'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'rmdir', 'cp', 'mv',
          'echo', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'whoami', 'date',
          'clear', 'help', 'about', 'resume', 'skills', 'projects', 'contact',
          'certifications', 'achievements', 'games', 'snake', 'theme', 'neofetch',
          'uname', 'hostname', 'uptime', 'history', 'man', 'which'
        ];
        const matches = cmdNames.filter(c => c.startsWith(prefix.toLowerCase()));
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
      // Silently ignore tab complete errors
    }
  };

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
      // Reset tab state on any other key
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

  // Focus input on terminal click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="w-full h-screen bg-background p-4 overflow-hidden cursor-text"
      onClick={handleTerminalClick}
    >
      <div className="max-w-4xl mx-auto h-full">
        <Card className="h-full flex flex-col border-2 shadow-2xl">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-2">
                {commands.map((cmd, index) => (
                  <div key={index}>
                    {cmd.component ? (
                      <div className="my-2">{cmd.component}</div>
                    ) : (
                      <div className={cn(
                        "font-mono text-sm leading-relaxed",
                        cmd.type === 'input' && "text-primary",
                        cmd.type === 'output' && "text-foreground whitespace-pre-wrap",
                        cmd.type === 'error' && "text-destructive"
                      )}>
                        {cmd.text}
                      </div>
                    )}
                  </div>
                ))}

                {!isGameActive && (
                  <div className="flex items-center font-mono text-sm">
                    <span className="text-primary mr-1">{cwd}</span>
                    <span className="text-primary mr-2">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                      autoFocus
                    />
                    <span className="animate-terminal-blink text-primary">_</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

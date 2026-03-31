import { useState, useEffect, useRef, useCallback } from 'react';

interface NanoEditorProps {
  filename: string;
  initialContent: string;
  readOnly: boolean;
  onSave: (content: string) => string | null; // returns error message or null
  onExit: () => void;
}

export const NanoEditor: React.FC<NanoEditorProps> = ({
  filename,
  initialContent,
  readOnly,
  onSave,
  onExit,
}) => {
  const [content, setContent] = useState(initialContent);
  const [modified, setModified] = useState(false);
  const [statusMsg, setStatusMsg] = useState(readOnly ? '[ Read-Only ]' : '');
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(() => {
    if (readOnly) {
      setStatusMsg('[ Error: File is read-only ]');
      setTimeout(() => setStatusMsg('[ Read-Only ]'), 2000);
      return;
    }
    const err = onSave(content);
    if (err) {
      setStatusMsg(`[ Error: ${err} ]`);
      setTimeout(() => setStatusMsg(''), 2000);
    } else {
      setModified(false);
      setStatusMsg('[ Wrote file ]');
      setTimeout(() => setStatusMsg(''), 2000);
    }
  }, [content, onSave, readOnly]);

  const handleExit = useCallback(() => {
    onExit();
  }, [onExit]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ctrl+X = exit
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleExit();
      }
      // Ctrl+O = save
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+G = help
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        setShowHelp(h => !h);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleExit, handleSave]);

  const lineCount = content.split('\n').length;
  const cursorLine = textareaRef.current
    ? content.substring(0, textareaRef.current.selectionStart).split('\n').length
    : 1;

  if (showHelp) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col font-mono">
        <div className="flex-1 p-4 overflow-auto">
          <div className="text-foreground text-xs sm:text-sm whitespace-pre-wrap">
{`Nano Editor Help
================

Ctrl+X    Exit editor
Ctrl+O    Save file
Ctrl+G    Toggle this help

The editor supports standard text editing.
Use your keyboard to type and edit text.
On mobile, use the buttons at the bottom.

Press Ctrl+G or tap Help to close this help.`}
          </div>
        </div>
        <div className="border-t border-border px-2 py-1">
          <button onClick={() => setShowHelp(false)} className="text-primary text-xs px-2 py-1">
            Close Help
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col font-mono">
      {/* Title bar */}
      <div className="flex items-center justify-center px-3 py-1.5 bg-secondary border-b border-border shrink-0">
        <span className="text-foreground text-[10px] sm:text-xs">
          GNU nano 7.0 {' '} {filename} {modified ? ' (modified)' : ''}
        </span>
      </div>

      {/* Editor area */}
      <div className="flex-1 min-h-0 relative">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-secondary/30 overflow-hidden pointer-events-none">
          <div className="p-2 pt-2">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div
                key={i}
                className={`text-[9px] sm:text-[11px] leading-[1.55] text-right pr-1 ${
                  i + 1 === cursorLine ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            if (!readOnly) {
              setContent(e.target.value);
              setModified(true);
            }
          }}
          readOnly={readOnly}
          className="w-full h-full bg-transparent text-foreground text-[11px] sm:text-sm leading-[1.55] p-2 pl-12 sm:pl-14 outline-none resize-none caret-primary"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      {/* Status line */}
      <div className="px-3 py-0.5 bg-secondary/50 border-t border-border shrink-0">
        <span className={`text-[10px] sm:text-xs ${statusMsg.includes('Error') ? 'text-destructive' : 'text-primary'}`}>
          {statusMsg || `Line ${cursorLine}/${lineCount}`}
        </span>
      </div>

      {/* Shortcut bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-t border-border shrink-0">
        <button onClick={handleExit} className="flex items-center gap-1 px-2 py-1.5 text-[10px] sm:text-xs hover:bg-secondary/50 active:bg-secondary transition-colors">
          <span className="text-primary font-bold">^X</span>
          <span className="text-foreground">Exit</span>
        </button>
        <button onClick={handleSave} className="flex items-center gap-1 px-2 py-1.5 text-[10px] sm:text-xs hover:bg-secondary/50 active:bg-secondary transition-colors">
          <span className="text-primary font-bold">^O</span>
          <span className="text-foreground">Save</span>
        </button>
        <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 px-2 py-1.5 text-[10px] sm:text-xs hover:bg-secondary/50 active:bg-secondary transition-colors">
          <span className="text-primary font-bold">^G</span>
          <span className="text-foreground">Help</span>
        </button>
      </div>
    </div>
  );
};

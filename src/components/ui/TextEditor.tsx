import { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualFileSystem } from '@/lib/virtualFileSystem';

interface TextEditorProps {
  fileSystem: VirtualFileSystem;
  filepath: string;
  onClose: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ fileSystem, filepath, onClose }) => {
  const [content, setContent] = useState('');
  const [modified, setModified] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filename = filepath.split('/').pop() || 'untitled';

  useEffect(() => {
    try {
      const data = fileSystem.readFile(filepath);
      setContent(data);
    } catch {
      setContent('');
    }
    setReadOnly(fileSystem.isProtected(filepath));
  }, [fileSystem, filepath]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = useCallback(() => {
    if (readOnly) {
      setStatusMsg('Permission denied: file is read-only');
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }
    try {
      fileSystem.writeFile(filepath, content);
      setModified(false);
      setStatusMsg('File saved');
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (e) {
      setStatusMsg((e as Error).message);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  }, [readOnly, fileSystem, filepath, content]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSave]);

  return (
    <div className="h-full w-full flex flex-col bg-[#2b2b2b] text-[#d4d4d4] rounded-b-lg overflow-hidden">
      {/* Menu bar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#3c3c3c] border-b border-[#1e1e1e] text-xs shrink-0">
        <button
          onClick={handleSave}
          className={`px-2 py-0.5 rounded transition-colors shrink-0 ${readOnly ? 'text-[#585858] cursor-not-allowed' : 'hover:bg-[#505050]'}`}
          disabled={readOnly}
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-2 py-0.5 hover:bg-[#505050] rounded transition-colors shrink-0"
        >
          Close
        </button>
        <div className="flex-1 min-w-0" />
        <span className={`text-[10px] truncate shrink-0 ${readOnly ? 'text-[#e06c75]' : modified ? 'text-[#e5c07b]' : 'text-[#808080]'}`}>
          {readOnly ? 'Protected' : modified ? 'Modified' : 'Saved'}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] text-xs border-r border-[#1e1e1e] max-w-[80vw]">
          <div className="shrink-0"><FileIcon ext={filename.split('.').pop() || ''} /></div>
          <span className="truncate">{filename}</span>
          {modified && <span className="text-[#e5c07b]">*</span>}
          {readOnly && <span className="text-[#e06c75] text-[9px] ml-1">[RO]</span>}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Line numbers */}
        <div className="w-10 sm:w-12 bg-[#1e1e1e] text-[#858585] text-right pr-2 pt-2 overflow-hidden shrink-0 select-none">
          {content.split('\n').map((_, i) => (
            <div key={i} className="text-[10px] sm:text-xs leading-[1.6]">{i + 1}</div>
          ))}
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
          className={`flex-1 bg-[#1e1e1e] text-[#d4d4d4] text-xs sm:text-sm font-mono leading-[1.6] p-2 outline-none resize-none caret-[#aeafad] ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      {/* Status bar */}
      <div className={`flex items-center justify-between px-3 py-0.5 text-white text-[10px] shrink-0 ${readOnly ? 'bg-[#e06c75]' : 'bg-[#007acc]'}`}>
        <span>{statusMsg || (readOnly ? 'PROTECTED FILE — Read Only' : 'Ctrl+S to save')}</span>
        <span>Ln {content.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}, Col 1</span>
      </div>
    </div>
  );
};

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    txt: '#ababab',
    md: '#519aba',
    json: '#cbcb41',
    ts: '#519aba',
    tsx: '#519aba',
    js: '#cbcb41',
    css: '#563d7c',
  };
  const color = colors[ext] || '#ababab';
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill={color}>
      <path d="M13 1H5L3 3v10a1 1 0 001 1h9a1 1 0 001-1V2a1 1 0 00-1-1zm-1 11H6V4h4v2h2v6z" />
    </svg>
  );
}

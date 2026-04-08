import { useState, useEffect, useCallback } from 'react';
import { VirtualFileSystem } from '@/lib/virtualFileSystem';
import { cn } from '@/lib/utils';
import {
  Folder, FileText, FileCode, File, ChevronRight, ArrowUp, Home, RefreshCw,
} from 'lucide-react';

interface FileManagerProps {
  fileSystem: VirtualFileSystem;
  onOpenFile: (filepath: string) => void;
  onClose: () => void;
  initialPath?: string;
}

interface FileEntry {
  name: string;
  isDir: boolean;
  size: number;
  path: string;
}

function getIcon(name: string, isDir: boolean) {
  if (isDir) return Folder;
  const ext = name.split('.').pop() || '';
  if (['json', 'js', 'ts', 'tsx'].includes(ext)) return FileCode;
  if (['txt', 'md'].includes(ext)) return FileText;
  return File;
}

function getIconColor(name: string, isDir: boolean) {
  if (isDir) return 'text-yellow-400';
  const ext = name.split('.').pop() || '';
  if (['json'].includes(ext)) return 'text-yellow-300';
  if (['js', 'ts', 'tsx'].includes(ext)) return 'text-blue-300';
  if (['md'].includes(ext)) return 'text-cyan-300';
  if (['txt'].includes(ext)) return 'text-neutral-300';
  return 'text-neutral-400';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileManager: React.FC<FileManagerProps> = ({ fileSystem, onOpenFile, initialPath }) => {
  const [currentPath, setCurrentPath] = useState(initialPath || '/home/visitor');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const refreshEntries = useCallback(() => {
    try {
      const children = fileSystem.listDir(currentPath);
      const fileEntries: FileEntry[] = children.map(name => {
        const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        const node = fileSystem.getNode(fullPath);
        const isDir = node?.type === 'directory';
        const size = node?.type === 'file' ? node.content.length : 0;
        return { name, isDir, size, path: fullPath };
      });
      // Sort: dirs first, then files, alphabetically
      fileEntries.sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(fileEntries);
    } catch {
      setEntries([]);
    }
  }, [fileSystem, currentPath]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  // Refresh periodically
  useEffect(() => {
    const interval = setInterval(refreshEntries, 2000);
    return () => clearInterval(interval);
  }, [refreshEntries]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedEntry(null);
  };

  const goUp = () => {
    if (currentPath === '/') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    navigateTo(parent);
  };

  const goHome = () => {
    navigateTo('/home/visitor');
  };

  const handleOpen = (entry: FileEntry) => {
    if (entry.isDir) {
      navigateTo(entry.path);
    } else {
      onOpenFile(entry.path);
    }
  };

  const breadcrumbs = currentPath === '/' ? ['/'] : currentPath.split('/').filter(Boolean);
  const displayPath = currentPath === '/home/visitor' ? '~'
    : currentPath.startsWith('/home/visitor/') ? '~' + currentPath.slice('/home/visitor'.length)
    : currentPath;

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e2e] text-[#cdd6f4] rounded-b-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#181825] border-b border-[#313244] shrink-0">
        <button
          onClick={goUp}
          className="p-1 hover:bg-[#313244] rounded transition-colors"
          title="Go up"
          disabled={currentPath === '/'}
        >
          <ArrowUp className={cn("w-4 h-4", currentPath === '/' ? 'text-[#585b70]' : 'text-[#cdd6f4]')} />
        </button>
        <button onClick={goHome} className="p-1 hover:bg-[#313244] rounded transition-colors" title="Home">
          <Home className="w-4 h-4" />
        </button>
        <button onClick={refreshEntries} className="p-1 hover:bg-[#313244] rounded transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Path breadcrumb */}
        <div className="flex-1 flex items-center gap-0.5 mx-1 sm:mx-2 px-2 py-0.5 bg-[#11111b] rounded text-xs overflow-x-auto scrollbar-hide min-w-0">
          {currentPath === '/' ? (
            <span className="text-[#a6adc8]">/</span>
          ) : (
            breadcrumbs.map((part, i) => {
              const path = '/' + breadcrumbs.slice(0, i + 1).join('/');
              return (
                <span key={i} className="flex items-center shrink-0">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-[#585b70] mx-0.5" />}
                  <button
                    onClick={() => navigateTo(path)}
                    className="hover:text-[#89b4fa] transition-colors truncate max-w-[80px]"
                  >
                    {part}
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* View toggle */}
        <div className="flex border border-[#313244] rounded overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={cn("px-1.5 py-0.5 text-[10px]", viewMode === 'list' ? 'bg-[#313244]' : 'hover:bg-[#313244]/50')}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn("px-1.5 py-0.5 text-[10px]", viewMode === 'grid' ? 'bg-[#313244]' : 'hover:bg-[#313244]/50')}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden sm:flex w-40 flex-col border-r border-[#313244] bg-[#181825] shrink-0 py-2">
          <div className="px-3 text-[10px] text-[#585b70] uppercase tracking-wider mb-1">Places</div>
          {[
            { label: 'Home', path: '/home/visitor' },
            { label: 'Desktop', path: '/home/visitor/Desktop' },
            { label: 'Projects', path: '/home/visitor/projects' },
            { label: 'Certificates', path: '/home/visitor/certificates' },
            { label: 'Root', path: '/' },
            { label: 'Etc', path: '/etc' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={cn(
                "flex items-center gap-2 px-3 py-1 text-xs text-left hover:bg-[#313244]/50 transition-colors",
                currentPath === item.path && 'bg-[#313244] text-[#89b4fa]'
              )}
            >
              <Folder className="w-3.5 h-3.5 text-yellow-400" />
              {item.label}
            </button>
          ))}
        </div>

        {/* File list / grid */}
        <div className="flex-1 overflow-auto">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#585b70] text-sm">
              Empty directory
            </div>
          ) : viewMode === 'list' ? (
            <div>
              {/* List header */}
              <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-[#585b70] uppercase tracking-wider border-b border-[#313244] sticky top-0 bg-[#1e1e2e]">
                <span className="flex-1">Name</span>
                <span className="w-16 text-right hidden sm:block">Size</span>
                <span className="w-20 text-right hidden sm:block">Type</span>
              </div>
              {entries.map(entry => {
                const Icon = getIcon(entry.name, entry.isDir);
                const color = getIconColor(entry.name, entry.isDir);
                return (
                  <button
                    key={entry.name}
                    onClick={() => setSelectedEntry(entry.name)}
                    onDoubleClick={() => handleOpen(entry)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 w-full text-left text-xs hover:bg-[#313244]/40 transition-colors",
                      selectedEntry === entry.name && 'bg-[#313244]/70'
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", color)} />
                    <span className="flex-1 truncate">{entry.name}{entry.isDir ? '/' : ''}</span>
                    <span className="w-16 text-right text-[#585b70] hidden sm:block">
                      {entry.isDir ? '-' : formatSize(entry.size)}
                    </span>
                    <span className="w-20 text-right text-[#585b70] hidden sm:block">
                      {entry.isDir ? 'Folder' : entry.name.split('.').pop()?.toUpperCase() || 'File'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 p-2">
              {entries.map(entry => {
                const Icon = getIcon(entry.name, entry.isDir);
                const color = getIconColor(entry.name, entry.isDir);
                return (
                  <button
                    key={entry.name}
                    onClick={() => setSelectedEntry(entry.name)}
                    onDoubleClick={() => handleOpen(entry)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#313244]/40 transition-colors",
                      selectedEntry === entry.name && 'bg-[#313244]/70'
                    )}
                  >
                    <Icon className={cn("w-8 h-8 sm:w-10 sm:h-10", color)} />
                    <span className="text-[10px] sm:text-xs text-center leading-tight truncate w-full">
                      {entry.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#181825] border-t border-[#313244] text-[10px] text-[#585b70] shrink-0">
        <span>{displayPath}</span>
        <span>{entries.length} item{entries.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

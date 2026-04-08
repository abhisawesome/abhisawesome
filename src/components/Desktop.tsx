import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal } from './Terminal';
import { TextEditor } from './ui/TextEditor';
import { FileManager } from './ui/FileManager';
import { Browser } from './ui/Browser';
import { Terminal as TerminalIcon, Power, FileText, FileCode, File, FolderOpen, Globe, Shield, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createDefaultFileSystem } from '@/lib/defaultFileSystem';
import { VirtualFileSystem } from '@/lib/virtualFileSystem';
import { ProcessManager } from '@/lib/processManager';
import { ServiceManager } from '@/lib/serviceManager';

interface WindowState {
  id: string;
  type: 'terminal' | 'editor' | 'filemanager' | 'browser';
  title: string;
  minimized: boolean;
  maximized: boolean;
  filepath?: string;
  url?: string;
  zIndex: number;
  x: number; y: number; w: number; h: number;
}

interface ContextMenu {
  x: number; y: number;
  items: { label: string; action: () => void; danger?: boolean; separator?: boolean }[];
}

const FILE_ICONS: Record<string, typeof FileText> = { txt: FileText, md: FileText, json: FileCode, default: File };
const FILE_ICON_COLORS: Record<string, string> = { txt: 'text-blue-300', md: 'text-cyan-300', json: 'text-yellow-300', default: 'text-neutral-300' };
function getFileIcon(f: string) { const e = f.split('.').pop() || ''; return FILE_ICONS[e] || FILE_ICONS.default; }
function getFileIconColor(f: string) { const e = f.split('.').pop() || ''; return FILE_ICON_COLORS[e] || FILE_ICON_COLORS.default; }

function isMobile() { return window.innerWidth < 640; }

function getDefaultRect(type: string, offset: number) {
  const vw = window.innerWidth, vh = window.innerHeight;
  if (isMobile()) return { x: 0, y: 0, w: vw, h: vh - 52 }; // full area minus dock
  const w = type === 'browser' ? Math.min(900, vw * 0.65) : Math.min(800, vw * 0.6);
  const h = type === 'browser' ? Math.min(650, vh * 0.75) : Math.min(550, vh * 0.7);
  return { x: Math.max(40, (vw - w) / 2 + offset * 30), y: Math.max(40, (vh - h) / 2 + offset * 25), w, h };
}

export const Desktop = () => {
  const fsRef = useRef<VirtualFileSystem>(createDefaultFileSystem());
  const pmRef = useRef(new ProcessManager());
  const smRef = useRef(new ServiceManager());

  const [windows, setWindows] = useState<WindowState[]>(() => {
    const r = getDefaultRect('terminal', 0);
    return [{ id: 'terminal-1', type: 'terminal', title: 'Terminal', minimized: false, maximized: isMobile(), zIndex: 1, ...r }];
  });
  const [nextZIndex, setNextZIndex] = useState(2);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [desktopFiles, setDesktopFiles] = useState<string[]>([]);
  const [showActivities, setShowActivities] = useState(false);
  const [windowCount, setWindowCount] = useState(1);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [locked, setLocked] = useState(false);
  const [loginTime, setLoginTime] = useState(new Date());

  const dragRef = useRef<{ id: string; startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ id: string; edge: string; startX: number; startY: number; winX: number; winY: number; winW: number; winH: number } | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const refreshDesktopFiles = useCallback(() => {
    try { setDesktopFiles(fsRef.current.listDir('/home/visitor/Desktop')); } catch { setDesktopFiles([]); }
  }, []);
  useEffect(() => { refreshDesktopFiles(); }, [refreshDesktopFiles]);
  useEffect(() => { const i = setInterval(refreshDesktopFiles, 2000); return () => clearInterval(i); }, [refreshDesktopFiles]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('touchstart', close);
    return () => { window.removeEventListener('click', close); window.removeEventListener('touchstart', close); };
  }, []);

  // Drag & resize (desktop only)
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (dragRef.current) {
        const d = dragRef.current;
        setWindows(prev => prev.map(w => w.id === d.id ? { ...w, x: d.winX + cx - d.startX, y: Math.max(0, d.winY + cy - d.startY) } : w));
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = cx - r.startX, dy = cy - r.startY;
        setWindows(prev => prev.map(w => {
          if (w.id !== r.id) return w;
          let { x, y, w: ww, h } = { x: r.winX, y: r.winY, w: r.winW, h: r.winH };
          if (r.edge.includes('e')) ww = Math.max(300, r.winW + dx);
          if (r.edge.includes('s')) h = Math.max(200, r.winH + dy);
          if (r.edge.includes('w')) { const nw = Math.max(300, r.winW - dx); x = r.winX + (r.winW - nw); ww = nw; }
          if (r.edge.includes('n')) { const nh = Math.max(200, r.winH - dy); y = Math.max(0, r.winY + (r.winH - nh)); h = nh; }
          return { ...w, x, y, w: ww, h };
        }));
      }
    };
    const onUp = () => { dragRef.current = null; resizeRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const bringToFront = (id: string) => { setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w)); setNextZIndex(n => n + 1); };
  const closeWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));
  const minimizeWindow = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  const toggleMaximize = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => { if (w.id !== id) return w; return w.minimized ? { ...w, minimized: false, zIndex: nextZIndex } : { ...w, minimized: true }; }));
    setNextZIndex(n => n + 1);
  };

  const createWindow = (type: WindowState['type'], title: string, filepath?: string, url?: string) => {
    const existing = windows.find(w => w.type === type && (type !== 'editor' || w.filepath === filepath) && (type !== 'browser' || w.url === url));
    if (existing) { setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, minimized: false, zIndex: nextZIndex } : w)); setNextZIndex(n => n + 1); return; }
    const r = getDefaultRect(type, windowCount % 5);
    setWindowCount(c => c + 1);
    // Auto-maximize on mobile
    const maximized = isMobile();
    setWindows(prev => [...prev, { id: `${type}-${Date.now()}`, type, title, minimized: false, maximized, filepath, url, zIndex: nextZIndex, ...r }]);
    setNextZIndex(n => n + 1);
  };

  const openTerminal = () => createWindow('terminal', 'Terminal');
  const openFileManager = (p?: string) => createWindow('filemanager', 'Files', p || '/home/visitor');
  const openBrowser = () => createWindow('browser', 'Browser');
  const openBrowserWithUrl = (title: string, url: string) => createWindow('browser', title, undefined, url);
  const openFileInEditor = (filepath: string) => createWindow('editor', filepath.split('/').pop() || 'file', filepath);

  const startDrag = (id: string, e: React.MouseEvent) => {
    if (isMobile()) return; // No dragging on mobile
    const win = windows.find(w => w.id === id);
    if (!win || win.maximized) return;
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    bringToFront(id);
  };

  const startResize = (id: string, edge: string, e: React.MouseEvent) => {
    if (isMobile()) return;
    e.preventDefault(); e.stopPropagation();
    const win = windows.find(w => w.id === id);
    if (!win || win.maximized) return;
    resizeRef.current = { id, edge, startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y, winW: win.w, winH: win.h };
    bringToFront(id);
  };

  // Long press for context menu on mobile
  const startLongPress = (callback: (x: number, y: number) => void) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const x = touch.clientX, y = touch.clientY;
        longPressRef.current = setTimeout(() => {
          callback(x, y);
        }, 500);
      },
      onTouchEnd: () => { if (longPressRef.current) clearTimeout(longPressRef.current); },
      onTouchMove: () => { if (longPressRef.current) clearTimeout(longPressRef.current); },
    };
  };

  // Context menu builders
  const showDesktopContextAt = (x: number, y: number) => {
    setContextMenu({
      x, y,
      items: [
        { label: 'New File...', action: () => {
          const name = prompt('File name:');
          if (name) { try { fsRef.current.writeFile(`/home/visitor/Desktop/${name}`, ''); refreshDesktopFiles(); } catch { /* */ } }
        }},
        { label: 'New Folder...', action: () => {
          const name = prompt('Folder name:');
          if (name) { try { fsRef.current.mkdir(`/home/visitor/Desktop/${name}`); refreshDesktopFiles(); } catch { /* */ } }
        }},
        { label: '', action: () => {}, separator: true },
        { label: 'Open Terminal Here', action: openTerminal },
        { label: 'Open File Manager', action: () => openFileManager('/home/visitor/Desktop') },
        { label: '', action: () => {}, separator: true },
        { label: 'Refresh Desktop', action: refreshDesktopFiles },
      ],
    });
  };
  const showDesktopContext = (e: React.MouseEvent) => { e.preventDefault(); showDesktopContextAt(e.clientX, e.clientY); };

  const showFileContextAt = (x: number, y: number, filename: string) => {
    const filepath = `/home/visitor/Desktop/${filename}`;
    const isDir = fsRef.current.isDirectory(filepath);
    const isProtected = fsRef.current.isProtected(filepath);
    const items: ContextMenu['items'] = [];
    if (isDir) {
      items.push({ label: 'Open', action: () => openFileManager(filepath) });
      items.push({ label: 'Open in Terminal', action: openTerminal });
    } else {
      items.push({ label: 'Open', action: () => openFileInEditor(filepath) });
    }
    items.push({ label: '', action: () => {}, separator: true });
    if (!isProtected) {
      items.push({ label: 'Rename...', action: () => {
        const newName = prompt('New name:', filename);
        if (newName && newName !== filename) {
          try { fsRef.current.move(filepath, `/home/visitor/Desktop/${newName}`); refreshDesktopFiles(); } catch (err) { alert((err as Error).message); }
        }
      }});
      items.push({ label: 'Delete', danger: true, action: () => {
        if (confirm(`Delete "${filename}"?`)) {
          try { if (isDir) fsRef.current.deleteRecursive(filepath); else fsRef.current.deleteFile(filepath); refreshDesktopFiles(); } catch (err) { alert((err as Error).message); }
        }
      }});
      items.push({ label: '', action: () => {}, separator: true });
    }
    items.push({ label: 'Properties', action: () => {
      const node = fsRef.current.getNode(filepath);
      if (!node) return;
      const info = node.type === 'file'
        ? `Name: ${filename}\nType: File\nSize: ${node.content.length} bytes\nPermissions: ${VirtualFileSystem.modeToString(node.mode, false)}\nProtected: ${isProtected ? 'Yes' : 'No'}`
        : `Name: ${filename}\nType: Folder\nPermissions: ${VirtualFileSystem.modeToString(node.mode, true)}\nProtected: ${isProtected ? 'Yes' : 'No'}`;
      alert(info);
    }});
    setContextMenu({ x, y, items });
  };
  const showFileContext = (e: React.MouseEvent, filename: string) => { e.preventDefault(); e.stopPropagation(); showFileContextAt(e.clientX, e.clientY, filename); };

  const showAppContextAt = (x: number, y: number, appName: string, action: () => void) => {
    setContextMenu({ x, y, items: [
      { label: 'Open', action },
      { label: 'Properties', action: () => alert(`${appName}\nType: Application\nVersion: 2.0.0`) },
    ]});
  };
  const showAppContext = (e: React.MouseEvent, appName: string, action: () => void) => { e.preventDefault(); e.stopPropagation(); showAppContextAt(e.clientX, e.clientY, appName, action); };

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleUnlock = () => setLocked(false);

  useEffect(() => {
    if (locked) { const t = setInterval(() => setLoginTime(new Date()), 1000); return () => clearInterval(t); }
  }, [locked]);

  // Lock screen
  if (locked) {
    return (
      <div className="w-full h-[100dvh] overflow-hidden flex flex-col relative text-white select-none cursor-pointer"
        onClick={handleUnlock} onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }} tabIndex={0}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1b2838 0%, #223049 30%, #2a4158 55%, #1e3a50 75%, #152a3a 100%)' }} />
          <div className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #3b6fa0 0%, transparent 70%)', top: '-15%', right: '-10%' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #2d5a7b 0%, transparent 70%)', bottom: '-10%', left: '-5%' }} />
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4">
          <div className="text-center mb-2 sm:mb-4">
            <div className="text-5xl sm:text-8xl font-light tracking-tight">{loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-base sm:text-xl text-white/60 mt-1 sm:mt-2">{loginTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#3b6fa0] to-[#2a4158] flex items-center justify-center border-2 border-white/20 shadow-lg">
            <span className="text-2xl sm:text-4xl font-semibold">A</span>
          </div>
          <div className="text-lg sm:text-2xl font-medium">Abhijith V</div>
          <button onClick={handleUnlock} autoFocus className="px-6 sm:px-8 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 rounded-full text-sm transition-colors backdrop-blur-md">
            Click to Unlock
          </button>
          <p className="text-white/30 text-[10px] sm:text-xs mt-2 sm:mt-4">Click anywhere or press Enter to unlock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden flex flex-col relative text-white select-none"
      onContextMenu={(e) => e.preventDefault()}>
      {/* Wallpaper */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1b2838 0%, #223049 30%, #2a4158 55%, #1e3a50 75%, #152a3a 100%)' }} />
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #3b6fa0 0%, transparent 70%)', top: '-15%', right: '-10%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #2d5a7b 0%, transparent 70%)', bottom: '-10%', left: '-5%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]" style={{ background: 'radial-gradient(circle, #4a8ab5 0%, transparent 70%)', top: '40%', left: '30%' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '128px 128px' }} />
      </div>

      {/* Top Bar */}
      <div className="relative z-50 h-7 sm:h-8 bg-black/70 backdrop-blur-xl flex items-center px-2 sm:px-4 text-xs shrink-0">
        <button onClick={() => setShowActivities(!showActivities)} className="px-2 sm:px-3 py-0.5 hover:bg-white/10 active:bg-white/20 rounded transition-colors font-medium text-[11px] sm:text-xs">Activities</button>
        <div className="flex-1 text-center"><span className="text-[11px] sm:text-xs font-medium cursor-default">{formatDate(currentTime)} {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-neutral-300">
          <span className="hidden sm:inline">visitor</span>
          <button className="p-1 hover:bg-white/10 active:bg-white/20 rounded transition-colors" onClick={() => setLocked(true)}>
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="relative flex-1 min-h-0" onClick={() => setSelectedIcon(null)} onContextMenu={showDesktopContext}
        {...startLongPress((x, y) => showDesktopContextAt(x, y))}>
        {/* Desktop Icons - horizontal grid on mobile, vertical column on desktop */}
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto flex flex-row flex-wrap sm:flex-col gap-1 z-10">
          {/* App icons */}
          {[
            { label: 'Terminal', icon: TerminalIcon, color: 'text-green-400', action: openTerminal },
            { label: 'Files', icon: FolderOpen, color: 'text-yellow-400', action: () => openFileManager() },
            { label: 'Browser', icon: Globe, color: 'text-blue-400', action: openBrowser },
            { label: 'ProxyHub', icon: Shield, color: 'text-purple-400', action: () => openBrowserWithUrl('ProxyHub', 'proxyhub.app') },
            { label: 'dir-serve', icon: Package, color: 'text-orange-400', action: () => openBrowserWithUrl('directory-serve', 'github.com/cube-root/directory-serve') },
          ].map(item => (
            <button key={item.label}
              onClick={(e) => { e.stopPropagation(); setSelectedIcon(item.label); if (isMobile()) item.action(); }}
              onDoubleClick={item.action}
              onContextMenu={(e) => showAppContext(e, item.label, item.action)}
              {...startLongPress((x, y) => showAppContextAt(x, y, item.label, item.action))}
              className={cn(
                "flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg transition-colors group w-14 sm:w-20",
                selectedIcon === item.label ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15'
              )}>
              <div className="p-1.5 sm:p-2.5 bg-neutral-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/5">
                <item.icon className={cn("w-5 h-5 sm:w-7 sm:h-7", item.color)} />
              </div>
              <span className="text-[9px] sm:text-xs text-white/90 drop-shadow-md text-center leading-tight">{item.label}</span>
            </button>
          ))}

          {desktopFiles.map(file => {
            const isDir = fsRef.current.isDirectory(`/home/visitor/Desktop/${file}`);
            const Icon = isDir ? FolderOpen : getFileIcon(file);
            const color = isDir ? 'text-yellow-400' : getFileIconColor(file);
            const openAction = isDir ? () => openFileManager(`/home/visitor/Desktop/${file}`) : () => openFileInEditor(`/home/visitor/Desktop/${file}`);
            return (
              <button key={file}
                onClick={(e) => { e.stopPropagation(); setSelectedIcon(file); if (isMobile()) openAction(); }}
                onDoubleClick={openAction}
                onContextMenu={(e) => showFileContext(e, file)}
                {...startLongPress((x, y) => showFileContextAt(x, y, file))}
                className={cn(
                  "flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg transition-colors group w-14 sm:w-20",
                  selectedIcon === file ? 'bg-white/20' : 'hover:bg-white/10 active:bg-white/15'
                )}>
                <div className="p-1.5 sm:p-2.5 bg-neutral-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/5">
                  <Icon className={cn("w-5 h-5 sm:w-7 sm:h-7", color)} />
                </div>
                <span className="text-[9px] sm:text-xs text-white/90 drop-shadow-md text-center leading-tight truncate w-full">{file}</span>
              </button>
            );
          })}
        </div>

        {/* Windows */}
        {windows.map(win => {
          if (win.minimized) return null;
          const isMax = win.maximized || isMobile(); // Always maximized on mobile
          return (
            <div key={win.id}
              className={cn("absolute flex flex-col", isMax ? "rounded-none" : "rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10")}
              style={isMax ? { inset: 0, zIndex: win.zIndex } : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex }}
              onMouseDown={() => bringToFront(win.id)}>
              {/* Resize edges - desktop only */}
              {!isMax && !isMobile() && <>
                <div className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-20" onMouseDown={(e) => startResize(win.id, 'n', e)} />
                <div className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-20" onMouseDown={(e) => startResize(win.id, 's', e)} />
                <div className="absolute top-0 left-0 bottom-0 w-1 cursor-w-resize z-20" onMouseDown={(e) => startResize(win.id, 'w', e)} />
                <div className="absolute top-0 right-0 bottom-0 w-1 cursor-e-resize z-20" onMouseDown={(e) => startResize(win.id, 'e', e)} />
                <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-30" onMouseDown={(e) => startResize(win.id, 'nw', e)} />
                <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-30" onMouseDown={(e) => startResize(win.id, 'ne', e)} />
                <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-30" onMouseDown={(e) => startResize(win.id, 'sw', e)} />
                <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30" onMouseDown={(e) => startResize(win.id, 'se', e)} />
              </>}
              {/* Title bar */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#2d2d2d] border-b border-[#1a1a1a] shrink-0 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; startDrag(win.id, e); }}
                onDoubleClick={() => { if (!isMobile()) toggleMaximize(win.id); }}>
                <div className="flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-3 h-3 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all focus:outline-none" />
                  <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="w-3 h-3 sm:w-3 sm:h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all focus:outline-none" />
                  <button onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} className="w-3 h-3 sm:w-3 sm:h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all focus:outline-none hidden sm:block" />
                </div>
                <div className="flex-1 text-center pointer-events-none min-w-0">
                  <span className="text-[10px] sm:text-xs text-neutral-400 truncate block">
                    {win.type === 'terminal' ? 'Terminal' : win.type === 'filemanager' ? 'Files' : win.type === 'browser' ? (win.title || 'Browser') : win.title}
                  </span>
                </div>
                <div className="w-8 sm:w-12" />
              </div>
              {/* Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {win.type === 'terminal' ? (
                  <Terminal onClose={() => closeWindow(win.id)} onMinimize={() => minimizeWindow(win.id)} onMaximize={() => toggleMaximize(win.id)}
                    fileSystem={fsRef.current} processManager={pmRef.current} serviceManager={smRef.current} />
                ) : win.type === 'editor' && win.filepath ? (
                  <TextEditor fileSystem={fsRef.current} filepath={win.filepath} onClose={() => closeWindow(win.id)} />
                ) : win.type === 'filemanager' ? (
                  <FileManager fileSystem={fsRef.current} initialPath={win.filepath} onOpenFile={(fp) => openFileInEditor(fp)} onClose={() => closeWindow(win.id)} />
                ) : win.type === 'browser' ? (
                  <Browser onClose={() => closeWindow(win.id)} initialUrl={win.url} />
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Activities */}
        {showActivities && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4" onClick={() => setShowActivities(false)}>
            <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
              {windows.map(win => (
                <button key={win.id} onClick={(e) => {
                  e.stopPropagation();
                  setWindows(prev => prev.map(w => w.id === win.id ? { ...w, minimized: false, zIndex: nextZIndex } : w));
                  setNextZIndex(n => n + 1); setShowActivities(false);
                }} className="w-28 h-20 sm:w-48 sm:h-32 bg-neutral-800/80 rounded-lg border border-white/10 hover:border-white/30 active:bg-neutral-700/80 transition-all flex items-center justify-center flex-col gap-1 sm:gap-2">
                  {win.type === 'terminal' ? <TerminalIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                    : win.type === 'filemanager' ? <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                    : win.type === 'browser' ? <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    : <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300" />}
                  <span className="text-[10px] sm:text-xs text-neutral-300 truncate max-w-full px-1">{win.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed z-[99999] bg-[#2d2d2d] border border-[#404040] rounded-lg shadow-2xl shadow-black/60 py-1 min-w-[160px] sm:min-w-[180px] text-xs"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 180), top: Math.min(contextMenu.y, window.innerHeight - 250) }}
          onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          {contextMenu.items.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 border-t border-[#404040]" />
            ) : (
              <button key={i}
                onClick={() => { item.action(); setContextMenu(null); }}
                className={cn(
                  "w-full text-left px-3 py-2 sm:py-1.5 transition-colors",
                  item.danger ? 'text-red-400 hover:bg-red-500/20 active:bg-red-500/30' : 'text-[#ccc] hover:bg-white/10 active:bg-white/15'
                )}>
                {item.label}
              </button>
            )
          )}
        </div>
      )}

      {/* Dock */}
      <div className="relative z-50 flex justify-center py-1 sm:py-2 shrink-0">
        <div className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 bg-black/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide max-w-[95vw]">
          {[
            { type: 'terminal' as const, icon: TerminalIcon, color: 'text-green-400', action: openTerminal, label: 'Terminal' },
            { type: 'filemanager' as const, icon: FolderOpen, color: 'text-yellow-400', action: () => openFileManager(), label: 'Files' },
            { type: 'browser' as const, icon: Globe, color: 'text-blue-400', action: openBrowser, label: 'Browser' },
          ].map(item => (
            <button key={item.type} onClick={item.action} className="relative p-1.5 sm:p-2 hover:bg-white/10 active:bg-white/15 rounded-lg sm:rounded-xl transition-all group shrink-0" title={item.label}>
              <item.icon className={cn("w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform", item.color)} />
              {windows.some(w => w.type === item.type && !w.minimized) && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />}
            </button>
          ))}
          {windows.filter(w => w.type === 'editor').length > 0 && <div className="w-px h-5 sm:h-7 bg-white/10 mx-0.5 shrink-0" />}
          {windows.filter(w => w.type === 'editor').map(win => {
            const Icon = getFileIcon(win.title);
            const color = getFileIconColor(win.title);
            return (
              <button key={win.id} onClick={() => toggleMinimize(win.id)} className="relative p-1.5 sm:p-2 hover:bg-white/10 active:bg-white/15 rounded-lg sm:rounded-xl transition-all group shrink-0" title={win.title}>
                <Icon className={cn("w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform", color)} />
                {!win.minimized && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';

interface SudoRmProps {
  onExit: () => void;
}

const FAKE_PATHS = [
  '/usr/bin/bash', '/usr/lib/libcrypto.so', '/etc/passwd', '/var/log/syslog',
  '/home/visitor/about.txt', '/home/visitor/resume.txt', '/usr/share/fonts/',
  '/boot/vmlinuz', '/dev/sda1', '/proc/cpuinfo', '/sys/kernel/',
  '/opt/portfolio/', '/home/visitor/skills.json', '/usr/local/bin/node',
  '/home/visitor/projects/', '/etc/hosts', '/usr/bin/python3',
  '/var/www/html/', '/tmp/.X11-unix/', '/root/.bashrc', '/mnt/data/',
  '/srv/http/', '/usr/sbin/sshd', '/lib/modules/', '/snap/core/',
];

export const SudoRm: React.FC<SudoRmProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<'deleting' | 'glitch' | 'black' | 'restore'>('deleting');
  const [lines, setLines] = useState<string[]>([]);
  const [glitchStyle, setGlitchStyle] = useState({});
  const exitedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const exit = useCallback(() => {
    if (!exitedRef.current) {
      exitedRef.current = true;
      onExit();
    }
  }, [onExit]);

  // Deleting phase
  useEffect(() => {
    if (phase !== 'deleting') return;
    let i = 0;
    const interval = setInterval(() => {
      if (exitedRef.current) { clearInterval(interval); return; }
      if (i < FAKE_PATHS.length) {
        setLines(prev => [...prev.slice(-20), `rm: removing '${FAKE_PATHS[i]}'`]);
        i++;
      } else {
        clearInterval(interval);
        setPhase('glitch');
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Glitch phase
  useEffect(() => {
    if (phase !== 'glitch') return;
    let count = 0;
    const interval = setInterval(() => {
      if (exitedRef.current) { clearInterval(interval); return; }
      setGlitchStyle({
        transform: `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) skew(${(Math.random() - 0.5) * 10}deg)`,
        filter: `hue-rotate(${Math.random() * 360}deg) brightness(${0.5 + Math.random()})`,
      });
      count++;
      if (count > 15) {
        clearInterval(interval);
        setPhase('black');
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Black phase
  useEffect(() => {
    if (phase !== 'black') return;
    const t = setTimeout(() => {
      if (!exitedRef.current) setPhase('restore');
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Restore phase
  useEffect(() => {
    if (phase !== 'restore') return;
    const t = setTimeout(() => exit(), 2500);
    return () => clearTimeout(t);
  }, [phase, exit]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  if (phase === 'black') {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-red-500 font-mono text-lg sm:text-2xl animate-pulse">
          System destroyed.
        </div>
      </div>
    );
  }

  if (phase === 'restore') {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-green-500 font-mono text-sm sm:text-lg">
          Just kidding! Restoring system...
        </div>
        <div className="text-green-700 font-mono text-xs sm:text-sm animate-pulse">
          [████████████████████████] 100%
        </div>
        <div className="text-green-600 font-mono text-[10px] sm:text-xs mt-2">
          Nice try though :)
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black" style={phase === 'glitch' ? glitchStyle : {}}>
      <div ref={containerRef} className="h-full overflow-auto p-3 font-mono">
        <div className="text-red-500 text-xs sm:text-sm mb-2">
          [sudo] password for visitor: ********
        </div>
        <div className="text-red-400 text-xs sm:text-sm mb-2">
          WARNING: Recursive deletion of root filesystem initiated!
        </div>
        {lines.map((line, i) => (
          <div key={i} className="text-red-600/80 text-[10px] sm:text-xs">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

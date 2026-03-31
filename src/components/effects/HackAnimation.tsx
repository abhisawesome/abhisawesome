import { useState, useEffect, useRef, useCallback } from 'react';

interface HackAnimationProps {
  onExit: () => void;
}

const randHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
const randIP = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
const randPort = () => Math.floor(Math.random() * 65535);

const MESSAGES = [
  () => `[*] Scanning port ${randPort()}...`,
  () => `[*] Connecting to ${randIP()}:${randPort()}...`,
  () => `[+] Connection established on ${randIP()}`,
  () => `[*] Injecting payload: 0x${randHex()}${randHex()}${randHex()}${randHex()}`,
  () => `[*] Buffer overflow at 0x${randHex()}${randHex()}${randHex()}${randHex()}`,
  () => `[+] Shell spawned on target`,
  () => `[*] Extracting hash: ${Array.from({length: 16}, randHex).join('')}`,
  () => `[*] Decrypting AES-256: ${Array.from({length: 8}, randHex).join(' ')}`,
  () => `[*] Bypassing firewall rule ${Math.floor(Math.random() * 999)}...`,
  () => `[+] Firewall bypassed`,
  () => `[*] Cracking RSA-4096 key...`,
  () => `[*] Dumping memory at 0x${randHex()}${randHex()}0000`,
  () => `[+] Found credentials in /etc/shadow`,
  () => `[*] Establishing reverse tunnel to ${randIP()}`,
  () => `[*] Privilege escalation via CVE-2024-${Math.floor(Math.random() * 9999)}`,
  () => `[+] Root access obtained`,
  () => `[*] Exfiltrating ${Math.floor(Math.random() * 999)}MB of data...`,
  () => `[*] Cleaning logs at /var/log/auth.log`,
  () => `[*] Deploying persistence backdoor...`,
  () => `[+] Backdoor installed at /usr/sbin/.hidden`,
];

export const HackAnimation: React.FC<HackAnimationProps> = ({ onExit }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INFILTRATING');
  const [complete, setComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const exitedRef = useRef(false);

  const exit = useCallback(() => {
    if (!exitedRef.current) {
      exitedRef.current = true;
      onExit();
    }
  }, [onExit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') exit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [exit]);

  useEffect(() => {
    let count = 0;
    const maxLines = 40;

    const interval = setInterval(() => {
      if (exitedRef.current) { clearInterval(interval); return; }

      count++;
      const pct = Math.min(100, Math.floor((count / maxLines) * 100));
      setProgress(pct);

      if (count <= maxLines) {
        const msgFn = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        setLines(prev => [...prev.slice(-30), msgFn()]);

        if (pct > 80) setStatus('ALMOST THERE');
        if (pct > 60 && pct <= 80) setStatus('ESCALATING');
        if (pct > 40 && pct <= 60) setStatus('DECRYPTING');
      }

      if (count === maxLines + 1) {
        setStatus('ACCESS GRANTED');
        setComplete(true);
        setLines(prev => [...prev, '', '[===========================]', '', '   ██████╗ ██████╗  █████╗ ███╗   ██╗████████╗███████╗██████╗ ', '  ██╔════╝ ██╔══██╗██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔══██╗', '  ██║  ███╗██████╔╝███████║██╔██╗ ██║   ██║   █████╗  ██║  ██║', '  ██║   ██║██╔══██╗██╔══██║██║╚██╗██║   ██║   ██╔══╝  ██║  ██║', '  ╚██████╔╝██║  ██║██║  ██║██║ ╚████║   ██║   ███████╗██████╔╝', '   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═════╝ ', '', '  ACCESS GRANTED - Welcome, root@target']);
        setTimeout(() => { if (!exitedRef.current) exit(); }, 3000);
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [exit]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const progressBar = '█'.repeat(Math.floor(progress / 4)) + '░'.repeat(25 - Math.floor(progress / 4));

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-900/50">
        <span className="text-red-500 text-xs animate-pulse">● LIVE</span>
        <span className="text-green-500 text-[10px] sm:text-xs">{status}</span>
        <span className="text-green-900 text-[10px] sm:text-xs">ESC to abort</span>
      </div>

      {/* Progress */}
      <div className="px-3 py-1 border-b border-green-900/30">
        <div className="text-green-500 text-[10px] sm:text-xs">
          [{progressBar}] {progress}%
        </div>
      </div>

      {/* Output */}
      <div ref={containerRef} className="flex-1 overflow-auto p-3">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`text-[10px] sm:text-xs leading-relaxed ${
              line.startsWith('[+]') ? 'text-green-400' :
              line.startsWith('[*]') ? 'text-green-600' :
              complete && i > lines.length - 12 ? 'text-green-400' :
              'text-green-700'
            }`}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-[10000] opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
        }}
      />
    </div>
  );
};

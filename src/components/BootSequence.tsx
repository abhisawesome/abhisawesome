import { useState, useEffect, useRef } from 'react';

const BOOT_MESSAGES = [
  { text: '[    0.000] Booting AbhiOS v2.0.0...', delay: 100 },
  { text: '[    0.012] Loading kernel modules...', delay: 80 },
  { text: '[    0.045] Mounting virtual filesystem...', delay: 120 },
  { text: '[  OK  ] Virtual filesystem mounted', delay: 60 },
  { text: '[    0.089] Loading portfolio modules...', delay: 100 },
  { text: '[  OK  ] Portfolio data loaded', delay: 60 },
  { text: '[    0.134] Initializing terminal interface...', delay: 80 },
  { text: '[  OK  ] Terminal v2.0.0 ready', delay: 60 },
  { text: '[    0.178] Starting session for visitor@abhi-portfolio', delay: 100 },
  { text: '', delay: 200 },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [bootLines, setBootLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipped = useRef(false);

  // Skip on any keypress or tap
  useEffect(() => {
    const skip = () => {
      if (!skipped.current) {
        skipped.current = true;
        onComplete();
      }
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('touchstart', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('touchstart', skip);
    };
  }, [onComplete]);

  // Boot messages
  useEffect(() => {
    let i = 0;
    const addLine = () => {
      if (skipped.current || i >= BOOT_MESSAGES.length) {
        if (!skipped.current) {
          setTimeout(() => {
            if (!skipped.current) onComplete();
          }, 400);
        }
        return;
      }
      const msg = BOOT_MESSAGES[i];
      setBootLines(prev => [...prev, msg.text]);
      i++;
      setTimeout(addLine, msg.delay);
    };
    addLine();
  }, [onComplete]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [bootLines]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[100dvh] bg-background overflow-auto p-3 sm:p-6 flex flex-col items-center justify-center cursor-pointer"
      onClick={() => {
        if (!skipped.current) { skipped.current = true; onComplete(); }
      }}
    >
      <div className="w-full max-w-2xl">
        {bootLines.map((line, i) => (
          <div
            key={i}
            className={`font-mono text-[10px] sm:text-xs leading-relaxed ${
              line.includes('[  OK  ]') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Skip hint */}
      <div className="mt-6 text-muted-foreground text-[10px] sm:text-xs animate-pulse">
        Press any key or tap to skip
      </div>
    </div>
  );
};

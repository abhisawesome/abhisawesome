import { useEffect, useRef, useCallback } from 'react';

interface MatrixRainProps {
  onExit: () => void;
}

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const MatrixRain: React.FC<MatrixRainProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const exit = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    onExit();
  }, [onExit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') exit();
    };
    const handleTouch = () => exit();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchstart', handleTouch);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animRef.current);
    };
  }, [exit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -100);

    let lastTime = 0;
    const interval = 50; // ms between frames

    const draw = (time: number) => {
      animRef.current = requestAnimationFrame(draw);

      if (time - lastTime < interval) return;
      lastTime = time;

      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character (bright)
        ctx.fillStyle = '#00ff41';
        ctx.fillText(char, x, y);

        // Slightly dimmer trail
        if (drops[i] > 1) {
          ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(trailChar, x, y - fontSize);
        }

        drops[i]++;

        // Random reset
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-green-500/50 text-xs font-mono">
        Press ESC or Q to exit
      </div>
    </div>
  );
};

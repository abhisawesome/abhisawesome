import { useEffect, useRef, useCallback, useState } from 'react';

interface ScreensaverProps {
  onExit: () => void;
}

const LOGO = `
  ▄▄▄
 ▄████▄
▄██████▄
████▀▀████
████  ████
████▄▄████▀
 ▀████████▀
  ▀██████▀
   ▀████▀
    ▀▀▀
`;

export const Screensaver: React.FC<ScreensaverProps> = ({ onExit }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const velRef = useRef({ dx: 1.5, dy: 1 });
  const animRef = useRef<number>(0);
  const [hue, setHue] = useState(120);

  const exit = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    onExit();
  }, [onExit]);

  useEffect(() => {
    const handleKey = () => exit();
    const handleMouse = () => exit();
    const handleTouch = () => exit();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('touchstart', handleTouch);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animRef.current);
    };
  }, [exit]);

  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      animRef.current = requestAnimationFrame(animate);
      if (time - lastTime < 30) return;
      lastTime = time;

      setPos(prev => {
        const vel = velRef.current;
        let nx = prev.x + vel.dx;
        let ny = prev.y + vel.dy;

        if (nx <= 0 || nx >= 80) {
          vel.dx *= -1;
          nx = Math.max(0, Math.min(80, nx));
          setHue(h => (h + 60) % 360);
        }
        if (ny <= 0 || ny >= 75) {
          vel.dy *= -1;
          ny = Math.max(0, Math.min(75, ny));
          setHue(h => (h + 60) % 360);
        }

        return { x: nx, y: ny };
      });
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black cursor-none">
      <pre
        className="absolute font-mono text-xs sm:text-sm leading-tight transition-colors duration-500"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          color: `hsl(${hue}, 80%, 55%)`,
          textShadow: `0 0 10px hsl(${hue}, 80%, 55%)`,
        }}
      >
        {LOGO}
      </pre>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs font-mono">
        Move mouse or press any key to wake
      </div>
    </div>
  );
};

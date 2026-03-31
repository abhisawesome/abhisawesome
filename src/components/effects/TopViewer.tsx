import { useState, useEffect, useCallback } from 'react';
import type { ProcessManager } from '@/lib/processManager';

interface TopViewerProps {
  processManager: ProcessManager;
  onExit: () => void;
}

export const TopViewer: React.FC<TopViewerProps> = ({ processManager, onExit }) => {
  const [tick, setTick] = useState(0);

  const exit = useCallback(() => onExit(), [onExit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') exit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [exit]);

  // Refresh every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const procs = processManager.getWithJitter();
  const sorted = procs.sort((a, b) => b.cpu - a.cpu);
  const counts = processManager.getCount();
  const totalCpu = procs.reduce((s, p) => s + p.cpu, 0);
  const totalMem = procs.reduce((s, p) => s + p.mem, 0);

  const upHours = Math.floor(Math.random() * 200) + tick * 0; // stable per render
  const loadAvg = [
    (totalCpu / 25).toFixed(2),
    ((totalCpu / 25) * 0.9).toFixed(2),
    ((totalCpu / 25) * 0.8).toFixed(2),
  ];

  const cpuBar = buildBar(Math.min(totalCpu, 100), 100, 30);
  const memBar = buildBar(Math.min(totalMem, 100), 100, 30);

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-green-400 font-mono flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-2 sm:px-3 py-1 border-b border-green-900/50 text-[9px] sm:text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>top - {new Date().toLocaleTimeString()} up {upHours} days</span>
          <span className="text-green-700">press q to quit</span>
        </div>
        <div>
          Tasks: <span className="text-white">{counts.total}</span> total,{' '}
          <span className="text-green-300">{counts.running}</span> running,{' '}
          <span className="text-yellow-500">{counts.sleeping}</span> sleeping
        </div>
        <div className="flex gap-4">
          <span>%CPU [{cpuBar}] {totalCpu.toFixed(1)}%</span>
        </div>
        <div className="flex gap-4">
          <span>%MEM [{memBar}] {totalMem.toFixed(1)}%</span>
        </div>
        <div className="text-green-700">
          Load average: {loadAvg.join(', ')}
        </div>
      </div>

      {/* Process table header */}
      <div className="shrink-0 px-2 sm:px-3 py-0.5 bg-green-900/30 text-[9px] sm:text-xs">
        <div className="flex">
          <span className="w-14 sm:w-16 text-right pr-2">PID</span>
          <span className="w-16 sm:w-20">USER</span>
          <span className="w-12 sm:w-14 text-right pr-2">%CPU</span>
          <span className="w-12 sm:w-14 text-right pr-2">%MEM</span>
          <span className="w-10 sm:w-12">STAT</span>
          <span className="flex-1">COMMAND</span>
        </div>
      </div>

      {/* Process list */}
      <div className="flex-1 overflow-auto px-2 sm:px-3">
        {sorted.map(p => (
          <div
            key={p.pid}
            className={`flex text-[9px] sm:text-xs py-px ${
              p.cpu > 10 ? 'text-red-400' : p.cpu > 5 ? 'text-yellow-400' : 'text-green-400'
            }`}
          >
            <span className="w-14 sm:w-16 text-right pr-2">{p.pid}</span>
            <span className="w-16 sm:w-20 truncate">{p.user}</span>
            <span className="w-12 sm:w-14 text-right pr-2">{p.cpu.toFixed(1)}</span>
            <span className="w-12 sm:w-14 text-right pr-2">{p.mem.toFixed(1)}</span>
            <span className="w-10 sm:w-12">{p.state === 'running' ? 'R' : 'S'}</span>
            <span className="flex-1 truncate">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Mobile exit button */}
      <button
        onClick={exit}
        className="sm:hidden shrink-0 mx-2 mb-2 py-2 text-xs rounded bg-green-900/30 text-green-400 border border-green-800/50 active:bg-green-900/50"
      >
        Exit (Q)
      </button>
    </div>
  );
};

function buildBar(value: number, max: number, width: number): string {
  const filled = Math.round((value / max) * width);
  return '|'.repeat(Math.min(filled, width)) + ' '.repeat(Math.max(0, width - filled));
}

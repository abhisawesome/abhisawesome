export interface Process {
  pid: number;
  name: string;
  user: string;
  baseCpu: number;
  baseMem: number;
  state: 'running' | 'sleeping' | 'stopped';
  startTime: Date;
}

const INITIAL_PROCESSES: Omit<Process, 'startTime'>[] = [
  { pid: 1, name: 'systemd', user: 'root', baseCpu: 0.1, baseMem: 0.5, state: 'running' },
  { pid: 12, name: 'node-server', user: 'abhi', baseCpu: 12.3, baseMem: 8.1, state: 'running' },
  { pid: 42, name: 'react-renderer', user: 'abhi', baseCpu: 8.7, baseMem: 15.2, state: 'running' },
  { pid: 88, name: 'tsc --watch', user: 'abhi', baseCpu: 5.4, baseMem: 6.3, state: 'running' },
  { pid: 120, name: 'dockerd', user: 'root', baseCpu: 3.1, baseMem: 12.0, state: 'running' },
  { pid: 156, name: 'kube-controller', user: 'root', baseCpu: 7.2, baseMem: 18.4, state: 'running' },
  { pid: 200, name: 'postgres', user: 'postgres', baseCpu: 4.0, baseMem: 10.5, state: 'sleeping' },
  { pid: 234, name: 'nginx', user: 'www', baseCpu: 1.8, baseMem: 3.2, state: 'running' },
  { pid: 267, name: 'redis-server', user: 'redis', baseCpu: 1.2, baseMem: 4.8, state: 'running' },
  { pid: 300, name: 'python3 ml-train', user: 'abhi', baseCpu: 15.6, baseMem: 22.1, state: 'running' },
  { pid: 345, name: 'vite dev', user: 'abhi', baseCpu: 2.4, baseMem: 5.7, state: 'running' },
  { pid: 400, name: 'sshd', user: 'root', baseCpu: 0.1, baseMem: 1.2, state: 'sleeping' },
  { pid: 1000, name: 'portfolio-shell', user: 'visitor', baseCpu: 0.8, baseMem: 2.0, state: 'running' },
];

export class ProcessManager {
  private processes: Process[];

  constructor() {
    const now = new Date();
    this.processes = INITIAL_PROCESSES.map(p => ({
      ...p,
      startTime: new Date(now.getTime() - Math.random() * 86400000),
    }));
  }

  getAll(): Process[] {
    return this.processes.filter(p => p.state !== 'stopped');
  }

  getWithJitter(): Array<Process & { cpu: number; mem: number }> {
    return this.getAll().map(p => ({
      ...p,
      cpu: Math.max(0, p.baseCpu + (Math.random() - 0.5) * 4),
      mem: Math.max(0.1, p.baseMem + (Math.random() - 0.5) * 2),
    }));
  }

  kill(pid: number): string {
    if (pid === 1) return 'kill: Operation not permitted (PID 1)';
    if (pid === 1000) return 'kill: Cannot kill the current shell';
    const proc = this.processes.find(p => p.pid === pid);
    if (!proc) return `kill: (${pid}) - No such process`;
    if (proc.state === 'stopped') return `kill: (${pid}) - No such process`;
    proc.state = 'stopped';
    return `[1]+ Terminated  ${proc.name}`;
  }

  formatPs(): string {
    const procs = this.getWithJitter();
    const header = 'USER'.padEnd(10) + 'PID'.padStart(6) + '  ' +
      '%CPU'.padStart(5) + ' ' + '%MEM'.padStart(5) + '  ' +
      'STAT'.padEnd(6) + 'COMMAND';
    const lines = procs
      .sort((a, b) => b.cpu - a.cpu)
      .map(p => {
        const stat = p.state === 'running' ? 'R' : p.state === 'sleeping' ? 'S' : 'T';
        return p.user.padEnd(10) +
          String(p.pid).padStart(6) + '  ' +
          p.cpu.toFixed(1).padStart(5) + ' ' +
          p.mem.toFixed(1).padStart(5) + '  ' +
          stat.padEnd(6) + p.name;
      });
    return [header, ...lines].join('\n');
  }

  getTotalCpu(): number {
    return this.getAll().reduce((sum, p) => sum + p.baseCpu, 0);
  }

  getTotalMem(): number {
    return this.getAll().reduce((sum, p) => sum + p.baseMem, 0);
  }

  getCount(): { total: number; running: number; sleeping: number } {
    const all = this.getAll();
    return {
      total: all.length,
      running: all.filter(p => p.state === 'running').length,
      sleeping: all.filter(p => p.state === 'sleeping').length,
    };
  }
}

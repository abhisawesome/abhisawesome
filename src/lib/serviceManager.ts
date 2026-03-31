export interface Service {
  name: string;
  description: string;
  state: 'active' | 'inactive' | 'failed';
  enabled: boolean;
  startedAt: Date | null;
}

const INITIAL_SERVICES: Omit<Service, 'startedAt'>[] = [
  { name: 'portfolio.service', description: 'Terminal Portfolio Web Application', state: 'active', enabled: true },
  { name: 'filesystem.service', description: 'Virtual Filesystem Daemon', state: 'active', enabled: true },
  { name: 'games.service', description: 'Game Engine Service', state: 'active', enabled: true },
  { name: 'network.service', description: 'Network Manager', state: 'active', enabled: true },
  { name: 'theme.service', description: 'Theme Engine', state: 'active', enabled: true },
  { name: 'sshd.service', description: 'OpenSSH Server Daemon', state: 'active', enabled: true },
  { name: 'docker.service', description: 'Docker Container Runtime', state: 'active', enabled: true },
  { name: 'nginx.service', description: 'Nginx HTTP Server', state: 'active', enabled: true },
  { name: 'postgresql.service', description: 'PostgreSQL Database Server', state: 'inactive', enabled: false },
  { name: 'cron.service', description: 'Cron Scheduler Daemon', state: 'active', enabled: true },
];

export class ServiceManager {
  private services: Service[];

  constructor() {
    const now = new Date();
    this.services = INITIAL_SERVICES.map(s => ({
      ...s,
      startedAt: s.state === 'active' ? new Date(now.getTime() - Math.random() * 86400000 * 7) : null,
    }));
  }

  getAll(): Service[] {
    return this.services;
  }

  get(name: string): Service | undefined {
    // Allow with or without .service suffix
    const normalized = name.endsWith('.service') ? name : name + '.service';
    return this.services.find(s => s.name === normalized);
  }

  start(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Failed to start ${name}: Unit ${name} not found.`;
    if (svc.state === 'active') return `Service ${svc.name} is already active.`;
    svc.state = 'active';
    svc.startedAt = new Date();
    return '';
  }

  stop(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Failed to stop ${name}: Unit ${name} not found.`;
    if (svc.state === 'inactive') return `Service ${svc.name} is already inactive.`;
    svc.state = 'inactive';
    svc.startedAt = null;
    return '';
  }

  restart(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Failed to restart ${name}: Unit ${name} not found.`;
    svc.state = 'active';
    svc.startedAt = new Date();
    return '';
  }

  enable(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Failed to enable ${name}: Unit ${name} not found.`;
    svc.enabled = true;
    return `Created symlink /etc/systemd/system/multi-user.target.wants/${svc.name}`;
  }

  disable(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Failed to disable ${name}: Unit ${name} not found.`;
    svc.enabled = false;
    return `Removed /etc/systemd/system/multi-user.target.wants/${svc.name}`;
  }

  formatStatus(name: string): string {
    const svc = this.get(name);
    if (!svc) return `Unit ${name} could not be found.`;

    const dot = svc.state === 'active' ? '●' : svc.state === 'failed' ? '●' : '○';
    const stateColor = svc.state === 'active' ? 'active (running)' : svc.state === 'failed' ? 'failed' : 'inactive (dead)';
    const since = svc.startedAt
      ? `since ${svc.startedAt.toLocaleString()}`
      : '';

    return `${dot} ${svc.name} - ${svc.description}
     Loaded: loaded (/etc/systemd/system/${svc.name}; ${svc.enabled ? 'enabled' : 'disabled'})
     Active: ${stateColor} ${since}
   Main PID: ${Math.floor(Math.random() * 9000) + 1000}
     Memory: ${(Math.random() * 50 + 5).toFixed(1)}M`;
  }

  formatListUnits(): string {
    const header = 'UNIT'.padEnd(28) + 'LOAD'.padEnd(10) + 'ACTIVE'.padEnd(12) + 'SUB'.padEnd(10) + 'DESCRIPTION';
    const lines = this.services.map(s => {
      const sub = s.state === 'active' ? 'running' : s.state === 'failed' ? 'failed' : 'dead';
      return s.name.padEnd(28) +
        'loaded'.padEnd(10) +
        s.state.padEnd(12) +
        sub.padEnd(10) +
        s.description;
    });
    return [header, ...lines, '', `${this.services.length} units listed.`].join('\n');
  }
}

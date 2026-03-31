import { VirtualFileSystem } from './virtualFileSystem';
import { themes } from './themes';
import type { ProcessManager } from './processManager';
import type { ServiceManager } from './serviceManager';

export interface CommandResult {
  output: string;
  type: 'output' | 'error';
  clear?: boolean;
  launchGame?: string;
  launchApp?: string;
  launchAppArgs?: Record<string, string>;
  theme?: string;
  asyncAction?: () => Promise<string>;
}

export interface CommandContext {
  isGameActive: boolean;
  processManager: ProcessManager;
  serviceManager: ServiceManager;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (const ch of input) {
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === '\\' && !inSingle) {
      escape = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === ' ' && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function formatColumns(items: string[], width = 80): string {
  if (items.length === 0) return '';
  const maxLen = Math.max(...items.map(i => i.length)) + 2;
  const cols = Math.max(1, Math.floor(width / maxLen));
  let result = '';
  for (let i = 0; i < items.length; i++) {
    result += items[i].padEnd(maxLen);
    if ((i + 1) % cols === 0) result += '\n';
  }
  return result.trimEnd();
}

// Split on | outside quotes
function splitPipes(raw: string): string[] {
  const segments: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (const ch of raw) {
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    if (ch === '|' && !inSingle && !inDouble) {
      segments.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  segments.push(current);
  return segments.map(s => s.trim()).filter(Boolean);
}

export function processCommandWithPipes(
  raw: string,
  fs: VirtualFileSystem,
  context: CommandContext
): CommandResult {
  const pipes = splitPipes(raw);
  if (pipes.length <= 1) {
    return processCommand(raw, fs, context);
  }

  let stdin = '';
  for (let i = 0; i < pipes.length; i++) {
    const isLast = i === pipes.length - 1;
    const result = processCommand(pipes[i], fs, context, stdin, !isLast);
    if (result.type === 'error') return result;
    if (result.clear || result.launchGame || result.launchApp) return result;
    stdin = result.output;
  }
  return { output: stdin, type: 'output' };
}

export function processCommand(
  raw: string,
  fs: VirtualFileSystem,
  context: CommandContext,
  stdin?: string,
  isPiped?: boolean,
): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { output: '', type: 'output' };

  // Parse redirect (only if not piped to next command)
  let commandPart = trimmed;
  let redirectFile: string | null = null;
  let appendMode = false;

  if (!isPiped) {
    let inQ = false;
    let inDQ = false;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === "'" && !inDQ) inQ = !inQ;
      if (ch === '"' && !inQ) inDQ = !inDQ;
      if (!inQ && !inDQ && ch === '>') {
        if (trimmed[i + 1] === '>') {
          appendMode = true;
          commandPart = trimmed.slice(0, i).trim();
          redirectFile = trimmed.slice(i + 2).trim();
        } else {
          commandPart = trimmed.slice(0, i).trim();
          redirectFile = trimmed.slice(i + 1).trim();
        }
        break;
      }
    }
  }

  const tokens = tokenize(commandPart);
  if (tokens.length === 0) return { output: '', type: 'output' };

  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  let result: CommandResult;

  try {
    // Handle sudo specially
    if (cmd === 'sudo' && args.join(' ').match(/rm\s+(-rf|-fr|-r\s*-f|-f\s*-r)\s+\//)) {
      result = { output: '', type: 'output', launchApp: 'sudo-rm' };
    } else if (cmd === 'sudo') {
      result = { output: `[sudo] password for visitor: \nvisitor is not in the sudoers file. This incident will be reported.`, type: 'error' };
    } else {
      switch (cmd) {
        case 'help':
          result = cmdHelp();
          break;
        case 'pwd':
          result = { output: fs.getCwd(), type: 'output' };
          break;
        case 'ls':
        case 'dir':
          result = cmdLs(fs, args);
          break;
        case 'cd':
          result = cmdCd(fs, args);
          break;
        case 'cat':
          result = cmdCat(fs, args, stdin);
          break;
        case 'mkdir':
          result = cmdMkdir(fs, args);
          break;
        case 'touch':
          result = cmdTouch(fs, args);
          break;
        case 'rm':
          result = cmdRm(fs, args);
          break;
        case 'rmdir':
          result = cmdRmdir(fs, args);
          break;
        case 'cp':
          result = cmdCp(fs, args);
          break;
        case 'mv':
          result = cmdMv(fs, args);
          break;
        case 'echo':
          result = { output: args.join(' '), type: 'output' };
          break;
        case 'tree':
          result = { output: fs.getTree(args[0] || undefined).trimEnd(), type: 'output' };
          break;
        case 'head':
          result = cmdHead(fs, args, stdin);
          break;
        case 'tail':
          result = cmdTail(fs, args, stdin);
          break;
        case 'wc':
          result = cmdWc(fs, args, stdin);
          break;
        case 'find':
          result = cmdFind(fs, args);
          break;
        case 'grep':
          result = cmdGrep(fs, args, stdin);
          break;
        case 'sort':
          result = cmdSort(args, stdin);
          break;
        case 'uniq':
          result = cmdUniq(stdin);
          break;
        case 'whoami':
          result = { output: 'visitor@abhi-portfolio', type: 'output' };
          break;
        case 'date':
          result = { output: new Date().toString(), type: 'output' };
          break;
        case 'clear':
          result = { output: '', type: 'output', clear: true };
          break;
        case 'theme':
          result = cmdTheme(args);
          break;
        case 'uname':
          result = { output: args.includes('-a')
            ? 'AbhiOS 2.0.0 visitor-portfolio x86_64 GNU/Linux'
            : 'AbhiOS', type: 'output' };
          break;
        case 'hostname':
          result = { output: 'abhi-portfolio', type: 'output' };
          break;
        case 'uptime':
          result = { output: `up ${Math.floor(Math.random() * 365)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`, type: 'output' };
          break;
        case 'history':
          result = { output: 'Command history is maintained in-session only. Use arrow keys to navigate.', type: 'output' };
          break;
        // Portfolio aliases
        case 'about':
          result = { output: fs.readFile('/home/visitor/about.txt'), type: 'output' };
          break;
        case 'resume':
          result = cmdResume(fs);
          break;
        case 'skills':
          result = cmdSkills(fs);
          break;
        case 'projects':
          result = cmdProjects(fs);
          break;
        case 'contact':
          result = { output: fs.readFile('/home/visitor/contact.md'), type: 'output' };
          break;
        case 'certifications':
        case 'certs':
          result = { output: fs.readFile('/home/visitor/certifications.txt'), type: 'output' };
          break;
        case 'achievements':
          result = { output: fs.readFile('/home/visitor/achievements.txt'), type: 'output' };
          break;
        // Games & effects
        case 'games':
          result = {
            output: `Available Games:\n================\n\n1. SNAKE - Classic snake game\n   Command: snake\n   Controls: WASD or Arrow Keys\n\nMore games coming soon!\n\nType the game name to start playing.`,
            type: 'output'
          };
          break;
        case 'snake':
          if (context.isGameActive) {
            result = { output: 'A game is already running. Please exit the current game first.', type: 'error' };
          } else {
            result = { output: 'Launching Snake game in fullscreen mode...', type: 'output', launchGame: 'snake' };
          }
          break;
        case 'matrix':
          result = { output: 'Entering the Matrix...', type: 'output', launchApp: 'matrix' };
          break;
        case 'hack':
          result = { output: 'Initiating hack sequence...', type: 'output', launchApp: 'hack' };
          break;
        case 'nano':
          if (!args[0]) {
            result = { output: 'Usage: nano <filename>', type: 'error' };
          } else {
            result = { output: '', type: 'output', launchApp: 'nano', launchAppArgs: { filename: args[0] } };
          }
          break;
        case 'cowsay':
          result = cmdCowsay(args);
          break;
        case 'exit':
        case 'logout':
          result = { output: '', type: 'output', launchApp: 'exit-glitch' };
          break;
        case 'weather':
          result = cmdWeather(args);
          break;
        case 'neofetch':
          result = cmdNeofetch();
          break;
        case 'man':
          result = cmdMan(args);
          break;
        case 'which':
          result = cmdWhich(args);
          break;
        // System simulation
        case 'top':
        case 'htop':
          result = { output: '', type: 'output', launchApp: 'top' };
          break;
        case 'ps':
          result = { output: context.processManager.formatPs(), type: 'output' };
          break;
        case 'kill':
          result = cmdKill(context.processManager, args);
          break;
        case 'systemctl':
          result = cmdSystemctl(context.serviceManager, args);
          break;
        case 'crontab':
          result = cmdCrontab(fs, args);
          break;
        case 'df':
          result = cmdDf(fs);
          break;
        case 'free':
          result = cmdFree();
          break;
        case 'chmod':
          result = cmdChmod(fs, args);
          break;
        case 'ping':
          result = cmdPing(args);
          break;
        case 'ssh':
          result = cmdSsh(fs, args);
          break;
        case 'ifconfig':
        case 'ip':
          result = cmdIfconfig();
          break;
        default:
          result = { output: `Command not found: ${tokens[0]}. Type "help" for available commands.`, type: 'error' };
      }
    }
  } catch (e) {
    result = { output: (e as Error).message, type: 'error' };
  }

  // Handle redirect
  if (redirectFile && result.type === 'output' && !result.clear && !result.launchGame && !result.launchApp) {
    try {
      if (appendMode) {
        fs.appendFile(redirectFile, result.output + '\n');
      } else {
        fs.writeFile(redirectFile, result.output + '\n');
      }
      return { output: '', type: 'output' };
    } catch (e) {
      return { output: (e as Error).message, type: 'error' };
    }
  }

  return result;
}

function cmdHelp(): CommandResult {
  return {
    output: `Available commands:

  FILESYSTEM:
  ls [path]        - List directory contents
  cd <path>        - Change directory
  pwd              - Print working directory
  cat <file>       - Display file contents
  mkdir [-p] <dir> - Create directory
  touch <file>     - Create empty file
  rm [-r] <path>   - Remove file or directory
  rmdir <dir>      - Remove empty directory
  cp <src> <dest>  - Copy file
  mv <src> <dest>  - Move/rename file or directory
  tree [path]      - Show directory tree
  find [path] -name <pattern> - Find files
  grep <pattern> <file>       - Search in file
  head [-n N] <file>          - Show first N lines
  tail [-n N] <file>          - Show last N lines
  wc <file>        - Word/line/char count
  sort             - Sort input lines (use with pipe)
  uniq             - Remove duplicate lines (use with pipe)
  echo <text>      - Print text (supports > and >>)
  nano <file>      - Edit file in nano editor

  PORTFOLIO:
  about            - Learn about me
  resume           - View my resume
  skills           - List technical skills
  projects         - View my projects
  contact          - Get contact information
  certifications   - View certifications
  achievements     - View awards

  PROCESS & SERVICE:
  top/htop         - Live process viewer
  ps [aux]         - List running processes
  kill <pid>       - Terminate a process
  systemctl <cmd>  - Manage services (status/start/stop/restart)
  crontab -l/-e    - View/edit cron jobs

  SYSTEM:
  whoami           - Display current user
  date             - Show current date/time
  uname [-a]       - System information
  hostname         - Show hostname
  uptime           - Show uptime
  df [-h]          - Disk usage statistics
  free [-h]        - Memory usage statistics
  chmod <mode> <f> - Change file permissions
  ping <host>      - Ping a network host
  ssh <server>     - Connect to a server
  ifconfig         - Network interface info
  history          - Command history info
  neofetch         - System info display
  weather [city]   - Show weather info
  man <cmd>        - Manual for command
  which <cmd>      - Show command location
  theme [name]     - Switch color theme
  clear            - Clear the terminal

  FUN:
  cowsay <text>    - ASCII cow says your text
  matrix           - Matrix rain animation
  hack             - Movie-style hacking animation
  exit             - Try to exit...
  sudo rm -rf /    - Don't do it...

  GAMES:
  games            - List available games
  snake            - Play Snake game

  TIPS:
  Use | to pipe commands: cat file | grep pattern
  Use > to redirect: echo hello > file.txt
  Use >> to append: echo world >> file.txt
  Press Tab for auto-completion`,
    type: 'output'
  };
}

function cmdLs(fs: VirtualFileSystem, args: string[]): CommandResult {
  let showLong = false;
  let showAll = false;
  const paths: string[] = [];

  for (const arg of args) {
    if (arg === '-l') showLong = true;
    else if (arg === '-a') showAll = true;
    else if (arg === '-la' || arg === '-al') { showLong = true; showAll = true; }
    else paths.push(arg);
  }

  const target = paths[0] || undefined;
  const children = fs.listDir(target);

  if (showAll) {
    children.unshift('.', '..');
  }

  if (children.length === 0) return { output: '', type: 'output' };

  if (showLong) {
    const resolved = target ? fs.resolvePath(target) : fs.getCwd();
    const lines = children.map(name => {
      if (name === '.' || name === '..') return `drwxr-xr-x  -  ${name}`;
      const fullPath = resolved === '/' ? `/${name}` : `${resolved}/${name}`;
      const node = fs.getNode(fullPath);
      if (!node) return name;
      const perms = VirtualFileSystem.modeToString(node.mode, node.type === 'directory');
      if (node.type === 'directory') {
        return `${perms}  -        ${name}/`;
      }
      const size = String(node.content.length).padStart(8);
      return `${perms}  ${size}  ${name}`;
    });
    return { output: lines.join('\n'), type: 'output' };
  }

  const decorated = children.map(name => {
    if (name === '.' || name === '..') return name + '/';
    const resolved = target ? fs.resolvePath(target) : fs.getCwd();
    const fullPath = resolved === '/' ? `/${name}` : `${resolved}/${name}`;
    return fs.isDirectory(fullPath) ? name + '/' : name;
  });

  return { output: formatColumns(decorated), type: 'output' };
}

function cmdCd(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) {
    fs.setCwd('/home/visitor');
    return { output: '', type: 'output' };
  }
  if (args[0] === '-') {
    const prev = fs.getPrevCwd();
    fs.setCwd(prev);
    return { output: fs.getCwd(), type: 'output' };
  }
  fs.setCwd(args[0]);
  return { output: '', type: 'output' };
}

function cmdCat(fs: VirtualFileSystem, args: string[], stdin?: string): CommandResult {
  if (args.length === 0) {
    if (stdin !== undefined) return { output: stdin, type: 'output' };
    return { output: 'cat: missing operand', type: 'error' };
  }
  const outputs: string[] = [];
  for (const file of args) {
    outputs.push(fs.readFile(file));
  }
  return { output: outputs.join('\n'), type: 'output' };
}

function cmdMkdir(fs: VirtualFileSystem, args: string[]): CommandResult {
  let recursive = false;
  const dirs: string[] = [];
  for (const arg of args) {
    if (arg === '-p') recursive = true;
    else dirs.push(arg);
  }
  if (dirs.length === 0) return { output: 'mkdir: missing operand', type: 'error' };
  for (const dir of dirs) {
    if (recursive) {
      fs.mkdirp(dir);
    } else {
      fs.mkdir(dir);
    }
  }
  return { output: '', type: 'output' };
}

function cmdTouch(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) return { output: 'touch: missing operand', type: 'error' };
  for (const file of args) {
    if (!fs.exists(file)) {
      fs.writeFile(file, '');
    }
  }
  return { output: '', type: 'output' };
}

function cmdRm(fs: VirtualFileSystem, args: string[]): CommandResult {
  let recursive = false;
  const targets: string[] = [];
  for (const arg of args) {
    if (arg === '-r' || arg === '-rf' || arg === '-fr') recursive = true;
    else if (arg === '-f') { /* force */ }
    else targets.push(arg);
  }
  if (targets.length === 0) return { output: 'rm: missing operand', type: 'error' };
  for (const target of targets) {
    if (recursive) {
      fs.deleteRecursive(target);
    } else {
      fs.deleteFile(target);
    }
  }
  return { output: '', type: 'output' };
}

function cmdRmdir(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) return { output: 'rmdir: missing operand', type: 'error' };
  for (const dir of args) {
    fs.rmdir(dir);
  }
  return { output: '', type: 'output' };
}

function cmdCp(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) return { output: 'cp: missing operand', type: 'error' };
  fs.copy(args[0], args[1]);
  return { output: '', type: 'output' };
}

function cmdMv(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) return { output: 'mv: missing operand', type: 'error' };
  fs.move(args[0], args[1]);
  return { output: '', type: 'output' };
}

function cmdHead(fs: VirtualFileSystem, args: string[], stdin?: string): CommandResult {
  let n = 10;
  let file = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
    else file = args[i];
  }
  const content = file ? fs.readFile(file) : (stdin || '');
  if (!file && stdin === undefined) return { output: 'head: missing operand', type: 'error' };
  const lines = content.split('\n').slice(0, n);
  return { output: lines.join('\n'), type: 'output' };
}

function cmdTail(fs: VirtualFileSystem, args: string[], stdin?: string): CommandResult {
  let n = 10;
  let file = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
    else file = args[i];
  }
  const content = file ? fs.readFile(file) : (stdin || '');
  if (!file && stdin === undefined) return { output: 'tail: missing operand', type: 'error' };
  const lines = content.split('\n').slice(-n);
  return { output: lines.join('\n'), type: 'output' };
}

function cmdWc(fs: VirtualFileSystem, args: string[], stdin?: string): CommandResult {
  if (args.length === 0 && stdin !== undefined) {
    const lines = stdin.split('\n').length;
    const words = stdin.split(/\s+/).filter(Boolean).length;
    const chars = stdin.length;
    return { output: `  ${lines}  ${words}  ${chars}`, type: 'output' };
  }
  if (args.length === 0) return { output: 'wc: missing operand', type: 'error' };
  const results: string[] = [];
  for (const file of args) {
    const content = fs.readFile(file);
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    results.push(`  ${lines}  ${words}  ${chars} ${file}`);
  }
  return { output: results.join('\n'), type: 'output' };
}

function cmdFind(fs: VirtualFileSystem, args: string[]): CommandResult {
  let searchPath = '.';
  let namePattern = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-name' && args[i + 1]) {
      namePattern = args[++i];
    } else if (!args[i].startsWith('-')) {
      searchPath = args[i];
    }
  }

  const resolved = fs.resolvePath(searchPath);
  const results: string[] = [];

  const walk = (path: string) => {
    const name = path.split('/').pop() || '';
    if (namePattern) {
      const regex = new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      if (regex.test(name)) {
        results.push(path.startsWith(resolved) ? '.' + path.slice(resolved.length) : path);
      }
    } else {
      results.push(path.startsWith(resolved) ? '.' + path.slice(resolved.length) : path);
    }

    if (fs.isDirectory(path)) {
      try {
        const children = fs.listDir(path);
        for (const child of children) {
          const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
          walk(childPath);
        }
      } catch { /* skip */ }
    }
  };

  walk(resolved);
  return { output: results.join('\n') || 'No matches found.', type: 'output' };
}

function cmdGrep(fs: VirtualFileSystem, args: string[], stdin?: string): CommandResult {
  if (args.length < 1) return { output: 'usage: grep <pattern> [file]', type: 'error' };
  const pattern = args[0];
  const file = args[1];

  let content: string;
  if (file) {
    content = fs.readFile(file);
  } else if (stdin !== undefined) {
    content = stdin;
  } else {
    return { output: 'usage: grep <pattern> <file>', type: 'error' };
  }

  const regex = new RegExp(pattern, 'gi');
  const matches = content.split('\n').filter(line => regex.test(line));
  if (matches.length === 0) return { output: '', type: 'output' };
  return { output: matches.join('\n'), type: 'output' };
}

function cmdSort(args: string[], stdin?: string): CommandResult {
  const content = stdin || args.join(' ');
  if (!content) return { output: '', type: 'output' };
  const lines = content.split('\n').sort();
  return { output: lines.join('\n'), type: 'output' };
}

function cmdUniq(stdin?: string): CommandResult {
  if (!stdin) return { output: '', type: 'output' };
  const lines = stdin.split('\n');
  const unique = lines.filter((line, i) => i === 0 || line !== lines[i - 1]);
  return { output: unique.join('\n'), type: 'output' };
}

function cmdTheme(args: string[]): CommandResult {
  if (args.length === 0) {
    const list = themes.map(t => `  ${t.name.padEnd(15)} ${t.label}`).join('\n');
    return {
      output: `Available themes:\n\n${list}\n\nUsage: theme <name>`,
      type: 'output'
    };
  }
  const name = args[0].toLowerCase();
  const theme = themes.find(t => t.name === name);
  if (!theme) {
    return { output: `Unknown theme: ${name}. Type "theme" to see available themes.`, type: 'error' };
  }
  return { output: `Theme switched to ${theme.label}`, type: 'output', theme: name };
}

function cmdCowsay(args: string[]): CommandResult {
  const msg = args.join(' ') || 'Moo!';
  const lines: string[] = [];
  const maxWidth = 40;

  // Word wrap
  const words = msg.split(' ');
  let currentLine = '';
  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const width = Math.max(...lines.map(l => l.length));
  const top = ' ' + '_'.repeat(width + 2);
  const bottom = ' ' + '-'.repeat(width + 2);

  let bubble: string;
  if (lines.length === 1) {
    bubble = `${top}\n< ${lines[0].padEnd(width)} >\n${bottom}`;
  } else {
    const mid = lines.map((line, i) => {
      const padded = line.padEnd(width);
      if (i === 0) return `/ ${padded} \\`;
      if (i === lines.length - 1) return `\\ ${padded} /`;
      return `| ${padded} |`;
    }).join('\n');
    bubble = `${top}\n${mid}\n${bottom}`;
  }

  const cow = `        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;

  return { output: `${bubble}\n${cow}`, type: 'output' };
}

function cmdWeather(args: string[]): CommandResult {
  const city = args.join('+') || '';
  const url = city
    ? `https://wttr.in/${encodeURIComponent(city)}?format=4`
    : 'https://wttr.in/?format=4';

  return {
    output: 'Fetching weather data...',
    type: 'output',
    asyncAction: async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();
        return text.trim();
      } catch {
        return 'Error: Could not fetch weather data. Try: weather London';
      }
    }
  };
}

function cmdResume(fs: VirtualFileSystem): CommandResult {
  const content = fs.readFile('/home/visitor/resume.txt');
  return {
    output: `Loading resume...\n[==============================] 100%\n\n${content}\n\nType "skills" for technical skills or "projects" for project details.`,
    type: 'output'
  };
}

function cmdSkills(fs: VirtualFileSystem): CommandResult {
  const data = JSON.parse(fs.readFile('/home/visitor/skills.json'));
  return {
    output: `Technical Skills:
=================

PROGRAMMING LANGUAGES:
${(data.programming_languages as string[]).map(s => `• ${s}`).join('           ').replace(/(.{1,70})/g, '$1\n').trim()}

DATABASE TECHNOLOGIES:
${(data.databases as string[]).map(s => `• ${s}`).join('           ').replace(/(.{1,70})/g, '$1\n').trim()}

DEVOPS & CLOUD:
${(data.devops_and_cloud as string[]).map(s => `• ${s}`).join('           ').replace(/(.{1,70})/g, '$1\n').trim()}

INTERESTED AREAS:
${(data.interested_areas as string[]).map(s => `• ${s}`).join('\n')}`,
    type: 'output'
  };
}

function cmdProjects(fs: VirtualFileSystem): CommandResult {
  const projectFiles = fs.listDir('/home/visitor/projects');
  const projects: string[] = ['Featured Projects:', '==================', ''];
  for (const file of projectFiles) {
    const content = fs.readFile(`/home/visitor/projects/${file}`);
    projects.push(content, '');
  }
  return { output: projects.join('\n'), type: 'output' };
}

function cmdNeofetch(): CommandResult {
  return {
    output: `
       ▄▄▄       visitor@abhi-portfolio
      ▄████▄     -------------------------
     ▄██████▄    OS: AbhiOS 2.0.0 (Portfolio Edition)
    ████▀▀████   Host: github.com/abhisawesome
   ████    ████  Kernel: React 19 + TypeScript
  ████▄    ████  Shell: terminal-portfolio v2.0
   ████▄▄████▀   Resolution: Responsive
    ▀████████▀   Theme: Customizable (type "theme")
     ▀██████▀    Terminal: Custom React Terminal
      ▀████▀     CPU: 7+ years of experience
       ▀▀▀       Memory: Full Stack (Node, React, Python)
                 Disk: Docker + Kubernetes
                 Network: AWS / GCP / Azure`,
    type: 'output'
  };
}

function cmdMan(args: string[]): CommandResult {
  if (args.length === 0) return { output: 'What manual page do you want?\nUsage: man <command>', type: 'error' };
  const manPages: Record<string, string> = {
    ls: 'ls [options] [path] - List directory contents\n  -l  Long format\n  -a  Show hidden entries (. and ..)',
    cd: 'cd [path] - Change working directory\n  cd      Go to home\n  cd -    Go to previous directory\n  cd ..   Go up one level',
    cat: 'cat <file> [file2...] - Concatenate and print files',
    mkdir: 'mkdir [-p] <dir> - Create directories\n  -p  Create parent directories as needed',
    rm: 'rm [-r] <path> - Remove files or directories\n  -r  Remove directories recursively',
    cp: 'cp <source> <destination> - Copy files',
    mv: 'mv <source> <destination> - Move or rename files/directories',
    echo: 'echo <text> - Display text\n  Supports > (write) and >> (append) redirection',
    touch: 'touch <file> - Create empty file or update timestamp',
    tree: 'tree [path] - Display directory tree structure',
    find: 'find [path] -name <pattern> - Find files by name\n  Supports * and ? wildcards',
    grep: 'grep <pattern> [file] - Search for pattern in file or piped input',
    head: 'head [-n N] <file> - Show first N lines (default 10)',
    tail: 'tail [-n N] <file> - Show last N lines (default 10)',
    wc: 'wc <file> - Print line, word, and byte counts',
    nano: 'nano <file> - Open file in nano text editor\n  Ctrl+X  Exit\n  Ctrl+O  Save\n  Ctrl+G  Help',
    cowsay: 'cowsay <text> - Make an ASCII cow say your text',
    theme: 'theme [name] - List or switch terminal themes\n  Available: matrix, dracula, catppuccin, nord, retro-amber, cyberpunk',
    matrix: 'matrix - Display Matrix rain animation\n  Press ESC or Q to exit',
    hack: 'hack - Simulate a movie-style hacking sequence',
    weather: 'weather [city] - Display current weather\n  Uses wttr.in for data',
    sort: 'sort - Sort lines of input (use with pipe)\n  Example: cat file | sort',
    uniq: 'uniq - Remove adjacent duplicate lines (use with pipe)\n  Example: cat file | sort | uniq',
    top: 'top - Live process viewer\n  Shows running processes with CPU/MEM usage\n  Press Q or ESC to exit',
    htop: 'htop - Interactive process viewer (alias for top)',
    ps: 'ps [aux] - List running processes',
    kill: 'kill [-9] <pid> - Send signal to a process\n  kill <pid>    Terminate process\n  kill -9 <pid> Force kill',
    systemctl: 'systemctl <command> [service] - Manage system services\n  status <svc>   Show service status\n  start <svc>    Start a service\n  stop <svc>     Stop a service\n  restart <svc>  Restart a service\n  enable <svc>   Enable at boot\n  disable <svc>  Disable at boot\n  list-units     List all services',
    crontab: 'crontab <option> - Manage scheduled tasks\n  -l  List cron entries\n  -e  Edit crontab (opens nano)',
    df: 'df [-h] - Show disk usage statistics',
    free: 'free [-h] - Show memory usage statistics',
    chmod: 'chmod <mode> <file> - Change file permissions\n  Mode is octal (e.g., 755, 644, 000)\n  Example: chmod 755 script.sh',
    ping: 'ping <host> - Send ICMP echo requests\n  Known hosts: github.com, google.com, appmaker.xyz, linkedin.com',
    ssh: 'ssh <server> - Connect to remote server\n  Available: projects-server, skills-server, github, db-server',
    ifconfig: 'ifconfig - Show network interface configuration',
  };
  const page = manPages[args[0]];
  if (!page) return { output: `No manual entry for ${args[0]}`, type: 'error' };
  return { output: `NAME\n  ${page}`, type: 'output' };
}

function cmdWhich(args: string[]): CommandResult {
  if (args.length === 0) return { output: 'which: missing operand', type: 'error' };
  const builtins = [
    'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'rmdir', 'cp', 'mv',
    'echo', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'sort', 'uniq',
    'whoami', 'date', 'clear', 'help', 'about', 'resume', 'skills', 'projects',
    'contact', 'certifications', 'achievements', 'games', 'snake', 'theme',
    'neofetch', 'uname', 'hostname', 'uptime', 'history', 'man', 'which',
    'matrix', 'hack', 'nano', 'cowsay', 'weather', 'exit', 'sudo',
    'top', 'htop', 'ps', 'kill', 'systemctl', 'crontab',
    'df', 'free', 'chmod', 'ping', 'ssh', 'ifconfig', 'ip',
  ];
  const results: string[] = [];
  for (const arg of args) {
    if (builtins.includes(arg)) {
      results.push(`/usr/bin/${arg}`);
    } else {
      results.push(`${arg} not found`);
    }
  }
  return { output: results.join('\n'), type: 'output' };
}

// --- System simulation commands ---

function cmdKill(pm: ProcessManager, args: string[]): CommandResult {
  if (args.length === 0) return { output: 'kill: usage: kill <pid>', type: 'error' };
  // Skip signal flags
  const pidArg = args.find(a => !a.startsWith('-'));
  if (!pidArg) return { output: 'kill: usage: kill <pid>', type: 'error' };
  const pid = parseInt(pidArg);
  if (isNaN(pid)) return { output: `kill: invalid pid: ${pidArg}`, type: 'error' };
  const msg = pm.kill(pid);
  return { output: msg, type: msg.includes('No such') || msg.includes('not permitted') || msg.includes('Cannot') ? 'error' : 'output' };
}

function cmdSystemctl(sm: ServiceManager, args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: 'Usage: systemctl <command> [service]\nCommands: status, start, stop, restart, enable, disable, list-units', type: 'error' };
  }
  const subcmd = args[0];
  const svcName = args[1];

  switch (subcmd) {
    case 'status':
      if (!svcName) return { output: 'Usage: systemctl status <service>', type: 'error' };
      return { output: sm.formatStatus(svcName), type: 'output' };
    case 'start': {
      if (!svcName) return { output: 'Usage: systemctl start <service>', type: 'error' };
      const msg = sm.start(svcName);
      return msg ? { output: msg, type: 'error' } : { output: `Started ${svcName}`, type: 'output' };
    }
    case 'stop': {
      if (!svcName) return { output: 'Usage: systemctl stop <service>', type: 'error' };
      const msg = sm.stop(svcName);
      return msg ? { output: msg, type: 'error' } : { output: `Stopped ${svcName}`, type: 'output' };
    }
    case 'restart': {
      if (!svcName) return { output: 'Usage: systemctl restart <service>', type: 'error' };
      const msg = sm.restart(svcName);
      return msg ? { output: msg, type: 'error' } : { output: `Restarted ${svcName}`, type: 'output' };
    }
    case 'enable': {
      if (!svcName) return { output: 'Usage: systemctl enable <service>', type: 'error' };
      const msg = sm.enable(svcName);
      return { output: msg, type: msg.includes('not found') ? 'error' : 'output' };
    }
    case 'disable': {
      if (!svcName) return { output: 'Usage: systemctl disable <service>', type: 'error' };
      const msg = sm.disable(svcName);
      return { output: msg, type: msg.includes('not found') ? 'error' : 'output' };
    }
    case 'list-units':
      return { output: sm.formatListUnits(), type: 'output' };
    default:
      return { output: `Unknown command: systemctl ${subcmd}`, type: 'error' };
  }
}

function cmdCrontab(fs: VirtualFileSystem, args: string[]): CommandResult {
  const cronPath = '/etc/crontab';
  // Ensure /etc exists and crontab file exists
  try { fs.mkdirp('/etc'); } catch { /* exists */ }
  if (!fs.exists(cronPath)) {
    fs.writeFile(cronPath, `# m h dom mon dow   command
0 * * * *     /usr/bin/clear-tmp
*/5 * * * *   /usr/bin/health-check
0 0 * * *     /usr/bin/backup-portfolio
30 2 * * 0    /usr/bin/update-stats`);
  }

  if (args[0] === '-l') {
    return { output: fs.readFile(cronPath), type: 'output' };
  }
  if (args[0] === '-e') {
    return { output: '', type: 'output', launchApp: 'nano', launchAppArgs: { filename: cronPath } };
  }
  return { output: 'Usage: crontab -l (list) or crontab -e (edit)', type: 'error' };
}

function cmdDf(fs: VirtualFileSystem): CommandResult {
  const totalSize = fs.getTotalSize();
  const usedMB = (totalSize / 1024).toFixed(1);
  const totalMB = 500;
  const availMB = (totalMB - parseFloat(usedMB)).toFixed(1);
  const usePct = Math.round((parseFloat(usedMB) / totalMB) * 100);

  const header = 'Filesystem      Size  Used Avail Use% Mounted on';
  const lines = [
    header,
    `/dev/portfolio  ${totalMB}M  ${usedMB.padStart(4)}M ${availMB.padStart(5)}M  ${String(usePct).padStart(2)}% /`,
    `/dev/projects    1.0G  340M   660M  34% /home/visitor/projects`,
    `tmpfs           128M    0M   128M   0% /tmp`,
    `devtmpfs         64M    0M    64M   0% /dev`,
  ];
  return { output: lines.join('\n'), type: 'output' };
}

function cmdFree(): CommandResult {
  return {
    output: `               total        used        free      shared  buff/cache   available
Mem:           16Gi       8.2Gi       4.1Gi       512Mi       3.7Gi       7.3Gi
Swap:           4Gi       0.5Gi       3.5Gi`,
    type: 'output'
  };
}

function cmdChmod(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) return { output: 'chmod: missing operand\nUsage: chmod <mode> <file>', type: 'error' };
  const modeStr = args[0];
  const file = args[1];
  const mode = parseInt(modeStr, 8);
  if (isNaN(mode) || mode < 0 || mode > 0o777) {
    return { output: `chmod: invalid mode: '${modeStr}'`, type: 'error' };
  }
  fs.chmod(file, mode);
  return { output: '', type: 'output' };
}

const KNOWN_HOSTS: Record<string, string> = {
  'github.com': '140.82.121.3',
  'google.com': '142.250.80.46',
  'appmaker.xyz': '104.21.54.162',
  'linkedin.com': '13.107.42.14',
  'twitter.com': '104.244.42.193',
  'localhost': '127.0.0.1',
  'abhi-portfolio': '192.168.1.42',
};

function cmdPing(args: string[]): CommandResult {
  if (args.length === 0) return { output: 'ping: usage: ping <hostname>', type: 'error' };
  const host = args[0];
  const ip = KNOWN_HOSTS[host];
  if (!ip) return { output: `ping: ${host}: Name or service not known`, type: 'error' };

  return {
    output: `PING ${host} (${ip}): 56 data bytes`,
    type: 'output',
    asyncAction: async () => {
      const results: string[] = [];
      let totalTime = 0;
      let minTime = Infinity;
      let maxTime = 0;

      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 800));
        const time = 10 + Math.random() * 40;
        totalTime += time;
        minTime = Math.min(minTime, time);
        maxTime = Math.max(maxTime, time);
        results.push(`64 bytes from ${ip}: icmp_seq=${i} ttl=54 time=${time.toFixed(1)} ms`);
      }

      const avg = totalTime / 4;
      results.push('');
      results.push(`--- ${host} ping statistics ---`);
      results.push(`4 packets transmitted, 4 received, 0% packet loss`);
      results.push(`rtt min/avg/max = ${minTime.toFixed(1)}/${avg.toFixed(1)}/${maxTime.toFixed(1)} ms`);
      return results.join('\n');
    }
  };
}

function cmdSsh(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) return { output: 'usage: ssh <hostname>', type: 'error' };
  const host = args[0];

  const servers: Record<string, () => string> = {
    'projects-server': () => {
      const files = fs.listDir('/home/visitor/projects');
      const content = files.map(f => fs.readFile(`/home/visitor/projects/${f}`)).join('\n\n');
      return `Connecting to projects-server...\nConnected.\n\nroot@projects-server:~# ls -la /srv/projects/\n\n${content}\n\nConnection to projects-server closed.`;
    },
    'skills-server': () => {
      const skills = fs.readFile('/home/visitor/skills.json');
      return `Connecting to skills-server...\nConnected.\n\nroot@skills-server:~# cat /etc/skills.conf\n\n${skills}\n\nConnection to skills-server closed.`;
    },
    'github': () => {
      return `Connecting to github.com...\nConnected.\n\ngit@github.com:~# whoami\n  User: abhisawesome\n  Repos: directory-serve, expenser, figmasync, proxyhub\n  Stars: 430+\n  URL: github.com/abhisawesome\n\nConnection to github.com closed.`;
    },
    'db-server': () => {
      return `Connecting to db-server...\nConnected.\n\npostgres@db-server:~# SELECT version();\n  PostgreSQL 16.1\n\npostgres@db-server:~# \\l\n  portfolio_db  | abhi | UTF8\n  analytics_db  | abhi | UTF8\n  cache_db      | abhi | UTF8\n\nConnection to db-server closed.`;
    },
  };

  const handler = servers[host];
  if (!handler) {
    const ip = KNOWN_HOSTS[host];
    if (ip) {
      return { output: `ssh: connect to host ${host} (${ip}): Connection refused`, type: 'error' };
    }
    return { output: `ssh: Could not resolve hostname ${host}: Name or service not known`, type: 'error' };
  }

  return { output: handler(), type: 'output' };
}

function cmdIfconfig(): CommandResult {
  return {
    output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 847293  bytes 1187432841 (1.1 GiB)
        TX packets 524817  bytes 89432156 (85.2 MiB)

docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:01  txqueuelen 0  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`,
    type: 'output'
  };
}

import type { VirtualFileSystem } from './virtualFileSystem';

export interface CommandResult {
  output: string;
  type: 'output' | 'error';
  clear?: boolean;
  launchGame?: string;
}

export interface CommandContext {
  isGameActive: boolean;
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

export function processCommand(
  raw: string,
  fs: VirtualFileSystem,
  context: CommandContext
): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { output: '', type: 'output' };

  // Parse redirect
  let commandPart = trimmed;
  let redirectFile: string | null = null;
  let appendMode = false;

  // Find redirect operator outside quotes
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

  const tokens = tokenize(commandPart);
  if (tokens.length === 0) return { output: '', type: 'output' };

  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  let result: CommandResult;

  try {
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
        result = cmdCat(fs, args);
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
        result = cmdHead(fs, args);
        break;
      case 'tail':
        result = cmdTail(fs, args);
        break;
      case 'wc':
        result = cmdWc(fs, args);
        break;
      case 'find':
        result = cmdFind(fs, args);
        break;
      case 'grep':
        result = cmdGrep(fs, args);
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
        result = {
          output: `Terminal theme: Matrix Green\nColors: Background #0a0a0a, Foreground #00ff00\nFont: Fira Code\n\nThis terminal uses a classic green-on-black theme inspired by retro terminals.`,
          type: 'output'
        };
        break;
      case 'uname':
        result = { output: args.includes('-a')
          ? 'AbhiOS 1.0.0 visitor-portfolio x86_64 GNU/Linux'
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
      // Portfolio command aliases
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
      case 'neofetch':
        result = cmdNeofetch();
        break;
      case 'man':
        result = cmdMan(args);
        break;
      case 'which':
        result = cmdWhich(args);
        break;
      default:
        result = { output: `Command not found: ${tokens[0]}. Type "help" for available commands.`, type: 'error' };
    }
  } catch (e) {
    result = { output: (e as Error).message, type: 'error' };
  }

  // Handle redirect
  if (redirectFile && result.type === 'output' && !result.clear && !result.launchGame) {
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
  echo <text>      - Print text (supports > and >>)

  PORTFOLIO:
  about            - Learn about me
  resume           - View my resume
  skills           - List technical skills
  projects         - View my projects
  contact          - Get contact information
  certifications   - View certifications
  achievements     - View awards

  SYSTEM:
  whoami           - Display current user
  date             - Show current date/time
  uname [-a]       - System information
  hostname         - Show hostname
  uptime           - Show uptime
  history          - Command history info
  neofetch         - System info display
  man <cmd>        - Manual for command
  which <cmd>      - Show command location
  theme            - Terminal theme info
  clear            - Clear the terminal

  GAMES:
  games            - List available games
  snake            - Play Snake game`,
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
      if (node.type === 'directory') {
        return `drwxr-xr-x  -        ${name}/`;
      }
      const size = String(node.content.length).padStart(8);
      return `-rw-r--r--  ${size}  ${name}`;
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

function cmdCat(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) return { output: 'cat: missing operand', type: 'error' };
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
    else if (arg === '-f') { /* force - just ignore errors */ }
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

function cmdHead(fs: VirtualFileSystem, args: string[]): CommandResult {
  let n = 10;
  let file = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
    else file = args[i];
  }
  if (!file) return { output: 'head: missing operand', type: 'error' };
  const content = fs.readFile(file);
  const lines = content.split('\n').slice(0, n);
  return { output: lines.join('\n'), type: 'output' };
}

function cmdTail(fs: VirtualFileSystem, args: string[]): CommandResult {
  let n = 10;
  let file = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[++i]); }
    else file = args[i];
  }
  if (!file) return { output: 'tail: missing operand', type: 'error' };
  const content = fs.readFile(file);
  const lines = content.split('\n').slice(-n);
  return { output: lines.join('\n'), type: 'output' };
}

function cmdWc(fs: VirtualFileSystem, args: string[]): CommandResult {
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

  // Walk the tree
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
      } catch { /* skip inaccessible */ }
    }
  };

  walk(resolved);
  return { output: results.join('\n') || 'No matches found.', type: 'output' };
}

function cmdGrep(fs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) return { output: 'usage: grep <pattern> <file>', type: 'error' };
  const pattern = args[0];
  const file = args[1];
  const content = fs.readFile(file);
  const regex = new RegExp(pattern, 'gi');
  const matches = content.split('\n').filter(line => regex.test(line));
  if (matches.length === 0) return { output: '', type: 'output' };
  return { output: matches.join('\n'), type: 'output' };
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
     ▄██████▄    OS: AbhiOS 1.0.0 (Portfolio Edition)
    ████▀▀████   Host: github.com/abhisawesome
   ████    ████  Kernel: React 19 + TypeScript
  ████▄    ████  Shell: terminal-portfolio v1.0
   ████▄▄████▀   Resolution: Responsive
    ▀████████▀   Theme: Matrix Green [Dark]
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
    grep: 'grep <pattern> <file> - Search for pattern in file',
    head: 'head [-n N] <file> - Show first N lines (default 10)',
    tail: 'tail [-n N] <file> - Show last N lines (default 10)',
    wc: 'wc <file> - Print line, word, and byte counts',
  };
  const page = manPages[args[0]];
  if (!page) return { output: `No manual entry for ${args[0]}`, type: 'error' };
  return { output: `NAME\n  ${page}`, type: 'output' };
}

function cmdWhich(args: string[]): CommandResult {
  if (args.length === 0) return { output: 'which: missing operand', type: 'error' };
  const builtins = [
    'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'rmdir', 'cp', 'mv',
    'echo', 'tree', 'find', 'grep', 'head', 'tail', 'wc', 'whoami', 'date',
    'clear', 'help', 'about', 'resume', 'skills', 'projects', 'contact',
    'certifications', 'achievements', 'games', 'snake', 'theme', 'neofetch',
    'uname', 'hostname', 'uptime', 'history', 'man', 'which'
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

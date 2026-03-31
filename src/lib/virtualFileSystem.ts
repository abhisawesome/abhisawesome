export interface FileNode {
  type: 'file';
  content: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface DirectoryNode {
  type: 'directory';
  createdAt: Date;
}

export type FSNode = FileNode | DirectoryNode;

export class VirtualFileSystem {
  private nodes: Map<string, FSNode> = new Map();
  private cwd = '/home/visitor';
  private prevCwd = '/home/visitor';

  constructor() {
    this.nodes.set('/', { type: 'directory', createdAt: new Date() });
    this.mkdirp('/home/visitor');
  }

  normalizePath(path: string): string {
    if (!path) return this.cwd;
    // Replace multiple slashes
    let p = path.replace(/\/+/g, '/');
    // Remove trailing slash (except root)
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  resolvePath(input: string): string {
    if (!input) return this.cwd;
    let path = input.trim();

    // Handle home shortcut
    if (path === '~' || path === '') return '/home/visitor';
    if (path.startsWith('~/')) path = '/home/visitor' + path.slice(1);

    // Make relative paths absolute
    if (!path.startsWith('/')) {
      path = this.cwd === '/' ? `/${path}` : `${this.cwd}/${path}`;
    }

    // Resolve . and ..
    const parts = path.split('/');
    const resolved: string[] = [];
    for (const part of parts) {
      if (part === '' || part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/') || '/';
  }

  getCwd(): string {
    return this.cwd;
  }

  getDisplayCwd(): string {
    const home = '/home/visitor';
    if (this.cwd === home) return '~';
    if (this.cwd.startsWith(home + '/')) return '~' + this.cwd.slice(home.length);
    return this.cwd;
  }

  setCwd(path: string): void {
    const resolved = this.resolvePath(path);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`cd: no such file or directory: ${path}`);
    if (node.type !== 'directory') throw new Error(`cd: not a directory: ${path}`);
    this.prevCwd = this.cwd;
    this.cwd = resolved;
  }

  getPrevCwd(): string {
    return this.prevCwd;
  }

  exists(path: string): boolean {
    return this.nodes.has(this.resolvePath(path));
  }

  isDirectory(path: string): boolean {
    const node = this.nodes.get(this.resolvePath(path));
    return node?.type === 'directory' || false;
  }

  isFile(path: string): boolean {
    const node = this.nodes.get(this.resolvePath(path));
    return node?.type === 'file' || false;
  }

  getNode(path: string): FSNode | undefined {
    return this.nodes.get(this.resolvePath(path));
  }

  mkdir(path: string): void {
    const resolved = this.resolvePath(path);
    if (this.nodes.has(resolved)) throw new Error(`mkdir: cannot create directory '${path}': File exists`);
    // Check parent exists
    const parent = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const parentNode = this.nodes.get(parent);
    if (!parentNode) throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
    if (parentNode.type !== 'directory') throw new Error(`mkdir: cannot create directory '${path}': Not a directory`);
    this.nodes.set(resolved, { type: 'directory', createdAt: new Date() });
  }

  mkdirp(path: string): void {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
      current += '/' + part;
      if (!this.nodes.has(current)) {
        this.nodes.set(current, { type: 'directory', createdAt: new Date() });
      } else {
        const node = this.nodes.get(current)!;
        if (node.type !== 'directory') throw new Error(`mkdir: '${current}' is not a directory`);
      }
    }
  }

  rmdir(path: string): void {
    const resolved = this.resolvePath(path);
    if (resolved === '/') throw new Error(`rmdir: cannot remove '/': Permission denied`);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`rmdir: failed to remove '${path}': No such file or directory`);
    if (node.type !== 'directory') throw new Error(`rmdir: failed to remove '${path}': Not a directory`);
    // Check if empty
    const children = this.listDir(resolved);
    if (children.length > 0) throw new Error(`rmdir: failed to remove '${path}': Directory not empty`);
    this.nodes.delete(resolved);
  }

  listDir(path?: string): string[] {
    const resolved = path ? this.resolvePath(path) : this.cwd;
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`ls: cannot access '${path || '.'}': No such file or directory`);
    if (node.type !== 'directory') throw new Error(`ls: '${path || '.'}' is not a directory`);

    const prefix = resolved === '/' ? '/' : resolved + '/';
    const children: string[] = [];
    for (const key of this.nodes.keys()) {
      if (key === resolved) continue;
      if (key.startsWith(prefix)) {
        const rest = key.slice(prefix.length);
        if (!rest.includes('/')) {
          children.push(rest);
        }
      }
    }
    return children.sort();
  }

  readFile(path: string): string {
    const resolved = this.resolvePath(path);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`cat: ${path}: No such file or directory`);
    if (node.type === 'directory') throw new Error(`cat: ${path}: Is a directory`);
    return node.content;
  }

  writeFile(path: string, content: string): void {
    const resolved = this.resolvePath(path);
    // Check parent exists
    const parent = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const parentNode = this.nodes.get(parent);
    if (!parentNode || parentNode.type !== 'directory') {
      throw new Error(`No such file or directory: ${path}`);
    }
    const existing = this.nodes.get(resolved);
    if (existing && existing.type === 'directory') throw new Error(`Cannot write to directory: ${path}`);
    this.nodes.set(resolved, {
      type: 'file',
      content,
      createdAt: existing?.type === 'file' ? existing.createdAt : new Date(),
      modifiedAt: new Date(),
    });
  }

  appendFile(path: string, content: string): void {
    const resolved = this.resolvePath(path);
    const existing = this.nodes.get(resolved);
    if (existing && existing.type === 'file') {
      this.writeFile(path, existing.content + content);
    } else {
      this.writeFile(path, content);
    }
  }

  deleteFile(path: string): void {
    const resolved = this.resolvePath(path);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`rm: cannot remove '${path}': No such file or directory`);
    if (node.type === 'directory') throw new Error(`rm: cannot remove '${path}': Is a directory`);
    this.nodes.delete(resolved);
  }

  deleteRecursive(path: string): void {
    const resolved = this.resolvePath(path);
    if (resolved === '/') throw new Error(`rm: cannot remove '/': Permission denied`);
    if (resolved === '/home/visitor') throw new Error(`rm: cannot remove home directory`);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`rm: cannot remove '${path}': No such file or directory`);

    const prefix = resolved + '/';
    const toDelete: string[] = [resolved];
    for (const key of this.nodes.keys()) {
      if (key.startsWith(prefix)) toDelete.push(key);
    }
    for (const key of toDelete) {
      this.nodes.delete(key);
    }
  }

  copy(src: string, dest: string): void {
    const srcResolved = this.resolvePath(src);
    const srcNode = this.nodes.get(srcResolved);
    if (!srcNode) throw new Error(`cp: cannot stat '${src}': No such file or directory`);

    let destResolved = this.resolvePath(dest);
    const destNode = this.nodes.get(destResolved);

    if (srcNode.type === 'file') {
      if (destNode?.type === 'directory') {
        const name = srcResolved.split('/').pop()!;
        destResolved = destResolved === '/' ? `/${name}` : `${destResolved}/${name}`;
      }
      this.writeFile(destResolved, srcNode.content);
    } else {
      throw new Error(`cp: -r not specified; omitting directory '${src}'`);
    }
  }

  move(src: string, dest: string): void {
    const srcResolved = this.resolvePath(src);
    const srcNode = this.nodes.get(srcResolved);
    if (!srcNode) throw new Error(`mv: cannot stat '${src}': No such file or directory`);

    let destResolved = this.resolvePath(dest);
    const destNode = this.nodes.get(destResolved);

    if (destNode?.type === 'directory') {
      const name = srcResolved.split('/').pop()!;
      destResolved = destResolved === '/' ? `/${name}` : `${destResolved}/${name}`;
    }

    if (srcNode.type === 'file') {
      this.writeFile(destResolved, srcNode.content);
      this.nodes.delete(srcResolved);
    } else {
      // Move directory and all children
      const prefix = srcResolved + '/';
      const entries: [string, FSNode][] = [[srcResolved, srcNode]];
      for (const [key, node] of this.nodes.entries()) {
        if (key.startsWith(prefix)) entries.push([key, node]);
      }
      // Delete old
      for (const [key] of entries) this.nodes.delete(key);
      // Create new
      for (const [key, node] of entries) {
        const newKey = destResolved + key.slice(srcResolved.length);
        this.nodes.set(newKey, node);
      }
    }
  }

  getTree(path?: string, prefix = '', isLast = true, isRoot = true): string {
    const resolved = path ? this.resolvePath(path) : this.cwd;
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`tree: '${path || '.'}': No such file or directory`);

    const name = resolved === '/' ? '/' : resolved.split('/').pop()!;
    let result = '';

    if (isRoot) {
      result = name + '\n';
    } else {
      result = prefix + (isLast ? '└── ' : '├── ') + name + '\n';
    }

    if (node.type === 'directory') {
      const children = this.listDir(resolved);
      const childPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
      children.forEach((child, i) => {
        const childPath = resolved === '/' ? `/${child}` : `${resolved}/${child}`;
        const childIsLast = i === children.length - 1;
        result += this.getTree(childPath, childPrefix, childIsLast, false);
      });
    }

    return result;
  }
}

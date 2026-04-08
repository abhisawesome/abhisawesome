import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Star } from 'lucide-react';

const RESUME_URL = 'abhisawesome.github.io/resume';

const BOOKMARKS = [
  { label: 'Resume', url: RESUME_URL },
  { label: 'GitHub', url: 'github.com/abhisawesome' },
  { label: 'LinkedIn', url: 'linkedin.com/in/abhijithv' },
];

interface BrowserProps {
  onClose: () => void;
  initialUrl?: string;
}

export const Browser: React.FC<BrowserProps> = ({ initialUrl }) => {
  const [url, setUrl] = useState(initialUrl || RESUME_URL);
  const [inputUrl, setInputUrl] = useState(initialUrl || RESUME_URL);

  const navigate = (newUrl: string) => {
    setUrl(newUrl);
    setInputUrl(newUrl);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl.trim());
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#202124] text-[#e8eaed] rounded-b-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#35363a] border-b border-[#1a1a1a] shrink-0">
        <button className="p-1 rounded-full opacity-30 cursor-default">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1 rounded-full opacity-30 cursor-default">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => navigate(url)} className="p-1 rounded-full hover:bg-[#4a4b4f] transition-colors">
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* URL bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 mx-1">
          <div className="flex items-center bg-[#202124] rounded-full px-3 py-1 border border-[#4a4b4f] focus-within:border-[#8ab4f8]">
            <Lock className="w-3 h-3 text-[#9aa0a6] shrink-0 mr-2" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none text-[#e8eaed] min-w-0"
              spellCheck={false}
            />
          </div>
        </form>

        <button className="p-1 rounded-full hover:bg-[#4a4b4f] transition-colors">
          <Star className="w-3.5 h-3.5 text-[#9aa0a6]" />
        </button>
      </div>

      {/* Bookmarks bar */}
      <div className="flex items-center gap-1 px-3 py-1 bg-[#292a2d] border-b border-[#1a1a1a] text-[10px] shrink-0 overflow-x-auto scrollbar-hide">
        {BOOKMARKS.map(bm => (
          <button
            key={bm.url}
            onClick={() => navigate(bm.url)}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#4a4b4f] transition-colors text-[#9aa0a6] hover:text-[#e8eaed]"
          >
            <div className="w-3 h-3 rounded-sm bg-[#4a4b4f] flex items-center justify-center text-[8px] font-bold text-[#8ab4f8]">
              {bm.label[0]}
            </div>
            {bm.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto bg-white min-h-0">
        {url.includes('proxyhub.app') ? (
          <iframe src="https://proxyhub.app/" className="w-full h-full border-0" title="ProxyHub" />
        ) : url.includes('directory-serve') ? (
          <DirectoryServePage />
        ) : url.includes('resume') || url === RESUME_URL ? (
          <ResumePage />
        ) : url.includes('github') ? (
          <PlaceholderPage title="GitHub" subtitle="github.com/abhisawesome" />
        ) : url.includes('linkedin') ? (
          <PlaceholderPage title="LinkedIn" subtitle="linkedin.com/in/abhijithv" />
        ) : (
          <PlaceholderPage title="Page not found" subtitle={url} />
        )}
      </div>
    </div>
  );
};

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-[#f8f9fa]">
      <div className="text-center">
        <div className="text-4xl mb-4">🌐</div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        <p className="text-xs text-gray-400 mt-4">External links are not loaded in this browser</p>
      </div>
    </div>
  );
}

function DirectoryServePage() {
  return (
    <div className="min-h-full bg-[#0d1117]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }}>
      {/* GitHub-style repo header */}
      <div className="border-b border-[#30363d] bg-[#161b22] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" /></svg>
            <a href="#" className="text-[#58a6ff] hover:underline">cube-root</a>
            <span className="text-[#8b949e]">/</span>
            <a href="#" className="text-[#58a6ff] hover:underline font-semibold">directory-serve</a>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] border border-[#30363d] rounded-full text-[#8b949e]">Public</span>
          </div>
          <p className="text-[#8b949e] text-sm mt-2">CLI tool to send and receive files on a network to a server</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8b949e]">
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-[#e3b341]" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg> 431</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" /></svg> Forks</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f1e05a] inline-block"></span> JavaScript</span>
          </div>
        </div>
      </div>

      {/* README content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="border border-[#30363d] rounded-md">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#30363d] rounded-t-md">
            <svg className="w-4 h-4 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" /></svg>
            <span className="text-sm font-semibold text-[#c9d1d9]">README.md</span>
          </div>
          <div className="p-6 text-[#c9d1d9]">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-[#c9d1d9] pb-2 border-b border-[#30363d] mb-4">Directory Serve</h1>
            <p className="text-sm text-[#8b949e] mb-6">A CLI library for sending and receiving files from your Android and iOS devices.</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-0.5 bg-[#238636] text-white text-xs rounded-md font-medium">npm v1.3.6</span>
              <span className="px-2 py-0.5 bg-[#1f6feb] text-white text-xs rounded-md font-medium">431 stars</span>
              <span className="px-2 py-0.5 bg-[#8957e5] text-white text-xs rounded-md font-medium">Node.js</span>
            </div>

            {/* Install */}
            <h2 className="text-lg font-semibold text-[#c9d1d9] pb-1 border-b border-[#30363d] mb-3 mt-6">Installation</h2>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-4 py-3 mb-4 font-mono text-sm">
              <span className="text-[#8b949e]">$</span> <span className="text-[#79c0ff]">npm install -g directory-serve</span>
            </div>

            {/* Usage */}
            <h2 className="text-lg font-semibold text-[#c9d1d9] pb-1 border-b border-[#30363d] mb-3 mt-6">Usage</h2>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-4 py-3 mb-2 font-mono text-sm">
              <span className="text-[#8b949e]">$</span> <span className="text-[#79c0ff]">directory-serve</span> <span className="text-[#a5d6ff]">/path-of-directory</span>
            </div>
            <p className="text-sm text-[#8b949e] mb-4">Or without global installation:</p>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md px-4 py-3 mb-4 font-mono text-sm">
              <span className="text-[#8b949e]">$</span> <span className="text-[#79c0ff]">npx directory-serve</span> <span className="text-[#a5d6ff]">.</span>
            </div>

            {/* Features */}
            <h2 className="text-lg font-semibold text-[#c9d1d9] pb-1 border-b border-[#30363d] mb-3 mt-6">Features</h2>
            <ul className="space-y-2 text-sm mb-6">
              {[
                'Serve files and directories over the network',
                'Upload and download support',
                'Web-based client interface for file management',
                'Authentication with username/password',
                'File and folder deletion',
                'Configurable port',
                'Debug mode for troubleshooting',
              ].map(f => (
                <li key={f} className="flex gap-2 items-start">
                  <span className="text-[#3fb950] mt-0.5">&#10003;</span>
                  <span className="text-[#c9d1d9]">{f}</span>
                </li>
              ))}
            </ul>

            {/* Options table */}
            <h2 className="text-lg font-semibold text-[#c9d1d9] pb-1 border-b border-[#30363d] mb-3 mt-6">Options</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-[#30363d] rounded-md">
                <thead>
                  <tr className="bg-[#161b22] border-b border-[#30363d]">
                    <th className="text-left px-3 py-2 text-[#c9d1d9] font-semibold">Flag</th>
                    <th className="text-left px-3 py-2 text-[#c9d1d9] font-semibold">Default</th>
                    <th className="text-left px-3 py-2 text-[#c9d1d9] font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { flag: '-u', def: 'true', desc: 'Toggle upload restrictions' },
                    { flag: '-p', def: '8989', desc: 'Specify custom port' },
                    { flag: '--username', def: 'undefined', desc: 'Set authentication username' },
                    { flag: '--password', def: 'undefined', desc: 'Set authentication password' },
                    { flag: '--delete', def: 'false', desc: 'Enable file/folder deletion' },
                    { flag: '--debug', def: 'false', desc: 'Enable debug logging' },
                  ].map(opt => (
                    <tr key={opt.flag} className="border-b border-[#30363d]">
                      <td className="px-3 py-2 font-mono text-[#79c0ff] text-xs">{opt.flag}</td>
                      <td className="px-3 py-2 font-mono text-[#a5d6ff] text-xs">{opt.def}</td>
                      <td className="px-3 py-2 text-[#8b949e]">{opt.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Examples */}
            <h2 className="text-lg font-semibold text-[#c9d1d9] pb-1 border-b border-[#30363d] mb-3 mt-6">Examples</h2>
            <div className="space-y-2 mb-6">
              {[
                'npx directory-serve .',
                'npx directory-serve ~/Desktop -p=3000 --username=test --password=password',
                'npx directory-serve ~/Desktop/my_image.png',
              ].map(cmd => (
                <div key={cmd} className="bg-[#161b22] border border-[#30363d] rounded-md px-4 py-2 font-mono text-sm">
                  <span className="text-[#8b949e]">$</span> <span className="text-[#79c0ff]">{cmd}</span>
                </div>
              ))}
            </div>

            {/* Footer link */}
            <div className="border-t border-[#30363d] pt-4 mt-6 text-center">
              <a href="https://github.com/cube-root/directory-serve" target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline text-sm">
                View on GitHub &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-8" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Abhijith V</h1>
        <p className="text-lg text-gray-600 mt-1">R&D Engineer</p>
        <div className="flex flex-wrap gap-3 sm:gap-5 mt-3 text-xs sm:text-sm text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-colors">linkedin.com/in/abhijithv</a>
          <a href="#" className="hover:text-blue-600 transition-colors">github.com/abhisawesome</a>
          <a href="#" className="hover:text-blue-600 transition-colors">twitter.com/abhisawzm</a>
        </div>
      </header>

      {/* About */}
      <section className="mb-6">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          Passionate software developer with <strong>7+ years</strong> of experience building innovative, scalable solutions.
          Specializing in full-stack development, cloud technologies, and creating efficient applications.
          Copyright holder for an encryption algorithm in India (Diary No: 4977/2019-CO/SW).
        </p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Work Experience</h2>

        <div className="mb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">R&D Engineer</h3>
            <span className="text-xs sm:text-sm text-gray-500">7+ years — Present</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">appmaker.xyz</p>
          <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Building product to convert E-Commerce sites to Native Apps without code</li>
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Node.js, React, TypeScript, Next.js, Docker, Kubernetes</li>
          </ul>
        </div>

        <div className="mb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">Full Stack Developer</h3>
            <span className="text-xs sm:text-sm text-gray-500">3+ years</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">Gitzberry Technologies</p>
          <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Order apps for restaurants and supermarkets</li>
            <li className="flex gap-2"><span className="text-gray-400">▸</span>PHP, Node.js, React Native, React JS, Docker, Python</li>
          </ul>
        </div>

        <div className="mb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">Full Stack Developer Intern</h3>
            <span className="text-xs sm:text-sm text-gray-500">1 month</span>
          </div>
          <p className="text-sm text-blue-700 font-medium">Monlash Solutions</p>
          <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Customer complaint and employee tracker</li>
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Spring Boot, React Native</li>
          </ul>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Technical Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Languages & Frameworks</h4>
            <div className="flex flex-wrap gap-1.5">
              {['TypeScript', 'Node.js', 'React', 'Next.js', 'React Native', 'Python', 'GraphQL', 'Bun', 'Flask', 'PHP', 'C++'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Databases</h4>
            <div className="flex flex-wrap gap-1.5">
              {['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'Supabase', 'ClickHouse', 'BigQuery'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <h4 className="font-semibold text-gray-700 mb-1">DevOps & Cloud</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Hetzner', 'DigitalOcean', 'Vultr'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Open Source Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Directory Serve', stars: '430+', desc: 'CLI tool to share/send/receive files on a network', tech: 'Node.js' },
            { name: 'MyExpense', stars: '10+', desc: 'Manage bills using Google Sheets as backend', tech: 'Next.js, TypeScript' },
            { name: 'FigmaSync', desc: 'Figma plugin to sync designs with GitHub', tech: 'Figma Plugin' },
            { name: 'ProxyHub', desc: 'Proxy management for multiple configs', tech: 'Node.js', live: 'proxyhub.app' },
          ].map(p => (
            <div key={p.name} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 text-sm">{p.name}</h4>
                {p.stars && <span className="text-xs text-yellow-600">⭐ {p.stars}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{p.tech}</span>
                {p.live && <span className="text-[10px] text-blue-600">{p.live}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Education</h2>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">Bachelor of Computer Science</h3>
          <ul className="mt-1 space-y-0.5 text-xs sm:text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400">▸</span>Awarded Best Outgoing Student (GEM of CSE)</li>
            <li className="flex gap-2"><span className="text-gray-400">▸</span>EXCEL Chairman & CSI Student Convener</li>
          </ul>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
          <div className="flex gap-2"><span>🏆</span><span>Copyright holder — Encryption Algorithm (India)</span></div>
          <div className="flex gap-2"><span>🎓</span><span>Best Outgoing Student (GEM of CSE)</span></div>
          <div className="flex gap-2"><span>🏅</span><span>Best Project Award — Gvardios</span></div>
          <div className="flex gap-2"><span>📝</span><span>Research Paper — KETCON</span></div>
          <div className="flex gap-2"><span>🥈</span><span>2nd Prize — Hack4People 2.0</span></div>
          <div className="flex gap-2"><span>🥈</span><span>2nd Prize — HackIn50 hours</span></div>
          <div className="flex gap-2"><span>🏅</span><span>4th Prize — OneHack 1.0</span></div>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 mb-4">Certifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs sm:text-sm text-gray-600">
          {[
            'Database Management System — QEEE Program',
            'Python Programming — NPTEL',
            'Arduino Programming',
            'Python for Data Science — DataCamp',
            'Python for Data Science — IBM',
            'Machine Learning — IBM',
          ].map(c => (
            <div key={c} className="flex gap-2"><span className="text-gray-400">✓</span><span>{c}</span></div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        Generated from terminal portfolio — abhisawesome.github.io
      </footer>
    </div>
  );
}

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
}

export const Browser: React.FC<BrowserProps> = () => {
  const [url, setUrl] = useState(RESUME_URL);
  const [inputUrl, setInputUrl] = useState(RESUME_URL);

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
        {url.includes('resume') || url === RESUME_URL ? (
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

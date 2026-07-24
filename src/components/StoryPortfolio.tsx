import { useEffect, useState, type MouseEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  FilePenLine,
  FileText,
  Github,
  Grid3X3,
  Laptop,
  Linkedin,
  LockKeyhole,
  Network,
  Orbit,
  Palette,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  Terminal,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

type LabId = 'pdf' | 'expense' | 'proxy' | 'directory' | 'words' | 'bingo' | 'rcea'

const labs = [
  {
    id: 'proxy' as const,
    number: '01',
    name: 'ProxyHub',
    short: 'Internet tunnels',
    statement: 'Turn localhost into a public link.',
    description: 'A free, self-hostable ngrok alternative for sharing work in progress, receiving webhooks and testing from anywhere.',
    url: 'https://proxyhub.app',
    accent: '#73d7ff',
    icon: Network,
    tags: ['Open source', 'Self-hostable', 'Developer tool'],
  },
  {
    id: 'directory' as const,
    number: '02',
    name: 'Directory Serve',
    short: 'Frictionless sharing',
    statement: 'Move a file. Skip the setup.',
    description: 'A tiny tool for sending files between a computer and phone on the same network—with more than 430 GitHub stars.',
    url: 'https://github.com/cube-root/directory-serve',
    accent: '#bd9cff',
    icon: Send,
    tags: ['Open source', '430+ stars', 'CLI tool'],
  },
  {
    id: 'rcea' as const,
    number: '03',
    name: 'RCEA',
    short: 'Encryption research',
    statement: 'A new way to protect information.',
    description: 'An original encryption algorithm copyrighted as computer software with the Copyright Office, Government of India (Diary No. 4977/2019-CO/SW; RoC No. SW-12543/2019).',
    url: 'https://rcea.abhijith.me',
    accent: '#67e8a5',
    icon: LockKeyhole,
    tags: ['Copyrighted in India', 'Encryption', 'Research'],
  },
  {
    id: 'pdf' as const,
    number: '04',
    name: 'PDF Toolkit',
    short: 'Private document tools',
    statement: 'Your documents should stay yours.',
    description: 'Merge, edit and annotate PDFs inside the browser. Nothing is uploaded, so private files never leave the device.',
    url: 'https://pdf.abhijith.me',
    accent: '#ff7a55',
    icon: FilePenLine,
    tags: ['Privacy first', 'Browser based', 'Live product'],
  },
  {
    id: 'expense' as const,
    number: '05',
    name: 'MyExpense',
    short: 'Personal finance',
    statement: 'Track money without surrendering the data.',
    description: 'A focused expense tracker where categories, budgets and transactions live in a Google Sheet controlled by the user.',
    url: 'https://expense.abhijith.me',
    accent: '#c8ff65',
    icon: CircleDollarSign,
    tags: ['Open source', 'User owned data', 'Live product'],
  },
  {
    id: 'words' as const,
    number: '06',
    name: 'DoodleDash',
    short: 'Multiplayer drawing game',
    statement: 'Draw it. Guess it. Play together.',
    description: 'An online multiplayer drawing and guessing game for playing with friends in real time.',
    url: 'https://words.abhijith.me/',
    accent: '#ffcf5c',
    icon: Palette,
    tags: ['Multiplayer', 'Drawing game', 'Live product'],
  },
  {
    id: 'bingo' as const,
    number: '07',
    name: 'Bingo',
    short: 'Social bingo cards',
    statement: 'Make a card. Share the fun.',
    description: 'Create a custom bingo card, share it with friends and mark off moments together right from the browser.',
    url: 'https://bingo.abhijith.me',
    accent: '#ff8fcf',
    icon: Grid3X3,
    tags: ['Open source', 'Social game', 'Live product'],
  },
]

function ProductDemo({ id, accent }: { id: LabId; accent: string }) {
  const [pdfMerged, setPdfMerged] = useState(false)
  const [expenses, setExpenses] = useState<number[]>([680, 240])
  const [connected, setConnected] = useState(false)
  const [sent, setSent] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [bingoMarks, setBingoMarks] = useState<number[]>([6, 12, 18])
  const [encrypted, setEncrypted] = useState(false)

  if (id === 'pdf') {
    return (
      <div className="lab-demo lab-pdf">
        <div className={`pdf-pages ${pdfMerged ? 'is-merged' : ''}`}>
          {[1, 2, 3].map((page) => <div key={page} className="pdf-page"><FileText /><span>PAGE {page}</span><i /></div>)}
        </div>
        <button className="lab-action" style={{ background: accent }} onClick={() => setPdfMerged(!pdfMerged)}>
          {pdfMerged ? <><RotateCcw /> Separate pages</> : <><Sparkles /> Merge privately</>}
        </button>
        {pdfMerged && <p className="demo-success"><ShieldCheck /> Complete. No upload required.</p>}
      </div>
    )
  }

  if (id === 'expense') {
    const total = expenses.reduce((sum, amount) => sum + amount, 0)
    return (
      <div className="lab-demo expense-demo">
        <div className="expense-total"><small>SPENT THIS WEEK</small><strong>${total.toLocaleString('en-US')}</strong><span>Stored in your Google Sheet</span></div>
        <div className="expense-list">
          {expenses.map((amount, index) => <div key={`${amount}-${index}`}><span>{index === 0 ? 'Groceries' : index === 1 ? 'Coffee' : 'New expense'}</span><b>${amount}</b></div>)}
        </div>
        <button className="lab-action" style={{ background: accent }} onClick={() => setExpenses(current => current.length > 2 ? [680, 240] : [...current, 450])}>
          {expenses.length > 2 ? <><RotateCcw /> Reset demo</> : <><CircleDollarSign /> Add $450 expense</>}
        </button>
      </div>
    )
  }

  if (id === 'proxy') {
    return (
      <div className="lab-demo proxy-demo">
        <div className="network-map">
          <div className="network-node"><Laptop /><span>localhost:3000</span></div>
          <div className={`network-line ${connected ? 'is-connected' : ''}`}><i /><i /><i /></div>
          <div className={`network-node public ${connected ? 'is-connected' : ''}`}><Wifi /><span>{connected ? 'your-app.proxyhub.app' : 'Public internet'}</span></div>
        </div>
        <button className="lab-action" style={{ background: accent }} onClick={() => setConnected(!connected)}>
          {connected ? <><X /> Close tunnel</> : <><Zap /> Open tunnel</>}
        </button>
        {connected && <p className="demo-success"><Check /> Your local project is live.</p>}
      </div>
    )
  }

  if (id === 'words') {
    return (
      <div className="lab-demo proxy-demo">
        <div className="network-map">
          <div className="network-node"><Palette /><span>{playing ? 'Draw: _ _ _ _ _' : 'Create a room'}</span></div>
          <div className={`network-line ${playing ? 'is-connected' : ''}`}><i /><i /><i /></div>
          <div className={`network-node public ${playing ? 'is-connected' : ''}`}><Users /><span>{playing ? 'Friends are guessing…' : 'Invite friends'}</span></div>
        </div>
        <button className="lab-action" style={{ background: accent }} onClick={() => setPlaying(!playing)}>
          {playing ? <><RotateCcw /> Reset round</> : <><Play /> Start a round</>}
        </button>
        {playing && <p className="demo-success"><Check /> The multiplayer round has started.</p>}
      </div>
    )
  }

  if (id === 'bingo') {
    return (
      <div className="lab-demo bingo-demo">
        <div className="bingo-card" aria-label="Interactive bingo card">
          {Array.from({ length: 25 }, (_, index) => (
            <button
              type="button"
              key={index}
              className={bingoMarks.includes(index) ? 'is-marked' : ''}
              onClick={() => setBingoMarks(current => current.includes(index) ? current.filter(mark => mark !== index) : [...current, index])}
              aria-label={`${bingoMarks.includes(index) ? 'Unmark' : 'Mark'} bingo square ${index + 1}`}
            >
              {index === 12 ? 'FREE' : index + 1}
            </button>
          ))}
        </div>
        <p className="bingo-hint">Tap any square to mark your card.</p>
      </div>
    )
  }

  if (id === 'rcea') {
    return (
      <div className="lab-demo rcea-demo">
        <div className={`cipher-card ${encrypted ? 'is-encrypted' : ''}`}>
          <LockKeyhole />
          <small>{encrypted ? 'RCEA CIPHERTEXT' : 'PLAINTEXT'}</small>
          <strong>{encrypted ? '7F A2 91 C8 4D E6' : 'PROTECT THIS'}</strong>
          <span>DIARY 4977/2019-CO/SW · ROC SW-12543/2019</span>
        </div>
        <button className="lab-action" style={{ background: accent }} onClick={() => setEncrypted(current => !current)}>
          {encrypted ? <><RotateCcw /> Decrypt demo</> : <><ShieldCheck /> Encrypt with RCEA</>}
        </button>
      </div>
    )
  }

  return (
    <div className="lab-demo send-demo">
      <div className={`device-transfer ${sent ? 'is-sent' : ''}`}>
        <div className="device laptop"><Laptop /><span>project.zip</span></div>
        <div className="transfer-track"><FileText /><i /></div>
        <div className="device phone"><Smartphone />{sent && <Check />}</div>
      </div>
      <button className="lab-action" style={{ background: accent }} onClick={() => setSent(!sent)}>
        {sent ? <><RotateCcw /> Send again</> : <><Send /> Send to phone</>}
      </button>
      {sent && <p className="demo-success"><Check /> Received. No cable, login or cloud.</p>}
    </div>
  )
}

export function StoryPortfolio() {
  const [activeLab, setActiveLab] = useState<LabId>(labs[0].id)
  const [pointer, setPointer] = useState({ x: 50, y: 50 })
  const [isLight, setIsLight] = useState(() => localStorage.getItem('story-theme') === 'light')
  const active = labs.find(lab => lab.id === activeLab) ?? labs[0]

  useEffect(() => {
    setActiveLab(labs[0].id)
  }, [])

  useEffect(() => {
    localStorage.setItem('story-theme', isLight ? 'light' : 'dark')
  }, [isLight])

  const moveLight = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setPointer({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 })
  }

  return (
    <div className={`product-lab ${isLight ? 'light-mode' : ''} h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#0c0e12] text-[#f5f2e9] selection:bg-[#c8ff65] selection:text-black`}>
      <header className="lab-nav">
        <a href="#home" className="lab-logo"><span><img src={`${import.meta.env.BASE_URL}images/developer-avatar.png`} alt="AV — Abhijith V working at a computer" /></span><div><b>ABHIJITH V</b><small>PRODUCT LAB</small></div></a>
        <nav><a href="#experiments">Experiments</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
        <div className="lab-nav-actions">
          <div className="lab-status"><i /> Available to collaborate</div>
          <button className="theme-toggle" type="button" onClick={() => setIsLight(current => !current)} aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}>
            {isLight ? <Moon /> : <Sun />}
          </button>
        </div>
      </header>

      <section id="home" className="lab-hero" onMouseMove={moveLight} style={{ '--light-x': `${pointer.x}%`, '--light-y': `${pointer.y}%` } as React.CSSProperties}>
        <div className="hero-grid" />
        <div className="hero-copy">
          <p className="lab-eyebrow"><Orbit /> R&amp;D engineer · inventor · product builder</p>
          <h1>I turn<br /><em>friction</em> into<br /><span>products.</span></h1>
          <p className="hero-intro">For 7+ years, I’ve been finding unnecessarily difficult things—and building a simpler way to do them.</p>
          <div className="hero-actions">
            <a href="#experiments" className="primary-cta">Enter the lab <ArrowDown /></a>
            <a href="https://github.com/abhisawesome" target="_blank" rel="noreferrer" className="text-cta">Explore my code <ArrowUpRight /></a>
          </div>
        </div>

        <div className="hero-reactor" aria-hidden="true">
          <div className="reactor-ring ring-one" />
          <div className="reactor-ring ring-two" />
          <div className="reactor-core"><Code2 /><span>IDEA</span><b>→</b><span>USEFUL</span></div>
          {labs.map((lab, index) => <div key={lab.id} className={`orbit-product orbit-${index + 1}`} style={{ '--accent': lab.accent } as React.CSSProperties}><lab.icon /><span>{lab.name}</span></div>)}
        </div>
        <div className="scroll-note"><span>SCROLL TO EXPERIMENT</span><i /></div>
      </section>

      <section className="lab-marquee" aria-label="Areas of work">
        <div>{['PRIVACY', 'OPEN SOURCE', 'PRODUCT THINKING', 'RESEARCH', 'USEFUL SOFTWARE', 'PRIVACY', 'OPEN SOURCE', 'PRODUCT THINKING'].map((word, index) => <span key={`${word}-${index}`}>{word}<Sparkles /></span>)}</div>
      </section>

      <section id="experiments" className="experiments-section">
        <div className="section-heading">
          <div><p className="lab-eyebrow">Selected experiments · 001—007</p><h2>Don’t just read.<br /><span>Try the idea.</span></h2></div>
          <p>Every project began with a real frustration. Use the mini experiments to feel what each product makes simpler.</p>
        </div>

        <div className="experiment-shell" style={{ '--active-accent': active.accent } as React.CSSProperties}>
          <div className="experiment-tabs">
            {labs.map(lab => (
              <button key={lab.id} onClick={() => setActiveLab(lab.id)} className={activeLab === lab.id ? 'active' : ''}>
                <span>{lab.number}</span><lab.icon /><div><b>{lab.name}</b><small>{lab.short}</small></div><ChevronRight />
              </button>
            ))}
          </div>

          <article className="experiment-stage" key={active.id}>
            <div className="stage-copy">
              <p className="stage-number">EXPERIMENT {active.number}</p>
              <h3>{active.statement}</h3>
              <p>{active.description}</p>
              <div className="stage-tags">{active.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              <a href={active.url} target="_blank" rel="noreferrer">Launch {active.name} <ArrowUpRight /></a>
            </div>
            <div className="stage-demo"><div className="demo-label"><i /> INTERACTIVE DEMO</div><ProductDemo id={active.id} accent={active.accent} /></div>
          </article>
        </div>
      </section>

      <section id="about" className="lab-about">
        <div className="about-statement"><p className="lab-eyebrow">The person behind the products</p><h2>Curious enough to ask why.<br /><span>Restless enough to build better.</span></h2></div>
        <div className="about-grid">
          <div className="about-copy"><p>Hi, I’m Abhijith—an R&amp;D Engineer at appmaker.xyz. I work across product thinking, engineering and experimentation to turn early ideas into tools people can actually use.</p><p>I care about ownership, privacy, simplicity and open-source software. The best technology disappears into a good experience.</p><a href="https://www.linkedin.com/in/abhijithv" target="_blank" rel="noreferrer">My full journey <ArrowRight /></a></div>
          <div className="proof-grid">
            <div><strong>7+</strong><span>Years shipping products</span></div>
            <div><strong>430+</strong><span>Stars on Directory Serve</span></div>
            <div><Award /><span>Encryption Algorithm copyright in India · RoC No. SW-12543/2019</span></div>
            <div><Users /><span>Hackathon winner</span></div>
          </div>
        </div>
      </section>

      <section className="terminal-easter">
        <div className="terminal-window"><div className="terminal-bar"><i /><i /><i /><span>abhijith@product-lab ~</span></div><div className="terminal-body"><p><b>visitor@lab:~$</b> whoami</p><p className="terminal-answer">Someone who believes software should feel like a superpower, not homework.</p><p><b>visitor@lab:~$</b> <span className="terminal-cursor" /></p></div></div>
        <div><p className="lab-eyebrow"><Terminal /> Still want the technical details?</p><h2>There’s a whole operating system next door.</h2><p>Use the Developer view switch at the top to explore projects, files and terminal commands the nerdy way.</p></div>
      </section>

      <footer id="contact" className="lab-footer">
        <p className="lab-eyebrow">Have a useful idea?</p>
        <h2>Let’s make it<br /><em>real.</em></h2>
        <div className="footer-row"><a href="https://www.linkedin.com/in/abhijithv" target="_blank" rel="noreferrer" className="footer-cta"><Play /> Start a conversation</a><div><a href="https://github.com/abhisawesome" target="_blank" rel="noreferrer"><Github /> GitHub</a><a href="https://www.linkedin.com/in/abhijithv" target="_blank" rel="noreferrer"><Linkedin /> LinkedIn</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} ABHIJITH V</span><span>DESIGNED TO BE EXPLORED</span><a href="#home">BACK TO TOP ↑</a></div>
      </footer>
    </div>
  )
}

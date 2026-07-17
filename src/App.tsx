import { useEffect, useState } from 'react'
import { Code2, Sparkles } from 'lucide-react'
import { Desktop } from './components/Desktop'
import { StoryPortfolio } from './components/StoryPortfolio'

type PortfolioView = 'story' | 'developer'

function App() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  const [view, setView] = useState<PortfolioView>(() => {
    const saved = localStorage.getItem('portfolio-view')
    return saved === 'developer' ? 'developer' : 'story'
  })

  useEffect(() => {
    localStorage.setItem('portfolio-view', view)
  }, [view])

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return (
    <main className="relative h-[100dvh] w-full">
      {!isMobile && <div className="fixed right-3 top-10 z-[100000] rounded-full border border-white/15 bg-[#0b1220]/80 p-1 text-white shadow-2xl shadow-black/25 backdrop-blur-xl sm:right-5 sm:top-11">
        <div className="flex items-center" role="group" aria-label="Choose portfolio view">
          <button
            type="button"
            onClick={() => setView('story')}
            aria-pressed={view === 'story'}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${view === 'story' ? 'bg-[#f4c95d] text-[#172033]' : 'text-white/60 hover:text-white'}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Story view
          </button>
          <button
            type="button"
            onClick={() => setView('developer')}
            aria-pressed={view === 'developer'}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${view === 'developer' ? 'bg-emerald-400 text-[#07130d]' : 'text-white/60 hover:text-white'}`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Developer view
          </button>
        </div>
      </div>}

      {isMobile || view === 'story' ? <StoryPortfolio /> : <Desktop />}
    </main>
  )
}

export default App

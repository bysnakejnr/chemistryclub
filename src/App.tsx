import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { LandingPage } from './pages/LandingPage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { ChemInfoPage } from './pages/ChemInfoPage'
import { ChemTopicPage } from './pages/ChemTopicPage'
import { DictionaryPage } from './pages/DictionaryPage'
import { Navbar } from './components/Navbar'

export type Theme = 'light' | 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem('chemclub-theme')
    if (saved === 'light' || saved === 'dark') return saved

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chemclub-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // const mainRef = useLoadingAnimations([theme])
  const mainRef = useRef(null)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-main" ref={mainRef}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/chem-info" element={<ChemInfoPage />} />
            <Route path="/chem-info/:slug" element={<ChemTopicPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>Chem Club</span>
          <span>Made with React &amp; TypeScript</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

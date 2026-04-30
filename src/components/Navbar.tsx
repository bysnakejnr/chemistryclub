import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import type { Theme } from '../App'

interface NavbarProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { to: '/', label: 'Periodic Table' },
    { to: '/events', label: 'Events' },
    { to: '/chem-info', label: 'Chem Info' },
    { to: '/dictionary', label: 'New Terms' },
  ]

  // Update indicator position based on active route
  useEffect(() => {
    const updateIndicator = () => {
      if (!indicatorRef.current || !navContainerRef.current) return

      const activeLink = navContainerRef.current.querySelector('.nav-link.active') as HTMLElement
      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink
        indicatorRef.current.style.left = `${offsetLeft}px`
        indicatorRef.current.style.width = `${offsetWidth}px`
      }
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [location.pathname])

  
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '16px',
        padding: '0.75rem 1.25rem',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="navbar-header"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          onClick={() => {
            navigate('/');
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            padding: 2,
            transition: 'transform 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          className="logo-container"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <img
            src="/chem-logo.png"
            alt="Chem Club Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 12,
            }}
            onError={(e) => {
              console.error('Logo failed to load:', e);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Logo loaded successfully');
            }}
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav
        style={{
          display: 'none',
          alignItems: 'center',
        }}
        className="desktop-nav"
      >
        <div className="nav-links-container" ref={navContainerRef} style={{ position: 'relative' }}>
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="nav-indicator" ref={indicatorRef} />
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle mobile menu"
        style={{
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
        }}
        className="mobile-menu-button"
      >
        <span
          style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'var(--text)',
            borderRadius: '1px',
            transition: 'transform 0.3s ease',
            transform: isMobileMenuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
          }}
        />
        <span
          style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'var(--text)',
            borderRadius: '1px',
            transition: 'opacity 0.3s ease',
            opacity: isMobileMenuOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'var(--text)',
            borderRadius: '1px',
            transition: 'transform 0.3s ease',
            transform: isMobileMenuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
          }}
        />
      </button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1rem',
            marginTop: '0.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
          }}
          className="mobile-nav-menu"
        >
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* Modern Slider Toggle */}
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '28px',
        }}
      >
        {/* Background icons */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #1e293b, #334155)'
              : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6px',
          }}
        >
          {/* Sun icon */}
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)',
              position: 'relative',
              opacity: theme === 'dark' ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#f59e0b',
                top: '-2px',
                right: '-1px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#f59e0b',
                bottom: '-1px',
                left: '-1px',
              }}
            />
          </div>
          
          {/* Moon icon */}
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #e2e8f0, #94a3b8)',
              position: 'relative',
              opacity: theme === 'dark' ? 1 : 0.3,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#64748b',
                top: '2px',
                right: '3px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#64748b',
                bottom: '3px',
                left: '2px',
              }}
            />
          </div>
        </div>
        
        {/* Slider button */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          style={{
            position: 'absolute',
            top: '2px',
            left: theme === 'dark' ? '30px' : '2px',
            width: '24px',
            height: '24px',
            borderRadius: '12px',
            border: 'none',
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #4ade80, #22d3ee)'
              : 'linear-gradient(135deg, #f8fafc, #ffffff)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
          }}
          className="theme-toggle-slider"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: theme === 'dark'
                ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'
                : 'radial-gradient(circle at 30% 30%, rgba(0,0,0,0.1), rgba(0,0,0,0.05))',
            }}
          />
        </button>
      </div>
    </header>
  )
}


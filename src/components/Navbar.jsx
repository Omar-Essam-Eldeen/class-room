import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, LockKeyhole, Menu, Sparkles, X } from 'lucide-react'
import { getStoredUser } from '../data/storage'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [, setUserTick] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const syncUser = () => setUserTick((current) => current + 1)
    window.addEventListener('classroom-user-change', syncUser)
    return () => window.removeEventListener('classroom-user-change', syncUser)
  }, [])

  const user = getStoredUser()
  const closeMenu = () => setOpen(false)

  return (
    <nav className="navbar navbar-expand-lg app-navbar" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand brand-mark" to="/" onClick={closeMenu}>
          <span className="brand-icon" aria-hidden="true">
            <BookOpen size={22} />
          </span>
          <span>Class Room</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-controls="main-navigation"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <div
          className={`collapse navbar-collapse ${open ? 'show' : ''}`}
          id="main-navigation"
          data-route={location.pathname}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/features" onClick={closeMenu}>
                Features
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard" onClick={closeMenu}>
                <LayoutDashboard size={17} />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/our-room" onClick={closeMenu}>
                <LockKeyhole size={17} />
                Our Room
              </NavLink>
            </li>
            <li className="nav-item ms-lg-2">
              <NavLink className="btn btn-sm glow-btn" to="/access" onClick={closeMenu}>
                <Sparkles size={16} />
                {user}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

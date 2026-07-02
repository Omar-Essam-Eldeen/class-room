import { Link } from 'react-router-dom'
import { BookOpen, Code2, HeartHandshake } from 'lucide-react'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <BookOpen size={20} />
              <span>Class Room</span>
            </div>
            <p>A cozy prototype for studying together, staying consistent, and making progress visible.</p>
          </div>
          <div className="footer-links" aria-label="Footer links">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
              <Code2 size={17} />
              Built with Vite
            </a>
            <Link to="/access">
              <HeartHandshake size={17} />
              Demo access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

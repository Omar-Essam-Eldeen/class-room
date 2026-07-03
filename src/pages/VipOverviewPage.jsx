import { Link } from 'react-router-dom'
import { BarChart3, Crown, GalleryVerticalEnd, Palette } from 'lucide-react'

const vipSections = [
  ['Room management', 'Create VIP rooms, browse public metadata, and join only allowed rooms.'],
  ['Advanced AI mock tools', 'Prototype summaries, quizzes, explainers, and study plans before serverless AI wiring.'],
  ['Customization', 'VIP Glass Suite, Cyber Academy, Night Focus, and future theme controls.'],
  ['Secure previews', 'Student and Couples page previews use sample data and never bypass RLS.'],
]

function VipOverviewPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="section-kicker">VIP overview</span>
          <h1>Premium power with private data boundaries.</h1>
          <p>
            VIP can access all Class Room tools and page previews, while private room content stays
            protected by membership and Supabase Row Level Security.
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/vip">
              VIP Suite
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Manage Rooms
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container feature-detail-grid">
          {vipSections.map(([title, text], index) => {
            const icons = [Crown, BarChart3, Palette, GalleryVerticalEnd]
            const Icon = icons[index]

            return (
              <article className="feature-card glass-card" key={title}>
                <Icon size={24} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default VipOverviewPage

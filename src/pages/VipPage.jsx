import { Link } from 'react-router-dom'
import { BrainCircuit, Crown, GalleryVerticalEnd, Palette, Sparkles } from 'lucide-react'
import MockAITools from '../components/MockAITools'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'

function VipPage() {
  const { activeRoom } = useAuth()

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">VIP suite</span>
          <h1>All tools, all previews, no privacy shortcuts.</h1>
          <p>
            VIP accounts can create VIP rooms, manage premium customization, and preview Student or
            Couples page designs with sample data only.
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/our-room">
              {activeRoom?.roomType === 'vip' ? 'Open VIP Room' : 'Create VIP Room'}
            </Link>
            <Link className="btn soft-btn" to="/vip/overview">
              VIP Overview
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon={Crown} label="Room capacity" value="5" detail="VIP study suite" accent="amber" />
          <StatCard icon={BrainCircuit} label="AI tools" value="Advanced" detail="Mock section today" accent="purple" />
          <StatCard icon={Palette} label="Themes" value="Full" detail="Design controls planned" accent="pink" />
          <StatCard icon={GalleryVerticalEnd} label="Previews" value="2" detail="Student and Couples" accent="blue" />
        </div>

        <div className="dashboard-wide split-feature-row">
          <MockAITools />
          <section className="glass-card room-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Safe previews</span>
                <h2>Inspect page designs</h2>
              </div>
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <div className="feature-lock-grid">
              <Link className="feature-lock-card" to="/student-preview">
                <GalleryVerticalEnd size={20} aria-hidden="true" />
                <div>
                  <strong>Student preview</strong>
                  <span>Mock tasks, timer, limited notes.</span>
                </div>
              </Link>
              <Link className="feature-lock-card" to="/couples-preview">
                <GalleryVerticalEnd size={20} aria-hidden="true" />
                <div>
                  <strong>Couples preview</strong>
                  <span>Sample shared room only.</span>
                </div>
              </Link>
            </div>
          </section>
        </div>

        <section className="glass-card dashboard-panel dashboard-wide">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Premium insights</span>
              <h2>Room analytics and rewards preview</h2>
            </div>
            <Crown size={22} aria-hidden="true" />
          </div>
          <div className="vip-insight-grid">
            <article>
              <strong>Productivity score</strong>
              <span>86%</span>
              <small>Mock blend of focus sessions, streaks, and task completion.</small>
            </article>
            <article>
              <strong>Theme controls</strong>
              <span>6 styles</span>
              <small>VIP Glass Suite, Cyber Academy, Night Focus, and more.</small>
            </article>
            <article>
              <strong>Reward rank</strong>
              <span>Star Scholar</span>
              <small>Prototype badge based on public stars and activity score.</small>
            </article>
            <article>
              <strong>AI report</strong>
              <span>Ready</span>
              <small>Mock weekly report generated from safe local templates.</small>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default VipPage

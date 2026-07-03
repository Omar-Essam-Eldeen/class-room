import { Link } from 'react-router-dom'
import { CheckCircle2, GalleryVerticalEnd, HeartHandshake, LockKeyhole, TimerReset } from 'lucide-react'

const previewContent = {
  student: {
    kicker: 'Student preview',
    title: 'A basic desk for personal momentum.',
    copy: 'Sample Student data only: public rooms, focus timer, personal tasks, limited notes, and locked upgrade cards.',
    stats: [
      ['Tasks', '3', 'Sample personal tasks'],
      ['Focus', '25m', 'Basic timer'],
      ['Notes', 'Limited', 'Scratchpad preview'],
    ],
  },
  couples: {
    kicker: 'Couples preview',
    title: 'A shared private room design for two.',
    copy: 'Sample Couples data only: shared tasks, check-ins, notes, focus sessions, motivation, and partner progress.',
    stats: [
      ['Capacity', '2', 'Pair room'],
      ['Check-ins', 'Shared', 'Sample rhythm'],
      ['Notes', 'Mixed', 'Shared/private model'],
    ],
  },
}

function PreviewPage({ type }) {
  const preview = previewContent[type] || previewContent.student
  const Icon = type === 'couples' ? HeartHandshake : GalleryVerticalEnd

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">{preview.kicker}</span>
          <h1>{preview.title}</h1>
          <p>{preview.copy}</p>
          <div className="prototype-note">
            <LockKeyhole size={20} />
            This preview uses mock data and does not query another user's private room content.
          </div>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/vip">
              Back to VIP
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Rooms Directory
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          {preview.stats.map(([label, value, detail], index) => {
            const icons = [CheckCircle2, TimerReset, Icon]
            const StatIcon = icons[index]

            return (
              <article className="stat-card glass-card" key={label}>
                <div className="stat-icon">
                  <StatIcon size={20} />
                </div>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </article>
            )
          })}
        </div>

        <section className="glass-card dashboard-panel dashboard-wide">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Sample layout</span>
              <h2>Preview cards only</h2>
            </div>
            <Icon size={22} aria-hidden="true" />
          </div>
          <div className="compact-list">
            <article>
              <div>
                <strong>Sample task</strong>
                <span>Preview how cards feel without touching real database rows.</span>
              </div>
              <span className="status-chip status-doing">Doing</span>
            </article>
            <article>
              <div>
                <strong>Sample note</strong>
                <span>Private notes stay protected inside actual room memberships.</span>
              </div>
              <span className="room-badge mini">Mock</span>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default PreviewPage

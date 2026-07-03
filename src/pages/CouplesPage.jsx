import { Link } from 'react-router-dom'
import { HeartHandshake, NotebookPen, Palette, UsersRound } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'

function CouplesPage() {
  const { activeRoom } = useAuth()

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">Couples study</span>
          <h1>A private room for two steady people.</h1>
          <p>
            Couples accounts are built around one shared room: tasks, check-ins, notes, focus
            sessions, encouragement, partner progress, and cozy customization.
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/our-room">
              {activeRoom?.roomType === 'couples' ? 'Open Couples Room' : 'Create Couples Private Room'}
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Browse Rooms
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon={UsersRound} label="Room capacity" value="2" detail="Built for a pair" accent="pink" />
          <StatCard icon={HeartHandshake} label="Rituals" value="Shared" detail="Check-ins and motivation" accent="green" />
          <StatCard icon={NotebookPen} label="Notes" value="Shared" detail="Private notes still protected" accent="blue" />
          <StatCard icon={Palette} label="Style" value="Soft" detail="Room customization preview" accent="amber" />
        </div>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Shared progress</span>
              <h2>Designed for mutual care</h2>
            </div>
            <HeartHandshake size={22} aria-hidden="true" />
          </div>
          <div className="compact-list">
            <article>
              <div>
                <strong>Daily check-ins</strong>
                <span>Hours, mood, topic, and honest context.</span>
              </div>
              <span className="room-badge mini">Couples</span>
            </article>
            <article>
              <div>
                <strong>Shared task board</strong>
                <span>Both, VIP, and Couples ownership labels stay visible.</span>
              </div>
              <span className="room-badge mini">Shared</span>
            </article>
          </div>
        </section>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Customization</span>
              <h2>Soft Couple Room</h2>
            </div>
            <Palette size={22} aria-hidden="true" />
          </div>
          <p className="empty-state">
            Choose a design style when creating rooms from the directory. Private content remains
            member-only behind Supabase RLS.
          </p>
        </section>

        <section className="glass-card dashboard-panel dashboard-wide">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Couples room rhythm</span>
              <h2>Useful tools for two</h2>
            </div>
            <UsersRound size={22} aria-hidden="true" />
          </div>
          <div className="vip-insight-grid">
            <article>
              <strong>Morning promise</strong>
              <span>1 task</span>
              <small>Pick one shared next step before the first sprint.</small>
            </article>
            <article>
              <strong>Shared pulse</strong>
              <span>Check-in</span>
              <small>Hours, mood, and topic keep support specific.</small>
            </article>
            <article>
              <strong>Encouragement</strong>
              <span>Daily</span>
              <small>Leave one warm note when the other person shows up.</small>
            </article>
            <article>
              <strong>Room style</strong>
              <span>Soft</span>
              <small>Customization preview keeps the room feeling personal.</small>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default CouplesPage

import { Activity, CheckCircle2, HeartHandshake, MessageSquareText, TimerReset } from 'lucide-react'
import { formatTime } from '../data/storage'

const typeIcons = {
  checkin: CheckCircle2,
  task: CheckCircle2,
  focus: TimerReset,
  session: MessageSquareText,
  encouragement: HeartHandshake,
  note: MessageSquareText,
  system: Activity,
  update: Activity,
}
const typeLabels = {
  checkin: 'Check-in',
  task: 'Task',
  focus: 'Focus',
  session: 'Report',
  encouragement: 'Support',
  note: 'Note',
  system: 'Room',
  update: 'Update',
}

function ActivityFeed({ activity }) {
  const latestActivity = activity[0]

  return (
    <aside className="glass-card room-card activity-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Activity feed</span>
          <h2>What happened lately</h2>
          <p className="section-support">A soft timeline of effort, care, and little wins.</p>
        </div>
        <Activity size={24} aria-hidden="true" />
      </div>

      <div className="activity-summary">
        <span className="room-badge">{activity.length} room moments saved</span>
        <span>{latestActivity ? `Latest: ${formatTime(latestActivity.createdAt)}` : 'The timeline is ready.'}</span>
      </div>

      <div className="activity-list">
        {activity.length ? (
          activity.slice(0, 12).map((item) => {
            const Icon = typeIcons[item.type] || Activity

            return (
              <article className="activity-item" key={item.id}>
                <span className="activity-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <div>
                  <div className="activity-title-line">
                    <strong>{item.actor}</strong>
                    <span className="room-badge mini">{typeLabels[item.type] || 'Update'}</span>
                  </div>
                  <p>{item.message}</p>
                  <small>{formatTime(item.createdAt)}</small>
                </div>
              </article>
            )
          })
        ) : (
          <p className="empty-state">No activity yet. The room will fill in as you study.</p>
        )}
      </div>
    </aside>
  )
}

export default ActivityFeed

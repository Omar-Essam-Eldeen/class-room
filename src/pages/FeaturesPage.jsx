import {
  BarChart3,
  BrainCircuit,
  CalendarCheck2,
  Clock3,
  HeartHandshake,
  ListTodo,
  UsersRound,
} from 'lucide-react'
import FeatureCard from '../components/FeatureCard'

const featureDetails = [
  {
    icon: UsersRound,
    title: 'Study with friends',
    text: 'A shared room gives each pair or group a single place for goals, updates, and encouragement.',
    accent: 'blue',
  },
  {
    icon: CalendarCheck2,
    title: 'Daily consistency tracking',
    text: 'Check-ins capture study status, hours, mood, and the topic covered each day.',
    accent: 'green',
  },
  {
    icon: ListTodo,
    title: 'Task and goal management',
    text: 'Tasks include owner, subject, priority, due date, and Todo, Doing, or Done status.',
    accent: 'amber',
  },
  {
    icon: Clock3,
    title: 'Focus timer with break reminders',
    text: 'Preset focus sessions help users work in clean blocks and remember to rest after completion.',
    accent: 'pink',
  },
  {
    icon: BrainCircuit,
    title: 'AI-powered study support',
    text: 'The prototype mocks summaries, quizzes, simple explanations, and study plans for future AI wiring.',
    accent: 'purple',
  },
  {
    icon: BarChart3,
    title: 'Session feedback and reports',
    text: 'After a session, users can rate focus, record wins, note difficulties, and review recent reports.',
    accent: 'teal',
  },
  {
    icon: HeartHandshake,
    title: 'Motivational study environment',
    text: 'Quotes, encouragement messages, and an activity feed make the room feel alive without getting noisy.',
    accent: 'green',
  },
]

function FeaturesPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container">
          <span className="section-kicker">Class Room features</span>
          <h1>Built for daily study momentum</h1>
          <p>
            The prototype combines public pages, a limited demo dashboard, and a private room flow
            for Magic and Partner, all powered by localStorage for now.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="feature-detail-grid">
            {featureDetails.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default FeaturesPage

import {
  BarChart3,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Flame,
  ListChecks,
  Users,
} from 'lucide-react'
import FeatureCard from '../components/FeatureCard'
import HeroSection from '../components/HeroSection'

const features = [
  {
    icon: Users,
    title: 'Study Rooms',
    text: 'Create cozy shared spaces for partners, friends, or small study groups.',
    accent: 'blue',
  },
  {
    icon: CalendarCheck,
    title: 'Daily Check-ins',
    text: 'Log study hours, moods, and topics so consistency becomes visible.',
    accent: 'green',
  },
  {
    icon: ListChecks,
    title: 'Shared Tasks',
    text: 'Assign goals, track status, and celebrate the small wins together.',
    accent: 'amber',
  },
  {
    icon: Clock3,
    title: 'Focus Timer',
    text: 'Run calm 25, 45, or 60 minute sessions with break reminders.',
    accent: 'pink',
  },
  {
    icon: BrainCircuit,
    title: 'AI Study Tools',
    text: 'Try mock summaries, quizzes, explanations, and study plans without an API.',
    accent: 'purple',
  },
  {
    icon: BarChart3,
    title: 'Progress Reports',
    text: 'Review sessions, streaks, and task progress in one friendly dashboard.',
    accent: 'teal',
  },
]

const steps = [
  'Create or join a room',
  'Set study goals',
  'Start focus sessions',
  'Track progress together',
]

function LandingPage() {
  return (
    <main>
      <HeroSection />

      <section className="section-pad" id="features">
        <div className="container">
          <div className="section-title">
            <span className="section-kicker">Features</span>
            <h2>Everything a study pair needs to keep showing up</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad muted-band">
        <div className="container">
          <div className="section-title">
            <span className="section-kicker">How it works</span>
            <h2>From intention to rhythm in four steps</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card glass-card" key={step}>
                <span>{index + 1}</span>
                <h3>{step}</h3>
                <p>
                  {index === 0
                    ? 'Sign up or log in, then open the private room when your membership is ready.'
                    : 'Keep the workflow light enough to repeat every day.'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="motivation-strip glass-card">
            <Flame size={28} aria-hidden="true" />
            <div>
              <span className="section-kicker">Motivation</span>
              <h2>Progress feels better when somebody is in the room with you.</h2>
              <p>
                Class Room turns daily effort into shared proof: check-ins, completed tasks,
                focused sessions, and tiny encouragements that make study habits easier to keep.
              </p>
            </div>
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage

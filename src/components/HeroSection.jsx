import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import heroImage from '../assets/classroom-hero.png'

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-media" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
      <div className="container hero-content">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="eyebrow">
              <Sparkles size={16} />
              Study rooms, focus tools, and progress in one cozy place
            </div>
            <h1>Study better together.</h1>
            <p className="hero-copy">
              Create private study rooms, track daily progress, finish shared tasks, and use AI
              study tools that help every session feel clearer and more motivating.
            </p>
            <div className="hero-actions">
              <Link className="btn glow-btn btn-lg" to="/access">
                Enter Demo Room
                <ArrowRight size={18} />
              </Link>
              <Link className="btn soft-btn btn-lg" to="/features">
                Explore Features
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} />
                Local prototype data
              </span>
              <span>
                <CheckCircle2 size={17} />
                Private room flow
              </span>
              <span>
                <CheckCircle2 size={17} />
                Mobile-ready dashboard
              </span>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="hero-panel glass-card">
              <div className="hero-panel-header">
                <span>Today</span>
                <strong>Focus Sprint</strong>
              </div>
              <div className="timer-preview">25:00</div>
              <div className="mini-progress">
                <span>Shared weekly goal</span>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '68%' }} aria-label="68 percent" />
                </div>
              </div>
              <div className="mini-members">
                <span>Magic</span>
                <span>Partner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

function FeatureCard({ icon: Icon, title, text, accent = 'blue' }) {
  return (
    <article className={`feature-card glass-card accent-${accent}`}>
      <div className="feature-icon" aria-hidden="true">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

export default FeatureCard

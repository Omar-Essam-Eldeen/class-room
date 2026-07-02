function StatCard({ icon: Icon, label, value, detail, accent = 'blue' }) {
  return (
    <article className={`stat-card glass-card accent-${accent}`}>
      <div className="stat-icon" aria-hidden="true">
        <Icon size={22} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <p>{detail}</p> : null}
      </div>
    </article>
  )
}

export default StatCard

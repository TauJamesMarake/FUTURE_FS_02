export default function StatCard({ label, value, icon, color, iconBg }) {
  return (
    <div className="stat-card" style={{ '--card-color': color, '--card-icon-bg': iconBg }}>
      <div className="stat-card-info">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
      </div>
      <div className="stat-card-icon">{icon}</div>
    </div>
  );
}

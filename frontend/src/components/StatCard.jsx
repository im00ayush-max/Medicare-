export default function StatCard({ label, value, tone = "blue" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-value">{value ?? 0}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

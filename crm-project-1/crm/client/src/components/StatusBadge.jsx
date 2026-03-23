const LABELS = { new: 'New', contacted: 'Contacted', converted: 'Converted' };

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {LABELS[status] || status}
    </span>
  );
}

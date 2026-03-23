import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function LeadTable({ leads, loading }) {
  const navigate = useNavigate();

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="loading-spinner">⟳ Loading leads…</div>;
  }

  if (!leads.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p>No leads found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name / Email</th>
            <th>Company</th>
            <th>Source</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
              <td>
                <div className="lead-name">{lead.name}</div>
                <div className="lead-email">{lead.email}</div>
              </td>
              <td>{lead.company || <span style={{color:'var(--text-muted)'}}>—</span>}</td>
              <td>
                <span className="source-chip">{lead.source}</span>
              </td>
              <td><StatusBadge status={lead.status} /></td>
              <td>{formatDate(lead.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

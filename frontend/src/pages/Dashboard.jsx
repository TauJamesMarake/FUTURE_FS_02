import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import { getStats, getLeads } from '../services/api';

const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
    <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1
      4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2.88h3a2 2 0 0 1 2 1.72
      c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l1.08-1.08
      a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68a2 2 0 0 1 1.72 2.03z"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 600 }}>
        {payload[0].value} lead{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          getStats(),
          getLeads({ sort: 'desc' }),
        ]);
        setStats(statsRes.data);
        setRecentLeads(leadsRes.data.leads.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard…</div>;

  const sourceData = stats?.bySource
    ? Object.entries(stats.bySource).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Leads"
          value={stats?.total ?? 0}
          icon={<IconClipboard />}
          color="var(--accent)"
          iconBg="var(--accent-glow)"
        />
        <StatCard
          label="New"
          value={stats?.new ?? 0}
          icon={<IconUserPlus />}
          color="var(--status-new)"
          iconBg="var(--status-new-bg)"
        />
        <StatCard
          label="Contacted"
          value={stats?.contacted ?? 0}
          icon={<IconPhone />}
          color="var(--amber)"
          iconBg="var(--amber-bg)"
        />
        <StatCard
          label="Converted"
          value={stats?.converted ?? 0}
          icon={<IconCheckCircle />}
          color="var(--green)"
          iconBg="var(--green-bg)"
        />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Leads - Last 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats?.trend || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="count"
                stroke="var(--accent)" strokeWidth={2}
                dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Leads by Source</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sourceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Recent Leads</span>
          <button className="btn btn-ghost" onClick={() => navigate('/leads')} style={{ fontSize: 12 }}>
            View all
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Source</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map(lead => (
              <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                <td>
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-email">{lead.email}</div>
                </td>
                <td>{lead.company || '—'}</td>
                <td><span className="source-chip">{lead.source}</span></td>
                <td><span className={`status-badge status-${lead.status}`}>{lead.status}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {!recentLeads.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import StatCard  from '../components/StatCard';
import { getStats, getLeads } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontSize:12}}>
      <p style={{color:'var(--text-muted)',marginBottom:2}}>{label}</p>
      <p style={{color:'var(--accent)',fontWeight:600}}>{payload[0].value} lead{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function Dashboard() {
  const [stats,        setStats]        = useState(null);
  const [recentLeads,  setRecentLeads]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          getStats(),
          getLeads({ sort: 'desc' })
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

  if (loading) return <div className="loading-spinner">⟳ Loading dashboard…</div>;

  // Build bySource chart data
  const sourceData = stats?.bySource
    ? Object.entries(stats.bySource).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{marginBottom:24}}>
        <StatCard
          label="Total Leads"
          value={stats?.total ?? 0}
          icon="📋"
          color="var(--accent)"
          iconBg="var(--accent-glow)"
        />
        <StatCard
          label="New"
          value={stats?.new ?? 0}
          icon="🆕"
          color="var(--status-new)"
          iconBg="var(--status-new-bg)"
        />
        <StatCard
          label="Contacted"
          value={stats?.contacted ?? 0}
          icon="📞"
          color="var(--amber)"
          iconBg="var(--amber-bg)"
        />
        <StatCard
          label="Converted"
          value={stats?.converted ?? 0}
          icon="✅"
          color="var(--green)"
          iconBg="var(--green-bg)"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid-2" style={{marginBottom:24}}>
        {/* Trend line */}
        <div className="card">
          <div className="card-title">Leads — Last 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats?.trend || []} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{fill:'var(--accent)',strokeWidth:0,r:3}}
                activeDot={{r:5,fill:'var(--accent)'}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Source bar */}
        <div className="card">
          <div className="card-title">Leads by Source</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sourceData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Leads ── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Recent Leads</span>
          <button className="btn btn-ghost" onClick={() => navigate('/leads')} style={{fontSize:12}}>
            View all →
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
                <td style={{fontSize:12,color:'var(--text-muted)'}}>
                  {new Date(lead.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </td>
              </tr>
            ))}
            {!recentLeads.length && (
              <tr>
                <td colSpan={5} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>
                  No leads yet. Use POST /api/leads to capture your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

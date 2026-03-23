import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import NoteItem    from '../components/NoteItem';
import { getLead, updateLeadStatus, getNotes, addNote, deleteLead } from '../services/api';

export default function LeadDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [lead,      setLead]      = useState(null);
  const [notes,     setNotes]     = useState([]);
  const [noteText,  setNoteText]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  // Load lead + notes on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [leadRes, notesRes] = await Promise.all([
          getLead(id),
          getNotes(id)
        ]);
        setLead(leadRes.data.lead);
        setNotes(notesRes.data.notes);
      } catch (e) {
        setError('Failed to load lead.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const { data } = await updateLeadStatus(id, newStatus);
      setLead(data.lead);
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const { data } = await addNote(id, noteText.trim());
      setNotes(prev => [data.note, ...prev]);
      setNoteText('');
    } catch (e) {
      alert('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    try {
      await deleteLead(id);
      navigate('/leads');
    } catch (e) {
      alert('Failed to delete lead.');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('en-US', {
      month:'long', day:'numeric', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });

  if (loading) return <div className="loading-spinner">⟳ Loading lead…</div>;
  if (error)   return <div className="error-msg">{error}</div>;
  if (!lead)   return null;

  return (
    <div>
      {/* Back */}
      <button className="back-link" onClick={() => navigate('/leads')}>
        ← Back to Leads
      </button>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>{lead.name}</h2>
          <p style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
            <StatusBadge status={lead.status} />
            <span style={{color:'var(--text-muted)',fontSize:12}}>
              Added {formatDate(lead.created_at)}
            </span>
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}>
          🗑 Delete Lead
        </button>
      </div>

      <div className="detail-grid">
        {/* ── Left: Info + Notes ── */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Contact Details */}
          <div className="card">
            <div className="card-title">Contact Information</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
              <div className="detail-field">
                <label>Full Name</label>
                <span>{lead.name}</span>
              </div>
              <div className="detail-field">
                <label>Email</label>
                <span>
                  <a href={`mailto:${lead.email}`} style={{color:'var(--accent)'}}>{lead.email}</a>
                </span>
              </div>
              <div className="detail-field">
                <label>Phone</label>
                <span>{lead.phone || <span style={{color:'var(--text-muted)'}}>Not provided</span>}</span>
              </div>
              <div className="detail-field">
                <label>Company</label>
                <span>{lead.company || <span style={{color:'var(--text-muted)'}}>Not provided</span>}</span>
              </div>
              <div className="detail-field">
                <label>Source</label>
                <span className="source-chip">{lead.source}</span>
              </div>
              <div className="detail-field">
                <label>Status</label>
                <select
                  className="form-control"
                  value={lead.status}
                  onChange={handleStatusChange}
                  style={{width:'auto',display:'inline-block'}}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Note */}
          <div className="card">
            <div className="card-title">Add Follow-Up Note</div>
            <form onSubmit={handleAddNote} style={{display:'flex',gap:10}}>
              <textarea
                className="form-control"
                placeholder='e.g. "Called client, waiting for response"'
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={2}
                style={{resize:'vertical',flex:1}}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !noteText.trim()}
                style={{alignSelf:'flex-end',whiteSpace:'nowrap'}}
              >
                {saving ? 'Saving…' : '+ Add Note'}
              </button>
            </form>
          </div>

          {/* Notes list */}
          <div className="card">
            <div className="card-title">
              Follow-Up History
              <span style={{
                marginLeft:8,
                background:'var(--bg-elevated)',
                border:'1px solid var(--border)',
                borderRadius:99,
                padding:'1px 8px',
                fontSize:11,
                color:'var(--text-muted)',
                fontFamily:'var(--font-body)',
                fontWeight:400
              }}>
                {notes.length}
              </span>
            </div>
            {notes.length === 0 ? (
              <div style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',padding:'20px 0'}}>
                No notes yet. Add the first follow-up above.
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {notes.map(n => <NoteItem key={n.id} note={n} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Quick Info Panel ── */}
        <div>
          <div className="card">
            <div className="card-title">Quick Info</div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>Lead ID</div>
                <div style={{fontSize:11,fontFamily:'monospace',color:'var(--text-muted)',wordBreak:'break-all'}}>{lead.id}</div>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>Created At</div>
                <div style={{fontSize:13,color:'var(--text-secondary)'}}>{formatDate(lead.created_at)}</div>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:6}}>Pipeline Stage</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {['new','contacted','converted'].map(s => (
                    <div key={s} style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'6px 10px',
                      borderRadius:'var(--radius-md)',
                      background: lead.status === s ? 'var(--accent-glow)' : 'transparent',
                      border: `1px solid ${lead.status === s ? 'var(--accent)' : 'transparent'}`,
                      opacity: lead.status === s ? 1 : 0.4
                    }}>
                      <div style={{
                        width:6,height:6,borderRadius:'50%',
                        background: s === 'new' ? 'var(--status-new)' : s === 'contacted' ? 'var(--amber)' : 'var(--green)'
                      }} />
                      <span style={{fontSize:12,fontWeight:500,textTransform:'capitalize',color:'var(--text-primary)'}}>
                        {s}
                      </span>
                      {lead.status === s && (
                        <span style={{marginLeft:'auto',fontSize:10,color:'var(--accent)'}}>← current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:4}}>Notes</div>
                <div style={{fontSize:22,fontFamily:'var(--font-display)',fontWeight:700,color:'var(--text-primary)'}}>{notes.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

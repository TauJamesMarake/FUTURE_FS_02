import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaTrashAlt, FaUserCircle,
  FaEnvelope, FaPhone, FaBuilding, FaGlobe,
  FaTag, FaPlus, FaSpinner, FaStickyNote,
  FaRegClock, FaTrash
} from 'react-icons/fa';
import StatusBadge from '../components/StatusBadge';
import NoteItem from '../components/NoteItem';
import DeleteModal from '../components/DeleteModal';
import { getLead, updateLeadStatus, getNotes, addNote, deleteLead, deleteNote } from '../services/api';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,     setLead]     = useState(null);
  const [notes,    setNotes]    = useState([]);
  const [noteText, setNoteText] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  // Delete lead modal
  const [deleteModal,  setDeleteModal]  = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Delete note modal
  const [noteToDelete,  setNoteToDelete]  = useState(null); // note object
  const [noteDelLoading, setNoteDelLoading] = useState(false);

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
        console.error('Full error:', e);
        setError(`Failed to load lead: ${e.response?.status} – ${e.response?.data?.message || e.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await updateLeadStatus(id, newStatus);
      setLead(res.data.lead);
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await addNote(id, noteText.trim());
      setNotes(prev => [res.data.note, ...prev]);
      setNoteText('');
    } catch {
      alert('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteLead(id);
      navigate('/recycle-bin');
    } catch {
      alert('Failed to delete lead.');
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  // Delete a single note
  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;
    setNoteDelLoading(true);
    try {
      await deleteNote(id, noteToDelete.id);
      setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
    } catch {
      alert('Failed to delete note.');
    } finally {
      setNoteDelLoading(false);
      setNoteToDelete(null);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  if (loading) return <div className="loading-spinner">Loading lead…</div>;
  if (error)   return <div className="error-msg">{error}</div>;
  if (!lead)   return null;

  return (
    <div>

      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-ghost btn-back" onClick={() => navigate('/leads')}>
            <FaArrowLeft style={{ fontSize: 12 }} />
            Back to Leads
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {lead.name}
            </h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <StatusBadge status={lead.status} />
              <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaRegClock style={{ fontSize: 11 }} />
                Added {formatDate(lead.created_at)}
              </span>
            </p>
          </div>
        </div>

        <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
          <FaTrashAlt style={{ fontSize: 12 }} />
          Delete Lead
        </button>
      </div>

      <div className="detail-grid">

        {/* Left Column*/}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Contact Info Card */}
          <div className="card">
            <div className="card-title">
              <FaUserCircle style={{ marginRight: 7, color: 'var(--accent)', verticalAlign: 'middle' }} />
              Contact Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>

              <div className="detail-field">
                <label><FaUserCircle style={{ marginRight: 4 }} />Full Name</label>
                <span>{lead.name}</span>
              </div>

              <div className="detail-field">
                <label><FaEnvelope style={{ marginRight: 4 }} />Email</label>
                <span>
                  <a href={`mailto:${lead.email}`} style={{ color: 'var(--accent)' }}>{lead.email}</a>
                </span>
              </div>

              <div className="detail-field">
                <label><FaPhone style={{ marginRight: 4 }} />Phone</label>
                <span>{lead.phone || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}</span>
              </div>

              <div className="detail-field">
                <label><FaBuilding style={{ marginRight: 4 }} />Company</label>
                <span>{lead.company || <span style={{ color: 'var(--text-muted)' }}>Not provided</span>}</span>
              </div>

              <div className="detail-field">
                <label><FaGlobe style={{ marginRight: 4 }} />Source</label>
                <span className="source-chip">{lead.source}</span>
              </div>

              <div className="detail-field">
                <label><FaTag style={{ marginRight: 4 }} />Status</label>
                <select
                  className="form-control"
                  value={lead.status}
                  onChange={handleStatusChange}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Note Card */}
          <div className="card">
            <div className="card-title">
              <FaPlus style={{ marginRight: 7, color: 'var(--accent)', verticalAlign: 'middle' }} />
              Add Follow-Up Note
            </div>
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 10 }}>
              <textarea
                className="form-control"
                placeholder='e.g. "Called client, waiting for response"'
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={2}
                style={{ resize: 'vertical', flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !noteText.trim()}
                style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
              >
                {saving ? <><FaSpinner className="spin" /> Saving…</> : <><FaPlus /> Add Note</>}
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaStickyNote style={{ color: 'var(--accent)' }} />
              Follow-Up History
              <span style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '1px 8px', fontSize: 11,
                color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400
              }}>
                {notes.length}
              </span>
            </div>

            {notes.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No notes yet. Add the first follow-up above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notes.map(n => (
                  <NoteItem
                    key={n.id}
                    note={n}
                    onDelete={() => setNoteToDelete(n)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="card">
            <div className="card-title">Quick Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <div className="quick-info-label">Lead ID</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{lead.id}</div>
              </div>

              <div>
                <div className="quick-info-label">Created At</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(lead.created_at)}</div>
              </div>

              <div>
                <div className="quick-info-label" style={{ marginBottom: 6 }}>Pipeline Stage</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['new', 'contacted', 'converted'].map(s => (
                    <div key={s} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 'var(--radius-md)',
                      background: lead.status === s ? 'var(--accent-glow)' : 'transparent',
                      border: `1px solid ${lead.status === s ? 'var(--accent)' : 'transparent'}`,
                      opacity: lead.status === s ? 1 : 0.4
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: s === 'new' ? 'var(--status-new)' : s === 'contacted' ? 'var(--amber)' : 'var(--green)'
                      }} />
                      <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{s}</span>
                      {lead.status === s && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--accent)' }}>← current</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="quick-info-label">Notes</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {notes.length}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Delete Lead Modal */}
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Move lead to trash?"
        message={
          <>
            <strong style={{ color: 'var(--text-primary)' }}>{lead.name}</strong> will be moved to the
            Recycle Bin. You can restore it from there any time.
          </>
        }
        confirmLabel="Move to Trash"
        variant="danger"
      />

      {/* Delete Note Modal */}
      <DeleteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDeleteNote}
        loading={noteDelLoading}
        title="Delete this note?"
        message="This follow-up note will be permanently removed and cannot be recovered."
        confirmLabel="Delete Note"
        variant="danger"
      />

      <style>{`
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .quick-info-label { font-size: 10.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
      `}</style>
    </div>
  );
}
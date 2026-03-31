import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../components/DeleteModal';
import { getLeads, restoreLead, permanentDeleteLead } from '../services/api';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const IconRestore = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconDelete = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function RecycleBin() {
  const navigate = useNavigate();

  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Restore modal
  const [restoreTarget,  setRestoreTarget]  = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Permanent delete single modal
  const [permTarget,  setPermTarget]  = useState(null);
  const [permLoading, setPermLoading] = useState(false);

  // Bulk selection
  const [selected,    setSelected]    = useState(new Set());
  const [bulkModal,   setBulkModal]   = useState(false); // "restore all" or "delete all"
  const [bulkAction,  setBulkAction]  = useState(null);  // 'restore' | 'delete'
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({ include_deleted: 'true' });
      setLeads((res.data.leads || []).filter(l => l.deleted_at));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load recycle bin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Single lead restore
  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      await restoreLead(restoreTarget.id);
      setLeads(prev => prev.filter(l => l.id !== restoreTarget.id));
      setRestoreTarget(null);
    } catch {
      alert('Failed to restore lead.');
    } finally {
      setRestoreLoading(false);
    }
  };

  // Single lead permanent delete
  const handlePermDelete = async () => {
    if (!permTarget) return;
    setPermLoading(true);
    try {
      await permanentDeleteLead(permTarget.id);
      setLeads(prev => prev.filter(l => l.id !== permTarget.id));
      setPermTarget(null);
    } catch {
      alert('Failed to permanently delete lead.');
    } finally {
      setPermLoading(false);
    }
  };

  // Selection helpers
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  };

  // Bulk action
  const openBulk = (action) => { setBulkAction(action); setBulkModal(true); };

  const handleBulkConfirm = async () => {
    setBulkLoading(true);
    try {
      if (bulkAction === 'restore') {
        await Promise.all([...selected].map(id => restoreLead(id)));
      } else {
        await Promise.all([...selected].map(id => permanentDeleteLead(id)));
      }
      setSelected(new Set());
      setBulkModal(false);
      await load();
    } catch {
      alert('One or more operations failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const allChecked  = leads.length > 0 && selected.size === leads.length;
  const someChecked = selected.size > 0 && selected.size < leads.length;

  return (
    <div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--text-muted)' }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Recycle Bin
          </h2>
          <p>
            {loading ? 'Loading…' : `${leads.length} deleted lead${leads.length !== 1 ? 's' : ''}`}
            {leads.length > 0 && ' — restore or permanently remove them below'}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/leads')}>
          ← Back to Leads
        </button>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-bar-count">
            {selected.size} selected
          </span>
          <button className="btn bulk-bar-restore-btn" onClick={() => openBulk('restore')}>
            <IconRestore /> Restore Selected
          </button>
          <button className="btn bulk-bar-delete-btn" onClick={() => openBulk('delete')}>
            <IconDelete /> Delete Permanently
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <div className="recycle-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--border)', marginBottom: 16 }}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <p>Recycle Bin is empty.</p>
          <span>Deleted leads will appear here.</span>
        </div>
      )}

      {/* Table */}
      {!loading && leads.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {/* Checkbox all */}
                <th style={{ width: 44, paddingRight: 0 }}>
                  <input
                    type="checkbox"
                    className="rb-checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Deleted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className={selected.has(lead.id) ? 'rb-row-selected' : ''}>
                  <td style={{ paddingRight: 0 }}>
                    <input
                      type="checkbox"
                      className="rb-checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                    />
                  </td>
                  <td>
                    <div className="lead-name" style={{ opacity: 0.65 }}>{lead.name}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.company || '—'}</td>
                  <td>
                    <span className={`status-badge status-${lead.status}`}>{lead.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatDate(lead.deleted_at)}
                  </td>
                  <td>
                    <div className="rb-actions">
                      <button
                        className="btn rb-restore-btn"
                        onClick={() => setRestoreTarget(lead)}
                        title="Restore lead"
                      >
                        <IconRestore /> Restore
                      </button>
                      <button
                        className="btn rb-perm-delete-btn"
                        onClick={() => setPermTarget(lead)}
                        title="Delete permanently"
                      >
                        <IconDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Restore modal */}
      <DeleteModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        loading={restoreLoading}
        title="Restore this lead?"
        message={
          <>
            <strong style={{ color: 'var(--text-primary)' }}>{restoreTarget?.name}</strong> will be
            moved back to your active leads list.
          </>
        }
        confirmLabel="Restore"
        variant="warning"
      />

      {/* Permanent delete modal */}
      <DeleteModal
        isOpen={!!permTarget}
        onClose={() => setPermTarget(null)}
        onConfirm={handlePermDelete}
        loading={permLoading}
        title="Permanently delete lead?"
        message={
          <>
            <strong style={{ color: 'var(--text-primary)' }}>{permTarget?.name}</strong> and all
            their notes will be <strong>permanently erased</strong>. This cannot be undone.
          </>
        }
        confirmLabel="Delete Forever"
        variant="danger"
      />

      {/* Bulk modal */}
      <DeleteModal
        isOpen={bulkModal}
        onClose={() => setBulkModal(false)}
        onConfirm={handleBulkConfirm}
        loading={bulkLoading}
        title={
          bulkAction === 'restore'
            ? `Restore ${selected.size} lead${selected.size !== 1 ? 's' : ''}?`
            : `Permanently delete ${selected.size} lead${selected.size !== 1 ? 's' : ''}?`
        }
        message={
          bulkAction === 'restore'
            ? 'The selected leads will be moved back to your active leads list.'
            : 'The selected leads and all their notes will be permanently erased. This cannot be undone.'
        }
        confirmLabel={bulkAction === 'restore' ? 'Restore All' : 'Delete Forever'}
        variant={bulkAction === 'restore' ? 'warning' : 'danger'}
      />
    </div>
  );
}
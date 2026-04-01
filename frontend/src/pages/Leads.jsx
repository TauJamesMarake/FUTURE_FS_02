import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadTable from '../components/LeadTable';
import DeleteModal from '../components/DeleteModal';
import useLeads from '../hooks/useLeads';
import { deleteLead, exportLeads } from '../services/api';

export default function Leads() {
  const navigate = useNavigate();
  const { leads, loading, error, filters, updateFilter, resetFilters, refetch } = useLeads();

  // ── Selection state ──
  const [selected,      setSelected]      = useState(new Set());
  const [bulkModal,     setBulkModal]     = useState(false);
  const [bulkLoading,   setBulkLoading]   = useState(false);

  // ── Export state ──
  const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null

  const handleSearch = useCallback(
    (e) => updateFilter('search', e.target.value),
    [updateFilter]
  );

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportLeads(format);
    } catch {
      alert(`Export failed. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  // Toggle one row
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle all visible rows
  const toggleAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map(l => l.id)));
    }
  };

  // Bulk soft-delete all selected leads
  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(id => deleteLead(id)));
      setSelected(new Set());
      setBulkModal(false);
      refetch();   // reload the list
    } catch {
      alert('One or more deletes failed. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const allChecked   = leads.length > 0 && selected.size === leads.length;
  const someChecked  = selected.size > 0 && selected.size < leads.length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>All Leads</h2>
          <p>{leads.length} lead{leads.length !== 1 ? 's' : ''} found</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Export CSV */}
          <button
            className="btn btn-ghost export-btn"
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            title="Export as CSV"
          >
            {exporting === 'csv' ? (
              <span className="export-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            CSV
          </button>

          {/* Export PDF */}
          <button
            className="btn btn-ghost export-btn"
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            title="Export as PDF"
          >
            {exporting === 'pdf' ? (
              <span className="export-spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            )}
            PDF
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 2px' }} />

          {/* Recycle Bin */}
          <button
            className="btn btn-ghost recycle-bin-btn"
            onClick={() => navigate('/recycle-bin')}
            title="Recycle Bin"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Recycle Bin
          </button>
        </div>
      </div>

      {/* Bulk action bar (appears when rows are checked) */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-bar-count">
            {selected.size} lead{selected.size !== 1 ? 's' : ''} selected
          </span>
          <button
            className="btn bulk-bar-delete-btn"
            onClick={() => setBulkModal(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Move to Trash
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-row">
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <span className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="form-control"
            placeholder="Search name, email, company…"
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        <select
          className="form-control"
          value={filters.status}
          onChange={e => updateFilter('status', e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>

        <select
          className="form-control"
          value={filters.source}
          onChange={e => updateFilter('source', e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social</option>
          <option value="email">Email</option>
          <option value="other">Other</option>
        </select>

        {(filters.search || filters.status || filters.source) && (
          <button className="btn btn-ghost" onClick={resetFilters} style={{ fontSize: 12 }}>Clear</button>
        )}
      </div>

      {/* Table with checkboxes */}
      <LeadTable
        leads={leads}
        loading={loading}
        selected={selected}
        onToggleOne={toggleOne}
        onToggleAll={toggleAll}
        allChecked={allChecked}
        someChecked={someChecked}
      />

      {/* Bulk delete modal */}
      <DeleteModal
        isOpen={bulkModal}
        onClose={() => setBulkModal(false)}
        onConfirm={handleBulkDelete}
        loading={bulkLoading}
        title={`Move ${selected.size} lead${selected.size !== 1 ? 's' : ''} to trash?`}
        message="The deleted leads can be recovered from the Recycle Bin at any time."
        confirmLabel="Move to Trash"
        variant="danger"
      />
    </div>
  );
}
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadTable from '../components/LeadTable';
import useLeads from '../hooks/useLeads';

export default function Leads() {
  const navigate = useNavigate();
  const { leads, loading, error, filters, updateFilter, resetFilters } = useLeads();

  const handleSearch = useCallback(
    (e) => updateFilter('search', e.target.value),
    [updateFilter]
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2>All Leads</h2>
          <p>{leads.length} lead{leads.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filters-row">
        {/* Search */}
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search name, email, company…"
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        {/* Status filter */}
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

        {/* Source filter */}
        <select
          className="form-control"
          value={filters.source}
          onChange={e => updateFilter('source', e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="ad">Ad</option>
          <option value="social">Social</option>
          <option value="other">Other</option>
        </select>

        {/* Reset */}
        {(filters.search || filters.status || filters.source) && (
          <button className="btn btn-ghost" onClick={resetFilters} style={{ fontSize: 12 }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* ── Table ── */}
      <LeadTable leads={leads} loading={loading} />
    </div>
  );
}

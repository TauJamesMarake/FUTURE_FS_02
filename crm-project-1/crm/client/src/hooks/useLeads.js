import { useState, useEffect, useCallback } from 'react';
import { getLeads } from '../services/api';

/**
 * Custom hook — fetches leads with search/filter state.
 * Exposes err.displayMessage for clear "server is down" messages.
 */
const useLeads = () => {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', source: '' });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data } = await getLeads(params);
      setLeads(data.leads);
    } catch (err) {
      setError(err.displayMessage || err.response?.data?.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({ search: '', status: '', source: '' });

  return { leads, loading, error, filters, updateFilter, resetFilters, refetch: fetchLeads };
};

export default useLeads;

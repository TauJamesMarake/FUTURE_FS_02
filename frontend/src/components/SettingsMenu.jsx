import { useState, useRef, useEffect } from 'react';
import {
  FaCog, FaSun, FaMoon, FaTimes,
  FaUserShield, FaSignOutAlt
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function SettingsMenu({ admin, onLogout }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      {/* ── Trigger Button (lives inside sidebar) ── */}
      <button
        ref={triggerRef}
        className={`settings-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        title="Settings"
        aria-label="Open settings"
      >
        <FaCog className="cog-icon" />
        <span>Settings</span>
      </button>

      {/* ── Modal Panel + backdrop ── */}
      {open && (
        <>
          {/* Transparent backdrop — catches outside clicks */}
          <div className="settings-backdrop" onClick={() => setOpen(false)} />

          <div className="settings-modal" ref={panelRef} role="dialog" aria-modal="true">

            {/* Header */}
            <div className="settings-header">
              <span>Settings</span>
              <button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">
                <FaTimes />
              </button>
            </div>

            {/* Admin info */}
            <div className="settings-section">
              <div className="settings-label">Signed in as</div>
              <div className="settings-admin-row">
                <FaUserShield className="settings-admin-icon" />
                <span className="settings-admin-email">
                  {admin?.email || 'admin@crm.com'}
                </span>
              </div>
            </div>

            <div className="settings-divider" />

            {/* Theme toggle */}
            <div className="settings-section">
              <div className="settings-label">Appearance</div>
              <button
                className="settings-toggle-row"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <div className="toggle-info">
                  {theme === 'dark'
                    ? <FaMoon className="theme-icon moon" />
                    : <FaSun className="theme-icon sun" />
                  }
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className={`toggle-switch ${theme === 'light' ? 'active' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
              </button>
            </div>

            <div className="settings-divider" />

            {/* Logout */}
            <div className="settings-section">
              <button className="settings-logout" onClick={onLogout}>
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}
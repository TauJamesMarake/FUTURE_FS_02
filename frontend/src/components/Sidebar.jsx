import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconGrid = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V4zM2 11a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"/>
  </svg>
);

const IconUsers = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
  </svg>
);

const IconLogout = () => (
  <svg style={{width:18,height:18,opacity:0.7}} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 000-2H4V5h6a1 1 0 000-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 11H8a1 1 0 010-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">L</div>
          <span className="logo-text">Lead<span>Flow</span></span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">Main</span>

        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <IconGrid />
          Dashboard
        </NavLink>

        <NavLink to="/leads" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <IconUsers />
          Leads
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <IconLogout />
          Sign out
        </button>
      </div>
    </aside>
  );
}

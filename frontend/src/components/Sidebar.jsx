import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaUsers } from 'react-icons/fa';
import SettingsMenu from './SettingsMenu';

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">L</div>
          <span className="logo-text">LEAD<span>it</span></span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="nav-label">Main</span>

        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <FaTachometerAlt className="nav-icon" />
          Dashboard
        </NavLink>

        <NavLink to="/leads" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <FaUsers className="nav-icon" />
          Leads
        </NavLink>
      </nav>

      {/* Footer — Settings trigger lives here */}
      <div className="sidebar-footer">
        <SettingsMenu admin={admin} onLogout={handleLogout} />
      </div>

    </aside>
  );
}
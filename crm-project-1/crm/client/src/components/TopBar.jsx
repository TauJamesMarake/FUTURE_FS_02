import { useAuth } from '../context/AuthContext';

export default function TopBar({ title, subtitle }) {
  const { admin } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="admin-badge">
          <span className="dot" />
          {admin?.email || 'Admin'}
        </div>
      </div>
    </header>
  );
}

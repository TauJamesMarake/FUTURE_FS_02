import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LeadCaptureModal from './LeadCaptureModal';

export default function TopBar({ title, subtitle }) {
  const { admin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            New Lead
          </button>

          <LeadCaptureModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />

        </div>
        <div className="admin-badge">
          <span className="dot" />
          {admin?.email || 'Admin'}
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import {
    FaUser, FaEnvelope, FaPhone, FaBuilding,
    FaGlobe, FaCheckCircle, FaExclamationCircle,
    FaArrowRight, FaSpinner, FaTimes
} from 'react-icons/fa';
import { createLead } from '../services/api';

const SOURCES = ['website', 'referral', 'linkedin', 'email', 'other'];

export default function LeadCaptureModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', company: '', source: 'website'
    });
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    // Prevent background scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        // Don't close mid-submission
        if (status === 'loading') return;
        setStatus('idle');
        setErrorMsg('');
        setForm({ name: '', email: '', phone: '', company: '', source: 'website' });
        onClose();
    };

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return;
        setStatus('loading');
        setErrorMsg('');
        try {
            await createLead(form);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={handleClose} />

            {/* Modal Panel */}
            <div className="modal-panel" role="dialog" aria-modal="true">

                {/* Close Button */}
                <button className="modal-close" onClick={handleClose} aria-label="Close">
                    <FaTimes />
                </button>

                {/* Success State */}
                {status === 'success' ? (
                    <div className="modal-success">
                        <div className="success-icon"><FaCheckCircle /></div>
                        <h2>You're on the list!</h2>
                        <p>Thanks for your interest. We'll be in touch with you shortly.</p>
                        <button className="btn btn-primary" onClick={handleClose}>
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="modal-header">
                            <h2>Get Started</h2>
                            <p>Leave your details and we'll reach out to you.</p>
                        </div>

                        {/* Error Banner */}
                        {status === 'error' && (
                            <div className="form-error-banner">
                                <FaExclamationCircle />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="modal-form">

                            <div className="form-group">
                                <label htmlFor="lcm-name">
                                    Your Name <span className="required">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaUser className="input-icon" />
                                    <input
                                        id="lcm-name" name="name" type="text"
                                        className="form-control with-icon"
                                        placeholder="Jane Smith"
                                        value={form.name}
                                        onChange={handleChange}
                                        required autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lcm-email">
                                    Email Address <span className="required">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        id="lcm-email" name="email" type="email"
                                        className="form-control with-icon"
                                        placeholder="jane@company.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="lcm-phone">Phone</label>
                                    <div className="input-wrapper">
                                        <FaPhone className="input-icon" />
                                        <input
                                            id="lcm-phone" name="phone" type="tel"
                                            className="form-control with-icon"
                                            placeholder="+27 82 000 0000"
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lcm-company">Company</label>
                                    <div className="input-wrapper">
                                        <FaBuilding className="input-icon" />
                                        <input
                                            id="lcm-company" name="company" type="text"
                                            className="form-control with-icon"
                                            placeholder="Acme Inc."
                                            value={form.company}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lcm-source">How did you hear about us?</label>
                                <div className="input-wrapper">
                                    <FaGlobe className="input-icon" />
                                    <select
                                        id="lcm-source" name="source"
                                        className="form-control with-icon"
                                        value={form.source}
                                        onChange={handleChange}
                                    >
                                        {SOURCES.map(s => (
                                            <option key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary submit-btn"
                                disabled={status === 'loading' || !form.name.trim() || !form.email.trim()}
                            >
                                {status === 'loading'
                                    ? <><FaSpinner className="spin" /> Submitting…</>
                                    : <>I'm Interested <FaArrowRight /></>
                                }
                            </button>

                        </form>
                    </>
                )}
            </div>

            <style>{`
        /* Backdrop */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fade-in 0.2s ease;
        }

        /* Panel */
        .modal-panel {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1001;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg, 16px);
          padding: 36px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
          animation: slide-up 0.22s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, -46%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }

        /* Close button */
        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 50%;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.15s;
        }
        .modal-close:hover {
          color: var(--text-primary);
          border-color: var(--accent);
        }

        /* Header */
        .modal-header {
          margin-bottom: 24px;
        }
        .modal-header h2 {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 6px;
        }
        .modal-header p {
          color: var(--text-muted);
          font-size: 13.5px;
          margin: 0;
        }

        /* Form layout */
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .required { color: var(--accent); }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 11px;
          color: var(--text-muted);
          font-size: 12px;
          pointer-events: none;
          z-index: 1;
        }

        .form-control.with-icon { padding-left: 34px; }

        /* Error banner */
        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md, 8px);
          padding: 11px 14px;
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 4px;
        }

        /* Submit */
        .submit-btn {
          width: 100%;
          justify-content: center;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          font-size: 14.5px;
          margin-top: 4px;
        }

        /* Success */
        .modal-success {
          text-align: center;
          padding: 20px 0 10px;
        }
        .success-icon {
          font-size: 48px;
          color: var(--green, #22c55e);
          margin-bottom: 16px;
        }
        .modal-success h2 {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        .modal-success p {
          color: var(--text-muted);
          font-size: 13.5px;
          margin: 0 0 24px;
          line-height: 1.6;
        }

        .spin {
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @media (max-width: 520px) {
          .modal-panel { padding: 24px 20px; margin: 0 12px; max-width: 100%; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
        </>
    );
}
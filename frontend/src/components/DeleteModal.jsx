/**
 * DeleteModal — reusable confirmation modal.
 *
 * Props:
 *   isOpen      boolean
 *   onClose     () => void
 *   onConfirm   () => void  (called when the destructive button is clicked)
 *   loading     boolean
 *   title       string
 *   message     string | ReactNode
 *   confirmLabel string   (default "Delete")
 *   variant      "danger" | "warning"  (default "danger")
 */
export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={!loading ? onClose : undefined} />

      {/* Dialog */}
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Icon */}
        <div className={`modal-icon-wrap modal-icon-wrap--${variant}`}>
          {isDanger ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </div>

        <div id="modal-title" className="modal-title">{title}</div>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button
            className="btn btn-ghost modal-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`btn modal-confirm-btn modal-confirm-btn--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="modal-spinner" />
                Working…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
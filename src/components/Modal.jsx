export default function Modal({ message, onConfirm, onCancel, confirmText, cancelText }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          {cancelText && (
            <button className="modal-btn secondary" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className="modal-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

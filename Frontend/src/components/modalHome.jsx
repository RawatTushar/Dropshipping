import React from 'react';
import { createPortal } from 'react-dom';
import './modalHome.css';

const ModalHome = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return createPortal(
    <div className="modal-home-overlay" onClick={onClose}>
      <div
        className="modal-home"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-home-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h3>{title}</h3>
        <div className="modal-home-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default ModalHome;

// ConfirmDialog.js
import React from "react";


export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
      <div className="confirm-overlay">
        <div className="confirm-card">
          <p className="confirm-message">{message}</p>
          <div className="confirm-buttons">
          <button className="btn cancel-btn" onClick={onCancel}>
              ביטול
            </button>
            <button className="btn confirm-btn" onClick={onConfirm}>
              אישור
            </button>
          </div>
        </div>
      </div>
    );
  }

import React from "react";

export default function AlertDialog({ message, onClose ,title}) {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <h3 >{title}</h3>
        <p className="alert-message">{message}</p>
        
        <button className="btn alert-btn" onClick={onClose}>
          סגור
        </button>
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function InputForm({ message, correctPassword, onSuccess, onCancel }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === correctPassword) {
            setError(false);
            onSuccess();
        } else {
            setError(true);
        }
    };

    return (
        <div className="confirm-overlay">
            <div className="confirm-card">
                <p className="confirm-message">{message}</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="הזן סיסמה"
                        />
                        {error && <p className="error-text">סיסמה שגויה</p>}
                    </div>
                    <div className="confirm-buttons">
                        <button type="button" className="btn cancel-btn" onClick={onCancel}>
                            ביטול
                        </button>
                        <button type="submit" className="btn confirm-btn">
                            אישור
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
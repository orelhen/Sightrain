import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        // Add form submission logic here
        setMessage('Form submitted');
    }

    function navigateToRegister() {
        window.location.href = '/register';
    }

    function navigateToHome() {
        window.location.href = '/home';
    }
    return (
        <section className="form-section">
            <div className="form-container">
                <div className="iframe_bg">
                    <div className="why_overlay_btn">
                        <button>Why us?</button>
                    </div>
                    <div className="why_overlay">
                        <p> /* Your mission statement and other text here */ </p>
                    </div>
                </div>
                <div className="form-content">
                    <h2>Sign in</h2>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                        {message && <p>{message}</p>}
                        <p>
                            Don't have an account? 
                            <button onClick={navigateToRegister} className="register-link">Register</button>
                        </p>
                        <p>
                            Continue as guest
                            <button onClick={navigateToHome} className="register-link">Guest</button>
                        </p>

                    </form>
                </div>
            </div>
        </section>
    );
}

export default LoginPage;

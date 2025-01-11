import React, { useState } from 'react';
import '../css/PagesCss/LoginPage.css';

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
        <section className="main-content">
            <h1>Register</h1>

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
            
        </section>
    );
}

export default LoginPage;







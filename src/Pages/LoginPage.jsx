import React, { useState } from 'react';
import '../css/PagesCss/LoginPage.css';

import { getAuth,signInWithEmailAndPassword } from '../firebase'; // Ensure this path matches your project structure

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

  
    function navigateToRegister() {
        window.location.href = '/register';
    }

    function navigateToHome(user) {
        window.location.href = `/home`;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;
            console.log("User ID:", user.uid); // Log the user ID
            navigateToHome(user);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    }
    
    return (
        <section className="main-content">
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="username">כתובת דואר אלקטרוני </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label htmlFor="password">סיסמה</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>
                <button type="submit">התחבר</button>
                {message && <p>{message}</p>}

                <p>
                    אין לך משתמש?
                    <button onClick={navigateToRegister} className="register-link">הרשם</button>
                </p>

                <p>
                    
                    <button onClick={navigateToHome} className="register-link">המשך כאורח</button>
                </p>
            </form>
            
        </section>
    );
}

export default LoginPage;







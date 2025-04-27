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
        <section className="form-container">
            <div className="form-content">
                <h2>התחברות</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="username"
                        placeholder="כתובת דואר אלקטרוני"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">התחבר</button>
                    {message && <p>{message}</p>}
                </form>
                <p>
                    אין לך משתמש?{' '}
                    <button onClick={navigateToRegister} className="register-link">
                        הרשם
                    </button>
                </p>
                <p>
                    <button onClick={navigateToHome} className="register-link">
                        המשך כאורח
                    </button>
                </p>
            </div>
            <div className="iframe_bg">
                  <iframe
                    className="main_iframe"
                    src="https://yourdomain.com/eye-training-image.jpg"
                    title="Eye Training Image"
                    />
                <div className="why_overlay_btn">
                    <a href="#why">למה?</a>
                </div>
                <div className="why_overlay">
                    <p>
                    ההרשמה לאתר SighTrain מאפשרת לכל משתמש לקבל חוויית אימון אישית וממוקדת. כאשר משתמשים רשומים ומחוברים, המערכת שומרת את כל נתוני ההתקדמות, התוצאות מהאימונים והסטטיסטיקות האישיות שלהם. נתונים אלה מאפשרים למשתמשים ולעוסקים בתחום הרפואה לעקוב מקרוב אחרי השיפור ביכולות הראייה לאורך זמן ולהתאים את תכנית השיקום לפי הצורך.
                    בנוסף, משתמשים מחוברים נהנים מגישה מותאמת אישית, אפשרות להמשכיות בין מפגשי האימון, שמירת ההעדפות האישיות, ומעקב רציף שמסייע בקידום תהליך השיקום בצורה מדויקת ויעילה יותר.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default LoginPage;







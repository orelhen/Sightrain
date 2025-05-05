import React, { useState } from 'react';
import '../css/PagesCss/LoginPage.css';
import { useNavigate } from 'react-router-dom'; 
import AlertDialog from '../Components/Alert';

import { getAuth,signInWithEmailAndPassword,getFirestore,where,collection,query,getDocs } from '../firebase'; // Ensure this path matches your project structure

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

  
    function navigateToRegister() {
        navigate('/register');
    }

    function navigateToHome() {
        navigate('/home', { state: { patientId: "" } }); 
    }

    async function handleSubmit(event) {
        event.preventDefault();
        // Check if user is a patient with special password
        if (password === '1234') {
            try {
                const firestore = getFirestore();
                const patientsRef = collection(firestore, "patients");
                const q = query(patientsRef, where("id", "==", username));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    // Found the patient, navigate to home with the patient ID
                    console.log("Patient found, navigating to home");
                    const patientDoc = querySnapshot.docs[0];
                    const patientId = patientDoc.id;
                    // Navigate to home with patient info
                    navigate('/home', { state: { patientId } });
                    return; // Exit the function early
                }
                setMessage("שגיאה בהתחברות, אנא בדוק את פרטי ההתחברות שלך");
            setShowAlert(true);
                // If querySnapshot is empty, continue with normal authentication below
            } catch (error) {
                console.error("Error checking patient records:", error);
                // Continue with normal authentication
            }
        } else {
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;
            console.log("User ID:", user.uid); // Log the user ID
            navigate('/home', { state: { patientId: "" } }); 
        } catch (error) {
            setMessage("שגיאה בהתחברות, אנא בדוק את פרטי ההתחברות שלך");
            setShowAlert(true);
        }}
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
                </form>
                    אין לך משתמש?{' '}
                    <button onClick={navigateToRegister}>
                        הרשם
                    </button>
                    <button onClick={navigateToHome} >
                        המשך כאורח
                    </button>
            </div>
            <div className="iframe_bg">
                  <iframe
                    className="main_iframe"
                    title="Eye Training Image"
                    />
                <div className="why_overlay_btn"></div>
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
            {showAlert && (
            <AlertDialog 
                open={showAlert} 
                title="שגיאת התחברות" 
                message={message}
                onClose={() => setShowAlert(false)}
            />  )}
        </section>
    );
}

export default LoginPage;







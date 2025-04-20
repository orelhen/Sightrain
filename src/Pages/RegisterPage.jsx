import React, { useState } from 'react';
import '../css/PagesCss/Register.css';
import { getAuth, createUserWithEmailAndPassword } from "../firebase.js";

const RegisterPage = () => {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('normal');
    const [hospital, setHospital] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    
    let usid="";
    const handleFirebaseRegistration = async () => {
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setServerMessage('הרשמה בוצעה בהצלחה');
            console.log('Registered user:', user);
            usid=user.uid;
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            setServerMessage(`שגיאה בהרשמה: ${errorMessage}`);
            console.error('Firebase registration error:', errorCode, errorMessage);
        }
    };
    const saveUserToFirestore = async (userId, name, age, email, role, hospital) => {
        try {
            const { firestore } = await import('../firebase'); // Import Firestore from your firebase.js
            const { doc, setDoc } = await import('firebase/firestore'); // Import Firestore methods
            const userDoc = doc(firestore, 'users', usid);
            await setDoc(userDoc, {
                ID: userId, 
                name,
                age,
                email,
                role,
                hospital: role === 'caregiver' ? hospital : null,
                createdAt: new Date(),
            });
            console.log('User saved to Firestore');
        } catch (error) {
            console.error('Error saving user to Firestore:', error);
            setServerMessage('שגיאה בשמירת המשתמש למסד הנתונים');
        }
    };

    const handleRegistration = async () => {
        const newErrors = {};

        if (!validateEmail(email)) {
            newErrors.email = 'אימייל לא תקין';
        }

        if (!validatePassword(password)) {
            newErrors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await handleFirebaseRegistration();
            await saveUserToFirestore(userId, name, age, email, role, hospital);
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleRegistration();
    };

    return (
        <section className="registration-section">
            <div className="registration-container">
                <div className="registration-form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="reg_main">
                            <h2>הרשמה</h2>
                            <label htmlFor="userId">תעודת זהות
                                <input type="text" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
                            </label>

                            <label htmlFor="name">שם מלא
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </label>

                            <label htmlFor="age">גיל
                                <input type="text" id="age" value={age} onChange={(e) => setAge(e.target.value)} required />
                            </label>

                            <label htmlFor="email">אימייל
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                {errors.email && <p className="error-message">{errors.email}</p>}
                            </label>

                            <label htmlFor="password">סיסמה
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                {errors.password && <p className="error-message">{errors.password}</p>}
                            </label>

                            <label htmlFor="role">תפקיד
                                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="normal">משתמש רגיל</option>
                                    <option value="caregiver">מטפל</option>
                                </select>
                            </label>

                            {role === 'caregiver' && (
                                <label htmlFor="hospital">בית חולים
                                    <input type="text" id="hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} required />
                                </label>
                            )}
                        </div>

                        <div className="reg_btn_container">
                            <button type="submit">הירשם</button>
                            {serverMessage && <p className="server-message">{serverMessage}</p>}
                            <p>
                                כבר יש לך חשבון?
                                <a href="/login" className="register-link"> התחבר</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default RegisterPage;

import React, { useState } from 'react';
import '../css/PagesCss/Register.css';
import { getAuth, createUserWithEmailAndPassword } from "../firebase.js";
import { useNavigate } from 'react-router-dom'; 
import AlertDialog from '../Components/Alert';
import InputForm from '../Components/InputForm.jsx';

const RegisterPage = () => {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('normal');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [showRegistrationType, setShowRegistrationType] = useState(true);



    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Check if password is at least 8 characters and contains at least 1 letter
        return password.length >= 8 && /[a-zA-Z]/.test(password);
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

    const saveUserToFirestore = async (userId, name, age, email, role, department) => {
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
                department: role === 'caregiver' ? department : null,
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
            await saveUserToFirestore(userId, name, age, email, role, department);
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleRegistration();
    };

    const [showInputForm, setShowInputForm] = useState(false);

    return (
        <div>
        {showInputForm && (
            <InputForm 
                message="אנא הזן קוד מטפל להמשך ההרשמה"
                correctPassword="TOM"
                onSuccess={() => {
                    setRole('caregiver');
                    setShowRegistrationForm(true);
                    setShowRegistrationType(false);
                    setShowInputForm(false);
                }}
                onCancel={() => setShowInputForm(false)}
            />
        )}
        <section className="registration-section main_section_prop">
            
                {showRegistrationType && (
                <div className="registration-options text-center">
                    <h1 className="main_logo">SighTrain</h1>
                     <button type="button" className="register-link" onClick={() =>  navigate('/login')}>חזור לדף התחברות</button>
                <h1 className="registration-title">בחר סוג הרשמה</h1>
                <div className="registration-cards">
                    <div 
                        className="registration-card patient-card"
                        onClick={() => {
                            setRole('normal');
                            setShowRegistrationForm(true);
                            setShowRegistrationType(false);
                        }}
                    >
                        <div className="card-icon">👨</div>
                        <h2>הרשמה כמשתמש</h2>
                        <p>אם אתה מעוניין להשתמש באתר לאימון ראייה</p>
                        <h3>בעזרת משתמש זה תוכל לשמור את תוצאות האימונים שלך ותוכל לעקוב אחרי הפעילות שלך באתר</h3>
                        <button className="card-button">הרשם</button>
                    </div>
                    
                    <div 
                        className="registration-card caregiver-card"
                        onClick={() => setShowInputForm(true)}
                    >
                        <div className="card-icon">👨‍⚕️</div>
                        <h2>הרשמה כמטפל</h2>
                        <p>אם אתה איש מקצוע רפואי שמלווה מטופלים</p>
                        <h3>בעזרת משתמש זה תוכל לעקוב אחרי כל המטופלים שלך במחלקה ולתת להם להשתמש באתר </h3>
                        <button className="card-button">הרשם</button>
                    </div>
                </div>
            </div>)}
                <div className="registration-form-container">
                    {showRegistrationForm && (
                    <form onSubmit={handleSubmit}>
                        <div className="reg_main">
                        <h1 className="main_logo">SighTrain</h1>

                            <h2>דף הרשמה</h2>
                            <label htmlFor="name">שם מלא</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />

                            <label htmlFor="age">תאריך לידה</label>
                            <input type="date" id="age" value={age} onChange={(e) => setAge(e.target.value)} required />

                            <label htmlFor="email">כתובת דואר אלקטרוני</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            {errors.email && <p className="error-message">{errors.email}</p>}


                            <label htmlFor="password">סיסמה</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            {errors.password && <p className="error-message">{errors.password}</p>}

                          
                            {role === 'caregiver' && (
                                <label htmlFor="department">בית חולים
                                    <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                        <option value="">בחר בית חולים</option>
                                        <option value="סורוקה-עיניים">בית חולים סורוקה-מחלקת עיניים</option>
                                        <option value="סורוקה-ריפוי">בית חולים סורוקה - מחלקת ריפוי בעיסוק</option>
                                        <option value="איכילוב-עיניים">בית חולים איכילוב - מחלקת עיניים</option>
                                        <option value="רמבם-עיניים">בית חולים רמב״ם - מחלקת עיניים</option>
                                        <option value="שיבא-עיניים">בית חולים שיבא - מחלקת עיניים</option>
                                    </select>
                                </label>
                            )}
                                </div>
        
                                <div className="reg_btn_container">
                                    <button type="submit">הירשם</button>
                                    {serverMessage && <p className="server-message">{serverMessage}</p>}
                                    <h3>כבר יש לך חשבון?</h3>
                                    <button type="button" onClick={() => navigate('/login')}>התחבר</button>
                                </div>
                            </form>
                        )}
                    </div>

            {showAlert && (
                <AlertDialog 
                    open={showAlert} 
                    title="שגיאת התחברות" 
                    message={serverMessage}
                    onClose={() => setShowAlert(false)}
                />
            )}

          
        </section>
        </div>
    );
};

export default RegisterPage;

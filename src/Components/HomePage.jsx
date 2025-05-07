import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackForm from './feedbackform.jsx';
import sighTrainImage from '../assets/SighTrain.jpeg';
import DemoStats from './DemoStats.jsx';
import logo1 from '../assets/SCE.png';
// import logo2 from '../assets/SorokaLogo.svg'; // Treated as an image
import logo3 from '../assets/TOM2.png';

// Then in JSX:
<img src={logo1} alt="Logo 1" />


const HomePage = () => {
    const navigate = useNavigate();
    const [showFeedback, setShowFeedback] = useState(false);

    return (


        <div className="home-container" id="home">


            <section className="hero-fullscreen">
                <div className="overlay">
                    <h2> תרגול יומי לשינוי מהותי - משקמים את הראייה</h2>
                </div>
            </section>


            <div className="scroll-card-wrapper">
                <section className="scroll-section section-white">
                    <h2>ברוכים הבאים</h2>
                    <p>שיקום ראייה אפקטיבי מתחיל בהרגלים קטנים, יומיומיים. 
                    <br></br>באמצעות סדרת תרגילים ממוקדים, אנחנו עוזרים למוח ללמוד מחדש כיצד לראות – בצורה אפקטיבית, מהנה ובגובה העיניים.</p>
                    <li>משחקי אימון עיניים דינמיים שמאתגרים ומהנים</li>
                    <li>סשנים מונחים בוידאו לשיפור הריכוז והתיאום</li>
                    <li>מעקב התקדמות בזמן אמת עם נתונים מעמיקים</li>
                    <li>נגיש מכל מקום עם עיצוב ידידותי למשתמש</li>

                </section>
        

                <section className="scroll-section section-gray">
                <DemoStats/>
                </section>

                <section className="scroll-section section-blue">
                <h2>שאלות נפוצות </h2>
                    <ul className="faq-list">
                        <li><strong>מה זה SighTrain?</strong> מערכת דיגיטלית לשיקום שדה הראייה בעזרת תרגולים יומיים.</li>
                        <li><strong>האם התרגילים מתאימים לכל גיל?</strong> כן! המערכת גמישה ומתאימה לילדים, מבוגרים ומבוגרים בגיל השלישי.</li>
                        <li><strong>כמה זמן מומלץ להתאמן ביום?</strong> לרוב 10–20 דקות ביום מספקות כדי לראות שיפור.</li>
                        <li><strong>באילו בעיות ראייה זה יכול לעזור?</strong> לאחר פגיעות מוחיות, שבץ או תסמונות הפוגעות בשדה הראייה.</li>
                        <li><strong>האם אני צריך ציוד מיוחד?</strong> לא, רק מחשב או טאבלט עם אינטרנט.</li>
                        <li><strong>הידעת?</strong> מחקרים מראים שאימון קבוע יכול להחזיר עד 60% מהשדה האבוד.</li>
                    </ul>
                </section>
                <br></br>
                <br></br>
            </div>      

            <button onClick={() => navigate('/login')} >התחילו עכשיו</button>
            <button onClick={() => setShowFeedback(true)}>שלח משוב על האתר</button>

            {showFeedback && (
                <FeedbackForm onClose={() => setShowFeedback(false)} />
            )}

            <footer className="site-footer">
            <div className="footer-content">
                <img src={logo1} alt="SCE Logo" className="footer-logo" />
                
                <div className="footer-text">
                <p> פותח בשיתוף עם צוות רפואי מקצועי ממחלקת השיקום בסורוקה ובוגרי המחלקה להנדסת תוכנה.</p>
                <p>&copy; 2025 SighTrain</p>
                </div>
                
                <img src={logo3} alt="TOM Logo" className="footer-logo" />
            </div>
            </footer>
                </div>
            );
            };

export default HomePage;
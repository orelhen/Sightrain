import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import FeedbackForm from './feedbackform.jsx';
import sighTrainImage from '../assets/SighTrain.jpeg';
const HomePage = () => {
    const navigate = useNavigate();
    const [showFeedback, setShowFeedback] = useState(false);
   
    return (

        
        <div className="home-container" id="home">
            {/* Original sections remain the same */}
            {/* Original sections remain the same */}

            <section className="hero-fullscreen">
            <div className="overlay">
                <h2> תרגול יומי לשינוי מהותי - משקמים את הראיה</h2>
            </div>
            </section>
            
            {/* <section className="hero-section">
                <h2> ברוכים הבאים</h2>
                <p>
                    אנחנו ממציאים מחדש את הדרך שבה המוח והעיניים עובדים יחד. <br /> 
                    הפלטפורמה שלנו משלבת מדע, טכנולוגיה וחוויות מהנות כדי ליצור מרחב שבו ההתקדמות לא רק אפשרית אלא גם מהנה. <br /> 
                    בין אם אתם חוקרים משחקים אינטראקטיביים או משתתפים בסשנים מונחים בוידאו, SighTrain כאן כדי לעזור לחזק קשרים ולעורר צמיחה.<br /> 
                </p>
            </section> */}
            <div className="scroll-card-wrapper">
            <section className="scroll-section section-white">
                <h2>ברוכים הבאים</h2>
                <p>אנחנו ממציאים מחדש את הדרך שבה המוח והעיניים עובדים יחד...</p>
                <li>משחקי אימון עיניים דינמיים שמאתגרים ומהנים</li>
                <li>סשנים מונחים בוידאו לשיפור הריכוז והתיאום</li>
                <li>מעקב התקדמות בזמן אמת עם נתונים מעמיקים</li>
                <li>נגיש מכל מקום עם עיצוב ידידותי למשתמש</li>
                
            </section>

            <section className="scroll-section section-gray">
                <h2>מה הופך את SighTrain לייחודית?</h2>
                <ul>
                <li>🎮 משחקים דינמיים</li>
                <li>📊 מעקב מדויק</li>
                <li>📺 סשנים מודרכים</li>
                </ul>
            </section>

            <section className="scroll-section section-blue">
                <h2>אובדן שדה ראייה</h2>
                <p>שדה הראייה הוא כל המרחב שאדם יכול לראות סביבו...</p>
            </section>
            </div>

        
            {/* <section className="hero-section video">
                <h2>ראו את SighTrain בפעולה</h2>
                <video controls className="highlight-video">...</video>
            </section> */}

            {/* <section className="hero-section call-to-action">
                <h2>הצטרפו למסע עם SighTrain</h2>
                <p>
                    הצטרפו למסע לחיזוק הקשרים. עם SighTrain אתם מנצלים את הפוטנציאל של העיניים שלכם.
                </p>
            </section> */}
            
            {/* Other sections remain the same */}

            <button onClick={() => navigate('/login')} >התחילו עכשיו</button>
            <button onClick={() => setShowFeedback(true)}>שלח משוב על האתר</button>

            {showFeedback && (
                <FeedbackForm onClose={() => setShowFeedback(false)}/>
            )}
        </div>
    );
};

export default HomePage;
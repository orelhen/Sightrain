import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import FeedbackForm from './feedbackform.jsx';




const CgHomepage = ({ComponentClick}) => {
    const navigate = useNavigate();

    const [showFeedback, setShowFeedback] = useState(false);
   
    return (
        <div className="home-container" id="caregiver-home">
            <h1 className="main_logo">SighTrain</h1>

            <section className="hero-fullscreen">
                <div className="overlay">
                    <h2>ברוכים הבאים ל-SighTrain למטפלים</h2>
                </div>
            </section>

            <div className="homepage_section_wrapper">
                <section className="welcome_sec">
                    <p>
                        תודה שאתם כאן. הנוכחות שלכם יוצרת הבדל אמיתי.<br />
                        ב-SighTrain, אנו מאמינים שבזכות ליווי מקצועי, המשתמשים שלנו יכולים להפיק את המקסימום מהפלטפורמה ולחוות צמיחה אמיתית.
                    </p>
               

              
                    <h2>מה תמצאו כאן:</h2>
                    <ul className="benefits-list">
                        <li><i className="fa-solid fa-check"></i> הדרכה קצרה על תהליך השימוש בפלטפורמה</li>
                        <li><i className="fa-solid fa-check"></i> כלים להכוונה נכונה של המטופל במהלך המשחקים והסשנים</li>
                        <li><i className="fa-solid fa-check"></i> אפשרות לשלוח משוב על הפלטפורמה ולשתף חוויות</li>
                        <li><i className="fa-solid fa-check"></i> אפשרות למעקב אחרי התקדמות המטופלים בזמן אמת</li>
                    </ul>
                    </section>

                <section className="role_sec" id="caregiver-role">
                
                    <p>
                        אתם לא רק תומכים טכנית – אתם שותפים למסע האישי של המטופל. תפקידכם לעודד, להעצים, ולוודא שהחוויה חיובית ומותאמת אישית.
                    </p>
                </section>

                <section className="cta_sec">
                
                    <div className="button-group">
                        <button className="cta-button" onClick={() => ComponentClick("manual")}>מעבר להדרכה המקוצרת</button>
                        <button onClick={() => setShowFeedback(true)}>שלח משוב על האתר</button>
                    </div>
                </section>
            </div>

            {showFeedback && (
                <FeedbackForm onClose={() => setShowFeedback(false)}/>
            )}
            
            <footer className="site-footer">
                <div className="footer-content">
                    <div className="footer-text">
                        <p>SighTrain למטפלים - מלווים את המטופלים לראייה טובה יותר</p>
                        <p>&copy; 2025 SighTrain</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CgHomepage;
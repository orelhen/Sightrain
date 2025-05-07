import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import FeedbackForm from './feedbackform.jsx';


const CgHomepage = () => {
    const navigate = useNavigate();

    const [showFeedback, setShowFeedback] = useState(false);
   
    return (
        <div className="caregiver-home-container" id="caregiver-home">
            <section >
                <h2>ברוכים הבאים ל-SighTrain למטפלים</h2>
                <p>
                    תודה שאתם כאן. הנוכחות שלכם יוצרת הבדל אמיתי.<br />
                    ב-SighTrain, אנו מאמינים שבזכות ליווי מקצועי, המשתמשים שלנו יכולים להפיק את המקסימום מהפלטפורמה ולחוות צמיחה אמיתית.
                </p>
            </section>

            <section  id="caregiver-features">
                <h2>מה תמצאו כאן:</h2>
                <ul className="caregiver-benefits-list">
                    <li>✅ הדרכה קצרה על תהליך השימוש בפלטפורמה</li>
                    <li>✅ כלים להכוונה נכונה של המטופל במהלך המשחקים והסשנים</li>
                    <li>✅ טיפים לתמיכה אפקטיבית בהתמודדות עם אתגרים נפוצים</li>
                    <li>✅ גישה למרכז המשאבים למטפלים - סרטונים, מדריכים, ותשובות לשאלות נפוצות</li>
                </ul>
            </section>

            <section  id="caregiver-role">
                <h2>התפקיד שלכם חשוב</h2>
                <p>
                    אתם לא רק תומכים טכנית – אתם שותפים למסע האישי של המטופל. תפקידכם לעודד, להעצים, ולוודא שהחוויה חיובית ומותאמת אישית.
                </p>
            </section>

            <section>
                <h2>התחילו כאן:</h2>
                <div className="cta-buttons">
                    <button className="cta-button">מעבר להדרכה המקוצרת</button>
                    <button className="cta-button" >עיון בכלים למטפלים</button>
                </div>
            </section>
            <button onClick={() => setShowFeedback(true)}>שלח משוב על האתר</button>

            {showFeedback && (
                <FeedbackForm onClose={() => setShowFeedback(false)}/>
            )}
        </div>
    );
};

export default CgHomepage;
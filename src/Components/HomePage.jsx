import React from 'react';

const HomePage = () => {
    return (
        <div className="home-container" id="home">
            {/* אודותינו */}
            <section className="hero-section">
                <h2>ברוכים הבאים ל-SighTrain</h2>
                <p>
                    ב-SighTrain, אנחנו ממציאים מחדש את הדרך שבה המוח והעיניים עובדים יחד. <br /> 
                    הפלטפורמה שלנו משלבת מדע, טכנולוגיה וחוויות מהנות כדי ליצור מרחב שבו ההתקדמות לא רק אפשרית אלא גם מהנה. <br /> 
                    בין אם אתם חוקרים משחקים אינטראקטיביים או משתתפים בסשנים מונחים בוידאו, SighTrain כאן כדי לעזור לחזק קשרים ולעורר צמיחה.<br /> 
                </p>
            </section>
            
            {/* תכונות המערכת */}
            <section className="hero-section" id="features">
                <h2>מה הופך את SighTrain לייחודית?</h2>
                <ul className="benefits-list">
                    <li>משחקי אימון עיניים דינמיים שמאתגרים ומהנים</li>
                    <li>סשנים מונחים בוידאו לשיפור הריכוז והתיאום</li>
                    <li>מעקב התקדמות בזמן אמת עם נתונים מעמיקים</li>
                    <li>נגיש מכל מקום עם עיצוב ידידותי למשתמש</li>
                </ul>
            </section>

            {/* קטע קריאה לפעולה */}

            <section className="hero-section video">
                <h2>ראו את SighTrain בפעולה</h2>
                <video controls className="highlight-video">...</video>
            </section>

            <section className="hero-section faq">
                <h2>שאלות נפוצות</h2>
                <div className="faq-item">...</div>
            </section>
            <section className="hero-section call-to-action">
                <h2>הצטרפו למסע עם SighTrain</h2>
                <p>
                    הצטרפו למסע לחיזוק הקשרים. עם SighTrain אתם מנצלים את הפוטנציאל של העיניים שלכם.
                </p>
                <button className="cta-button">התחילו עכשיו</button>
            </section>
        </div>
    );
};

export default HomePage;

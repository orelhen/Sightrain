import React from 'react';

const Manual = () => {
    return (
        <div style={{ direction: 'rtl', textAlign: 'right', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>מדריך להפעלת האתר</h1>
            <ol>
                <li>על מנת לתת למטופל חדש להריץ את האתר הכנסי לאיזור ניהול מטופלים וצרי מטופל חדש עם מספר זיהוי עבורו</li>
                <li>לאחר מכן תוכלו להכנס למטופל ולתת לו לגשת לכל המשחקים באתר</li>
                <li>בסוף סיום כל משחק באתר יש ללחוץ על "שמור נתונים" על מנת שהנתונים של ביעוי המשחק ישמרו במערכת</li>
                <li>תוכלו לראות תוצאות עבור כל מטופל באיזור שלו וסטטיסטיקות של הצלחה עבור הנתונים</li>
                {[
                    
                    { text: 'לחצו על כפתור "התחל" על מנת להתחיל את השימוש באתר', image: '/public/images/eyescetch.png' },
                    { text: 'בחרו את המשחק הרצוי מתוך הרשימה', image: '/path/to/image2.jpg' },
                    { text: 'עקבו אחר ההוראות המופיעות על המסך', image: '/path/to/image3.jpg' },
                ].map((step, index) => (
                    <li key={index}>
                        <p>{step.text}</p>
                        {step.image && <img src={step.image} alt={`Step ${index + 1}`} style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} />}
                    </li>
                ))}
             
            </ol>
        </div>
    );
};

export default Manual;
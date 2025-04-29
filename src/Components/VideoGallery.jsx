import React from 'react';
import '../css/ComponentsCss/VideoGallery.css';

const VideoGallery = () => {
    const videos = [
        {
            title: "תרגילי עין עצלה / אימון עין עצלה / תרגילי עיניים לשיפור הראייה",
            description: "על מנת לשפר את הראייה, מומלץ מאוד לבצע תרגילי עיניים. ביצוע תרגילי עיניים באופן קבוע יכול לעזור לשפר את הראייה או את העין העצלה. העיניים שלך יעבדו במלוא הכוח וזה ייתן לך הזדמנות לראות את העולם טוב יותר.",
            link: "https://www.youtube.com/embed/mqXR8O2VJLo?si=ISTEAFacKTsvevAS" // Replace with your YouTube embed link
        },
        {
            title: "חימום עיניים במצב חשוך",
            description: "חימום ברזולוציה גבוהה ללא שגיאות קטנות. תרגול מעקב עיניים ואימון העיניים יכול לשפר את המיקוד, מהירות הקריאה, תפיסה חזותית ויכולות קוגניטיביות.",
            link: "https://www.youtube.com/embed/gCR5EbuNcIE?si=EXmyYkGmyonCYFZb" // Replace with your YouTube embed link
        },
        {
            title: "תרגילי עיניים - תרגילי עיניים לשיפור הראייה - טיפול בראייה",
            description: "איך לשפר את הראייה? תרגילי העיניים שלנו מתאימים גם לאנשים עם ראייה טובה. טכניקות שונות לטיפול בעיניים יכולות לעזור להימנע מיובש, עייפות, תסמונת ראיית מחשב, אדמומיות בעיניים ובעיות הנגרמות משימוש מתמיד במחשבים וסמארטפונים בעבודה ובחיי היומיום.",
            link: "https://www.youtube.com/embed/A3v5F2by_u4?si=ZG3g1634CwujIvfy" // Replace with your YouTube embed link
        },
        {
            title: "תרגילי עיניים - תרגיל לאובדן אוריינטציה",
            description: "השתמש רק בעין אחת, כסה את העין הבריאה שלך. מרחק של 1 או 2 רגלים מהמסך, תלוי בגודל המסך. שמור על מיקוד בנקודה האדומה בכל עת. תצוגת מסך מלא. נסה להשתמש בצג גדול או בטאבלט בגודל 10 אינץ', אך שמור את הראש קרוב אליו. חדר חשוך. אם אתה משתמש במשקפיים, הרכב אותם בזמן הצפייה.",
            link: "https://www.youtube.com/embed/iJeY3XOZlBs?si=MMB7UleVYnqsCQl1" // Replace with your YouTube embed link
        }
    ];

    return (
        <div className="video-gallery">
            <h1>חקור סרטוני אימון עיניים</h1>
            <div className="videos-container">
                {videos.map((video, index) => (
                    <div className="video-card" key={index}>
                        <iframe
                            width="100%"
                            height="200"
                            src={video.link}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <h3>{video.title}</h3>
                        <p>{video.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoGallery;

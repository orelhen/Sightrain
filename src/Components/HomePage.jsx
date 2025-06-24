import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "./feedbackform.jsx";
import sighTrainImage from "../assets/SighTrain.jpeg";
import DemoStats from "./DemoStats.jsx";
import logo1 from "../assets/SCE.png";
// import logo2 from '../assets/SorokaLogo.svg'; // Treated as an image
import logo3 from "../assets/TOM2.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="home-container" id="home">
      <h1 className="main_logo">SighTrain</h1>

      <section className="hero-fullscreen">
        <div className="hero_content_wrapper">
          <div className="hero_banner_titles">
            <h2>תרגול יומי לשינוי מהותי</h2>
            <h3>משקמים את הראייה</h3>
          </div>

          <div className="hero_banner_logos">
            <p>בשיתוף עם:</p>
            <img src={logo1} alt="SCE Logo" className="footer-logo" />
            <img src={logo3} alt="TOM Logo" className="footer-logo" />
          </div>
        </div>
      </section>

      <div className="homepage_section_wrapper">
        <section className="welcome_sec">
          <h2>ברוכים הבאים</h2>

          <p>
            שיקום ראייה אפקטיבי מתחיל בהרגלים קטנים, יומיומיים.
            <br></br>
            באמצעות סדרת תרגילים ממוקדים, אנחנו עוזרים למוח ללמוד מחדש כיצד
            לראות – בצורה אפקטיבית, מהנה ובגובה העיניים.
          </p>

          <ul>
            <li>
              <i class="fa-solid fa-eye"></i> משחקי אימון עיניים דינמיים
              שמאתגרים ומהנים
            </li>
            <li>
              <i class="fa-solid fa-video"></i> סשנים מונחים בוידאו לשיפור
              הריכוז והתיאום
            </li>
            <li>
              <i class="fa-solid fa-signal"></i> מעקב התקדמות בזמן אמת עם נתונים
              מעמיקים
            </li>
            <li>
              <i class="fa-solid fa-universal-access"></i> נגיש מכל מקום עם
              עיצוב ידידותי למשתמש
            </li>
          </ul>
        </section>

        <DemoStats />

        <section className="faq_sec">
          <h2>שאלות נפוצות </h2>
          <ul className="faq-list">
            <li>
              <p style={{ margin: 0 }}>
                <strong>מה זה SighTrain?</strong>
              </p>
              מערכת דיגיטלית לשיקום שדה הראייה בעזרת תרגולים יומיים.
            </li>
            <li>
              <p style={{ margin: 0 }}>
                <strong>האם התרגילים מתאימים לכל גיל?</strong>
              </p>
              כן! המערכת גמישה ומתאימה לילדים, מבוגרים ומבוגרים בגיל השלישי.
            </li>
            <li>
              <p style={{ margin: 0 }}>
                <strong>כמה זמן מומלץ להתאמן ביום?</strong>
              </p>{" "}
              לרוב 10–20 דקות ביום מספקות כדי לראות שיפור.
            </li>
            <li>
              <p style={{ margin: 0 }}>
                <strong>באילו בעיות ראייה זה יכול לעזור?</strong>{" "}
              </p>{" "}
              לאחר פגיעות מוחיות, שבץ או תסמונות הפוגעות בשדה הראייה.
            </li>
            <li>
              <p style={{ margin: 0 }}>
                <strong>האם אני צריך ציוד מיוחד?</strong>
              </p>{" "}
              לא, רק מחשב או טאבלט עם אינטרנט.
            </li>
            <li>
              <p style={{ margin: 0 }}>
                <strong>הידעת?</strong>{" "}
              </p>
              מחקרים מראים שאימון קבוע יכול להחזיר עד 60% מהשדה האבוד.
            </li>
          </ul>
          <div className="button-group">
            <button onClick={() => navigate("/login")}>התחילו עכשיו</button>
            <button onClick={() => setShowFeedback(true)}>
              שלח משוב על האתר
            </button>
          </div>
        </section>
      </div>
      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-text">
            <p>
              {" "}
              פותח בשיתוף עם צוות רפואי מקצועי ממחלקת השיקום בסורוקה ובוגרי
              המחלקה להנדסת תוכנה.
            </p>
            <p>&copy; 2025 SighTrain</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

import '../css/ComponentsCss/UserProfile.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getAuth, onAuthStateChanged, signOut ,firestore,doc, getDoc,setDoc} from "../firebase.js";
import PatientManagement from './PatientManagment.jsx';
const UserProfile = ({Loggedinuserdata}) => {
  //**********add dinamic user db 
  const [user, setUser] = useState(Loggedinuserdata);

  const navigate = useNavigate();
  const auth = getAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
  
  
    return (
      <div className="profile-container">
        <h2>משתמש לא מחובר</h2>
        <button onClick={() => navigate('/login')}>התחבר</button>
      </div>
    );
  }


  //***********add dinamic user information
  return (
    <div className="profile-container">
      <h2>הפרופיל שלי</h2>

      {user?.photo && (
        <img
          src={user.photo}
          alt="User Profile"
          className="profile-image"
        />
      )}

      <p className="profile-info">
        <strong>תעודת זהות:</strong> {user?.id}
      </p>
      <p className="profile-info">
        <strong>שם מלא:</strong> {user?.name}
      </p>
      <p className="profile-info">
        <strong>כתובת מייל:</strong> {user?.email}
      </p>
      <p className="profile-info">
        <strong>גיל:</strong> {user?.age}
      </p>
      {user?.role === "caregiver" && (
        <>
          <p className="profile-info">
            <strong>בה"ח:</strong> {user?.hospital}
          </p>
          <p className="profile-info">
            <strong>תפקיד:</strong> {user?.role}
          </p>
        </>
      )}
      <button onClick={handleLogout}>התנתק</button>
    

      {user?.role !== "caregiver" && (
        <button onClick={() => setShowSummary((prev) => !prev)}>
          {showSummary ? "סגור סיכום" : "הצג סיכום"}
        </button>
      )}
      {showSummary && user?.role !== "caregiver" && (
        <div className="summary-table">
          <h3>סיכום תוצאות משחקים</h3>
          {user?.gameResults ? (
            <div>
              <h4>בחר תאריך:</h4>
              <ul className="session-list">
                {Object.keys(user.gameResults).map((session) => (
                  <li key={session}>
                    <button
                      onClick={() =>
                        setSelectedSession((prevSession) =>
                          prevSession === session ? null : session
                        )
                      }
                    >
                      {session}
                    </button>
                  </li>
                ))}
              </ul>

              {selectedSession && (
                <div>
                  <h4>תוצאות עבור תאריך: {selectedSession}</h4>
                  {user.gameResults[selectedSession].QuickMemoryGame && (
                    <div>
                      <h5>תוצאות משחק זיכרון מהיר:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>סיבוב</th>
                            <th>מספר</th>
                            <th>קלט</th>
                            <th>נכון</th>
                            <th>רמת קושי</th>
                            <th>גודל גופן</th>
                            <th>ריווח</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].QuickMemoryGame.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.round}</td>
                                <td>{game.number}</td>
                                <td>{game.input}</td>
                                <td>{game.isCorrect ? "✔️" : "❌"}</td>
                                <td>{game.difficulty || "N/A"}</td>
                                <td>{game.fontSize || "N/A"}</td>
                                <td>{game.spacing || "N/A"}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {user.gameResults[selectedSession].Catch5Game && (
                    <div>
                      <h5>תוצאות משחק Catch5:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>זמן תגובה ממוצע</th>
                            <th>מיקום תיבה</th>
                            <th>גודל תיבה</th>
                            <th>לחיצות נכונות</th>
                            <th>רמת קושי</th>
                            <th>לחיצות שגויות</th>
                            <th>מספר הופעות של חמש</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].Catch5Game.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.averageReactionTime}</td>
                                <td>{game.boxPosition}</td>
                                <td>{game.boxSize}</td>
                                <td>{game.correctClicks}</td>
                                <td>{game.difficulty}</td>
                                <td>{game.missClicks}</td>
                                <td>{game.timesFiveShown}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {user.gameResults[selectedSession].ColorShadeGame && (
                    <div>
                      <h5>תוצאות משחק ColorShade:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>מספר כדורים</th>
                            <th>גודל כדור</th>
                            <th>תשובות נכונות</th>
                            <th>תשובות שגויות</th>
                            <th>רמת קושי</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].ColorShadeGame.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.ballCount}</td>
                                <td>{game.ballSize}</td>
                                <td>{game.correctAnswers}</td>
                                <td>{game.incorrectAnswers}</td>
                                <td>{game.difficulty}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>אין תוצאות משחק להצגה</p>
          )}
        </div> 
        
      )}
     
    </div>
  );


};

export default UserProfile;

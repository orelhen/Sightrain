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

  // Helper functions
  const calculateCatch5Stats = (games) => {
    const total = games.length;
    if (total === 0) return null;

    const validGames = games.filter(g => g.averageReactionTime != null && !isNaN(g.averageReactionTime));
    const sumReaction = validGames.reduce((sum, g) => sum + Number(g.averageReactionTime), 0);
    const correct = games.reduce((sum, g) => sum + (g.correctClicks || 0), 0);
    const misses = games.reduce((sum, g) => sum + (g.missClicks || 0), 0);

    return {
      averageReaction: (sumReaction / total).toFixed(2),
      totalCorrect: correct,
      totalMisses: misses,
      avgCorrectPerGame: (correct / total).toFixed(2),
    };
  };

  const calculateColorShadeStats = (games) => {
    const total = games.length;
    if (total === 0) return null;

    const correct = games.reduce((sum, g) => sum + (g.correctAnswers || 0), 0);
    const incorrect = games.reduce((sum, g) => sum + (g.incorrectAnswers || 0), 0);
    const totalAnswers = correct + incorrect;
    const avgDifficulty = (games.reduce((sum, g) => sum + (g.difficulty || 0), 0) / total).toFixed(1);

    return {
      totalCorrect: correct,
      totalIncorrect: incorrect,
      accuracy: totalAnswers ? ((correct / totalAnswers) * 100).toFixed(1) : "N/A",
      avgDifficulty: avgDifficulty
    };
  };

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
              <button
                onClick={() => setSelectedSession('all')}
                className={selectedSession === 'all' ? 'active' : ''}
              >
                כל התאריכים
              </button>
              
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
                      {session.replace('Session (', '').replace(')', '')} {/* Remove 'Session' text */}
                    </button>
                  </li>
                ))}
              </ul>

              {selectedSession && (
                <div>
                  <h4>תוצאות עבור תאריך: {selectedSession === 'all' ? 'כל התאריכים' : selectedSession.replace('Session (', '').replace(')', '')}</h4>
                  {(() => {
                    const sessions = selectedSession === 'all' 
                      ? Object.values(user.gameResults)
                      : [user.gameResults[selectedSession]];
                    
                    const allQuickMemoryGames = sessions.flatMap(s => s.QuickMemoryGame || []);
                    const allCatch5Games = sessions.flatMap(s => s.Catch5Game || []);
                    const allColorShadeGames = sessions.flatMap(s => s.ColorShadeGame || []);
                    const allSaccadeClockGames = sessions.flatMap(s => s.SaccadeClockGame  || []);
                    const allScanningGames = sessions.flatMap(s => s.ScanningGame || []);


                    return (
                      <>
                        {allQuickMemoryGames.length > 0 && (
                          <div>
                            <h2>תוצאות משחק זיכרון מהיר:</h2>
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
                                {allQuickMemoryGames.map((game, index) => (
                                  <tr key={index}>
                                    <td>{game.round}</td>
                                    <td>{game.number}</td>
                                    <td>{game.input}</td>
                                    <td>{game.isCorrect ? "✔️" : "❌"}</td>
                                    <td>{game.difficulty || "N/A"}</td>
                                    <td>{game.fontSize || "N/A"}</td>
                                    <td>{game.spacing || "N/A"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {allCatch5Games.length > 0 && (
                          <div>
                            <h2>תוצאות משחק Catch5:</h2>
                            {(() => {
                              const stats = calculateCatch5Stats(allCatch5Games);
                              return (
                                stats && (
                                  <div className="game-summary">
                                    <p>⏱ זמן תגובה ממוצע כולל: {stats.averageReaction}ms</p>
                                    <p>✔️ סך לחיצות נכונות: {stats.totalCorrect}</p>
                                    <p>❌ סך לחיצות שגויות: {stats.totalMisses}</p>
                                    <p>💡 ממוצע לחיצות נכונות למשחק: {stats.avgCorrectPerGame}</p>
                                  </div>
                                )
                              );
                            })()}
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
                                {allCatch5Games.map((game, index) => (
                                  <tr key={index}>
                                    <td>{game.averageReactionTime}</td>
                                    <td>{game.boxPosition}</td>
                                    <td>{game.boxSize}</td>
                                    <td>{game.correctClicks}</td>
                                    <td>{game.difficulty}</td>
                                    <td>{game.missClicks}</td>
                                    <td>{game.timesFiveShown}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {allColorShadeGames.length > 0 && (
                          <div>
                            <h2>תוצאות משחק ColorShade:</h2>
                            {(() => {
                              const stats = calculateColorShadeStats(allColorShadeGames);
                              return (
                                stats && (
                                  <div className="game-summary">
                                    <p>✔️ סך תשובות נכונות: {stats.totalCorrect}</p>
                                    <p>❌ סך תשובות שגויות: {stats.totalIncorrect}</p>
                                    <p>📊 דיוק ממוצע: {stats.accuracy}%</p>
                                    <p>🎯 ממוצע רמת קושי: {stats.avgDifficulty}</p>
                                  </div>
                                )
                              );
                            })()}
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
                                {allColorShadeGames.map((game, index) => (
                                  <tr key={index}>
                                    <td>{game.ballCount}</td>
                                    <td>{game.ballSize}</td>
                                    <td>{game.correctAnswers}</td>
                                    <td>{game.incorrectAnswers}</td>
                                    <td>{game.difficulty}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                  {allSaccadeClockGames.length > 0 && (
                          <div>
                            <h2>תוצאות משחק שעון סקאדות:</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>מספר מוצג</th>
                                  <th>קלט</th>
                                  <th>נכון</th>
                                  <th>זמן תגובה (ms)</th>
                                  <th>גודל גופן</th>
                                  <th>צד התחלתי</th>
                                  <th>סוג סמלים</th>
                                  <th>משך תצוגה</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allSaccadeClockGames.map((game, index) => (
                                  <tr key={index}>
                                    <td>{game.shown}</td>
                                    <td>{game.input}</td>
                                    <td>{game.isCorrect ? "✔️" : "❌"}</td>
                                    <td>{game.timeTaken}</td>
                                    <td>{game.fontSize}</td>
                                    <td>{game.startSide}</td>
                                    <td>{game.symbolSetType}</td>
                                    <td>{game.displayDuration}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                {allScanningGames?.length > 0 && (
                        <div>
                        <h2>תוצאות משחק סריקה:</h2>
                        <table>
                          <thead>
                          <tr>
                            <th>זמן תגובה ממוצע</th>
                            <th>תווים בשורה</th>
                            <th>זיהויים נכונים</th>
                            <th>מספר שורות</th>
                            <th>גודל גופן</th>
                            <th>כיוון סריקה</th>
                            <th>ריווח</th>
                            <th>סוג סמלים</th>
                            <th>תו מטרה</th>
                            <th>סך מטרות</th>
                          </tr>
                          </thead>
                          <tbody>
                          {allScanningGames.map((game, index) => (
                            <tr key={index}>
                              <td>{game.averageReactionTime}</td>
                              <td>{game.charactersPerRow}</td>
                              <td>{game.correctDetections}</td>
                              <td>{game.numberOfLines}</td>
                              <td>{game.fontSize}</td>
                              <td>{game.scanDirection}</td>
                              <td>{game.spacing}</td>
                              <td>{game.symbolSetType}</td>
                              <td>{game.targetChar}</td>
                              <td>{game.totalTargets}</td>
                            </tr>
                          ))}
                          </tbody>
                        </table>
                        </div>
                      )}
                      </>
                    );
                  })()}
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

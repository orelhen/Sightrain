import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut ,firestore,doc, getDoc,setDoc} from "../firebase.js";
import BasicPie from './StatisticsCopmonents/PieChart.jsx';
import { Catch5LineChart } from './StatisticsCopmonents/LineChart.jsx';

const MyStats = ({ Loggedinuserdata ,activeUser }) => {
    const [user, setUser] = useState(Loggedinuserdata);
    const [selectedSession, setSelectedSession] = useState(null);
     // Helper functions
    useEffect(() => {
        // Refresh stats when MyStats is shown or activeUser changes
        if (activeUser !== "") {
            const fetchUserData = async (activeUser) => {
                const userDoc = doc(firestore, "patients", activeUser);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUser({
                        id: userData.ID,
                        age: userData.age,
                        createdAt: userData.createdAt,
                        email: userData.email,
                        patients: userData.patients || [],
                        hospital: userData.hospital,
                        name: userData.name,
                        role: userData.role,
                        gameResults: userData.gameResults || {},
                    });
                } else {
                    console.error("No such user document!");
                }
            };
            fetchUserData(activeUser);
        }
        // Only refresh when MyStats is the active component
    }, [activeUser, window.location.pathname]);
    // Ensure component refreshes every time it is opened by listening to route changes
    useEffect(() => {
        if (activeUser !== "") {
            const fetchUserData = async (activeUser) => {
                const userDoc = doc(firestore, "patients", activeUser);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUser({
                        id: userData.ID,
                        age: userData.age,
                        createdAt: userData.createdAt,
                        email: userData.email,
                        patients: userData.patients || [],
                        hospital: userData.hospital,
                        name: userData.name,
                        role: userData.role,
                        gameResults: userData.gameResults || {},
                    });
                } else {
                    console.error("No such user document!");
                }
            };
            fetchUserData(activeUser);
        }
    }, [activeUser]);

    // Optional: force refresh when component is mounted (covers navigation to this component)
    useEffect(() => {
        if (activeUser !== "") {
            const fetchUserData = async (activeUser) => {
                const userDoc = doc(firestore, "patients", activeUser);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUser({
                        id: userData.ID,
                        age: userData.age,
                        createdAt: userData.createdAt,
                        email: userData.email,
                        patients: userData.patients || [],
                        hospital: userData.hospital,
                        name: userData.name,
                        role: userData.role,
                        gameResults: userData.gameResults || {},
                    });
                }
            };
            fetchUserData(activeUser);
        }
        // eslint-disable-next-line
    }, []);

    const calculateCatch5Stats = (gamesBySession) => {
        const allGames = [];
        const chartData = [];
      
        Object.entries(gamesBySession).forEach(([sessionDate, games]) => {
          // Ensure games is an array before using filter
          const gamesArray = Array.isArray(games) ? games : [];
          const validGames = gamesArray.filter(g => g.averageReactionTime != null && !isNaN(g.averageReactionTime));
          const sessionAvg = validGames.reduce((sum, g) => sum + Number(g.averageReactionTime), 0) / validGames.length || 0;
      
          chartData.push({
            date: sessionDate,
            avgReaction: Number(sessionAvg.toFixed(2)),
          });
      
          allGames.push(...gamesArray);
        });
      
        const total = allGames.length;
        if (total === 0) return null;
      
        const validAll = allGames.filter(g => g.averageReactionTime != null && !isNaN(g.averageReactionTime));
        const sumReaction = validAll.reduce((sum, g) => sum + Number(g.averageReactionTime), 0);
        const correct = allGames.reduce((sum, g) => sum + (g.correctClicks || 0), 0);
        const misses = allGames.reduce((sum, g) => sum + (g.missClicks || 0), 0);
      
        return {
          averageReaction: (sumReaction / validAll.length).toFixed(2),
          totalCorrect: correct,
          totalMisses: misses,
          avgCorrectPerGame: (correct / total).toFixed(2),
          chartData
        };
      };
    
 const catch5GamesBySession = {};
Object.entries(user?.gameResults || {}).forEach(([date, session]) => {
  if (session.Catch5Game) {
    catch5GamesBySession[date] = session.Catch5Game;
  }
});

                                                          



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
  
    return (
        <div>
                <div className="summary-table text-center">
                    <h3>סיכום תוצאות משחקים</h3>
                    {user?.gameResults ? (
                        <div>
                            
                            <button
                                onClick={() => setSelectedSession('all')}
                                className={selectedSession === 'all' ? 'active' : ''}
                            >
                                כל התאריכים
                            </button>
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
                                            {session.replace('Session (', '').replace(')', '')}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {selectedSession && (
                                <div>
                                    
                                    {(() => {
                                        // Check if there are any game results
                                        const hasAnyGameResults = user?.gameResults && 
                                            Object.values(user.gameResults).some(session => 
                                                ['QuickMemoryGame', 'Catch5Game', 'ColorShadeGame', 'SaccadeClockGame', 'ScanningGame']
                                                .some(gameType => session[gameType] && session[gameType].length > 0)
                                            );
                                        
                                        if (!hasAnyGameResults) {
                                            return <div className="no-stats">לא קיימות סטטיסטיקות למשתמש זה.</div>;


                                        }
                                        
                                        return (
                                            <>
                                                
                                               
                                            </>
                                        );
                                    })()}
                                    {(() => {
                                        const sessions = selectedSession === 'all' 
                                            ? Object.values(user.gameResults)
                                            : [user.gameResults[selectedSession]];
                                        
                                        const allQuickMemoryGames = sessions.flatMap(s => s.QuickMemoryGame || []);
                                        const allCatch5Games = sessions.flatMap(s => s.Catch5Game || []);
                                        const allColorShadeGames = sessions.flatMap(s => s.ColorShadeGame || []);
                                        const allSaccadeClockGames = sessions.flatMap(s => s.SaccadeClockGame || []);
                                        const allScanningGames = sessions.flatMap(s => s.ScanningGame || []);
                                    
                                        // Define hasAnyGameResults here
                                        const hasAnyGameResults = allQuickMemoryGames.length > 0 || 
                                            allCatch5Games.length > 0 || 
                                            allColorShadeGames.length > 0 || 
                                            allSaccadeClockGames.length > 0 || 
                                            allScanningGames.length > 0;
                                            
                                        return (
                                            <>
                                            {hasAnyGameResults && ( 
                                                <>
                                                 <h3>המשחקים ששיחקת </h3>
                                                <BasicPie QuickMemoryGame={allQuickMemoryGames.length} Catch5Game={allCatch5Games.length}
                                                ColorShadeGame={allColorShadeGames.length} SaccadeClockGame={allSaccadeClockGames.length} ScanningGame={allScanningGames.length}
                                                />
                                                </>
                                            )}
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
                                                            const stats = calculateCatch5Stats(catch5GamesBySession);
                                                            return (stats && (
                                                                <div className="game-summary">
                                                                    <p>⏱ זמן תגובה ממוצע כולל: {stats.averageReaction}ms</p>
                                                                    <p>✔️ סך לחיצות נכונות: {stats.totalCorrect}</p>
                                                                    <p>❌ סך לחיצות שגויות: {stats.totalMisses}</p>
                                                                    <p>💡 ממוצע לחיצות נכונות למשחק: {stats.avgCorrectPerGame}</p>
                                                                    {/*selectedSession === 'all' && (
                                                                        <Catch5LineChart chartData={stats.chartData} />
                                                                    )*/}
                                                                </div>
                                                            ));
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
                                                                    <th>מספר אובייקטים</th>
                                                                    <th>גודל אובייקט</th>
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
                        <div>
                          
                        </div>
                    )}
                </div>
            
        </div>
    );
};

export default MyStats;
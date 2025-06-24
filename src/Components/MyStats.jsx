import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  firestore,
  doc,
  getDoc,
  setDoc,
} from "../firebase.js";
import BasicPie from "./StatisticsCopmonents/PieChart.jsx";
const MyStats = ({  activeUser }) => {
  const [user, setUser] = useState(null);

  const fetchUserData = async (userId) => {
    if (!userId) return;
    
    const userDoc = doc(firestore, "users", userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setUser({
        id: userData.ID,
        age: userData.age,
        createdAt: userData.createdAt,
        email: userData.email,
        patients: userData.patients || [],
        name: userData.name,
        role: userData.role,
        gameResults: userData.gameResults || {},
        department: userData.department || null,
      });
    } else {
      console.error("No such user document!");
    }
  };

  useEffect(() => {
    fetchUserData(activeUser);
    
    // Set up auth state listener
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
      fetchUserData(authUser.uid);
      } else {
      setUser(null);
      }
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [activeUser]);

  const [selectedSession, setSelectedSession] = useState("all");


  const fetchActiveUserData = async (userId) => {
    if (!userId) return;
    
    const userDoc = doc(firestore, "patients", userId);
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

  // Refresh when activeUser changes
  useEffect(() => {
    fetchActiveUserData(activeUser);
  }, [activeUser]);

  // Optional: force refresh on component mount
  useEffect(() => {
    fetchActiveUserData(activeUser);
    // eslint-disable-next-line
  }, []);
  
  // Refresh when activeUser changes
  useEffect(() => {
    fetchActiveUserData(activeUser);
  }, [activeUser, fetchUserData]);

  // Optional: force refresh on component mount
  useEffect(() => {
    fetchUserData(activeUser);
    // eslint-disable-next-line
  }, []);
  // Helper function to calculate SaccadeClock game statistics
  const calculateSaccadeClockStats = (games) => {
    const total = games.length;
    if (total === 0) return null;

    const correctAnswers = games.filter(g => g.isCorrect).length;
    const avgResponseTime = (
      games.reduce((sum, g) => sum + (g.timeTaken || 0), 0) / total
    ).toFixed(2);
    
    const accuracyRate = total ? ((correctAnswers / total) * 100).toFixed(1) : "N/A";
    
    // Count occurrences of each symbol type
    const symbolTypes = games.reduce((acc, g) => {
      acc[g.symbolSetType] = (acc[g.symbolSetType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalGames: total,
      correctAnswers,
      incorrectAnswers: total - correctAnswers,
      avgResponseTime,
      accuracyRate,
      symbolTypes,
    };
  };

  // Helper function to calculate Scanning game statistics
  const calculateScanningStats = (games) => {
    const total = games.length;
    if (total === 0) return null;
    
    const totalTargets = games.reduce((sum, g) => sum + (g.totalTargets || 0), 0);
    const correctDetections = games.reduce((sum, g) => sum + (g.correctDetections || 0), 0);
    
    const detectionRate = totalTargets ? ((correctDetections / totalTargets) * 100).toFixed(1) : "N/A";
    
    const avgFontSize = (
      games.reduce((sum, g) => sum + (parseInt(g.fontSize) || 0), 0) / total
    ).toFixed(1);

    // Make sure to only include games with valid reaction times
    const gamesWithValidReactionTime = games.filter(g => 
      g.averageReactionTime !== null && 
      g.averageReactionTime !== undefined && 
      !isNaN(g.averageReactionTime)
    );
    
    // Calculate average reaction time only from valid entries
    const avgReactionTime = gamesWithValidReactionTime.length > 0 
      ? (gamesWithValidReactionTime.reduce((sum, g) => sum + Number(g.averageReactionTime), 0) / 
       gamesWithValidReactionTime.length).toFixed(2)
      : "N/A";
    
    return {
      totalGames: total,
      avgReactionTime,
      totalTargets,
      correctDetections,
      detectionRate,
      avgFontSize,
    };
  };

  // Helper function to calculate QuickMemory game statistics
  const calculateQuickMemoryStats = (games) => {
    const total = games.length;
    if (total === 0) return null;

    const correctAnswers = games.filter(g => g.isCorrect).length;
    const accuracyRate = ((correctAnswers / total) * 100).toFixed(1);
    
    const avgDifficulty = (
      games.reduce((sum, g) => sum + (g.difficulty || 0), 0) / total
    ).toFixed(1);

    return {
      totalGames: total,
      correctAnswers,
      incorrectAnswers: total - correctAnswers,
      accuracyRate,
      avgDifficulty,
    };
  };
  const calculateCatch5Stats = (gamesBySession) => {
    const allGames = [];
    const chartData = [];

    Object.entries(gamesBySession).forEach(([sessionDate, games]) => {
      // Ensure games is an array before using filter
      const gamesArray = Array.isArray(games) ? games : [];
      const validGames = gamesArray.filter(
        (g) => g.averageReactionTime != null && !isNaN(g.averageReactionTime)
      );
      const sessionAvg =
        validGames.reduce((sum, g) => sum + Number(g.averageReactionTime), 0) /
          validGames.length || 0;

      chartData.push({
        date: sessionDate,
        avgReaction: Number(sessionAvg.toFixed(2)),
      });

      allGames.push(...gamesArray);
    });

    const total = allGames.length;
    if (total === 0) return null;

    const validAll = allGames.filter(
      (g) => g.averageReactionTime != null && !isNaN(g.averageReactionTime)
    );
    const sumReaction = validAll.reduce(
      (sum, g) => sum + Number(g.averageReactionTime),
      0
    );
    const correct = allGames.reduce(
      (sum, g) => sum + (g.correctClicks || 0),
      0
    );
    const misses = allGames.reduce((sum, g) => sum + (g.missClicks || 0), 0);

    return {
      averageReaction: (sumReaction / validAll.length).toFixed(2),
      totalCorrect: correct,
      totalMisses: misses,
      avgCorrectPerGame: (correct / total).toFixed(2),
      chartData,
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
    const incorrect = games.reduce(
      (sum, g) => sum + (g.incorrectAnswers || 0),
      0
    );
    const totalAnswers = correct + incorrect;
    const avgDifficulty = (
      games.reduce((sum, g) => sum + (g.difficulty || 0), 0) / total
    ).toFixed(1);

    return {
      totalCorrect: correct,
      totalIncorrect: incorrect,
      accuracy: totalAnswers
        ? ((correct / totalAnswers) * 100).toFixed(1)
        : "N/A",
      avgDifficulty: avgDifficulty,
    };
  };

  return (
    <div className="stats_main">
      <div className="summary-table text-center">
        <h1>סיכום תוצאות משחקים</h1>
        {user?.gameResults ? (
          <div>
            <label htmlFor="session-select"></label>
            <select
              id="session-select"
              value={selectedSession || ""}
              onChange={(e) => setSelectedSession(e.target.value)}
              style={{ minWidth: 180, margin: "10px" }}
            >
              <option value="all">כל התאריכים</option>
              {Object.keys(user.gameResults).map((session) => (
                <option key={session} value={session}>
                  {session.replace("Session (", "").replace(")", "")}
                </option>
              ))}
            </select>

            {selectedSession && (
              <div>
                {(() => {
                  const hasAnyGameResults =
                    user?.gameResults &&
                    Object.values(user.gameResults).some((session) =>
                      [
                        "QuickMemoryGame",
                        "Catch5Game",
                        "ColorShadeGame",
                        "SaccadeClockGame",
                        "ScanningGame",
                      ].some(
                        (gameType) =>
                          session[gameType] && session[gameType].length > 0
                      )
                    );

                  if (!hasAnyGameResults) {
                    return (
                      <div className="no-stats">
                        לא קיימות סטטיסטיקות למשתמש זה.
                      </div>
                    );
                  }

                  return <></>;
                })()}
                {(() => {
                  const sessions =
                    selectedSession === "all"
                      ? Object.values(user.gameResults)
                      : [user.gameResults[selectedSession]];

                  const allQuickMemoryGames = sessions.flatMap(
                    (s) => s.QuickMemoryGame || []
                  );
                  const allCatch5Games = sessions.flatMap(
                    (s) => s.Catch5Game || []
                  );
                  const allColorShadeGames = sessions.flatMap(
                    (s) => s.ColorShadeGame || []
                  );
                  const allSaccadeClockGames = sessions.flatMap(
                    (s) => s.SaccadeClockGame || []
                  );
                  const allScanningGames = sessions.flatMap(
                    (s) => s.ScanningGame || []
                  );

                  const hasAnyGameResults =
                    allQuickMemoryGames.length > 0 ||
                    allCatch5Games.length > 0 ||
                    allColorShadeGames.length > 0 ||
                    allSaccadeClockGames.length > 0 ||
                    allScanningGames.length > 0;

                  return (
                    <>
                      {hasAnyGameResults && (
                        <>
                          <h3>המשחקים ששיחקת </h3>
                          <BasicPie
                            QuickMemoryGame={allQuickMemoryGames.length}
                            Catch5Game={allCatch5Games.length}
                            ColorShadeGame={allColorShadeGames.length}
                            SaccadeClockGame={allSaccadeClockGames.length}
                            ScanningGame={allScanningGames.length}
                          />
                        </>
                      )}
                      {allQuickMemoryGames.length > 0 && (
                        <div>
                          <h2>תוצאות משחק זיכרון מהיר:</h2>
                          {(() => {
                            const stats = calculateQuickMemoryStats(allQuickMemoryGames);
                            return (
                              stats && (
                              <div className="game-summary">
                                <ul>
                                <li>
                                  <i className="fa-solid fa-square-check" style={{ color: "#8ec356" }}></i> תשובות נכונות: {stats.correctAnswers} ({stats.accuracyRate}%)
                                </li>
                                <li>
                                  <i className="fa-solid fa-rectangle-xmark" style={{ color: "#d57979" }}></i> תשובות שגויות: {stats.incorrectAnswers}
                                </li>
                                <li>
                                  <i className="fa-solid fa-chart-simple"></i> רמת קושי ממוצעת: {stats.avgDifficulty}
                                </li>
                                <li>
                                  <i className="fa-solid fa-list-ol"></i> סך משחקים: {stats.totalGames}
                                </li>
                              </ul>
                            </div>
                            )
                          );
                          })()}
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
                                <td>{game.difficulty}</td>
                                <td>{game.fontSize}</td>
                                <td>{game.spacing}</td>
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
                            const stats =
                              calculateCatch5Stats(catch5GamesBySession);
                            return (
                              stats && (
                                <div className="game-summary">
                                  <ul>
                                    <li>
                                      <i class="fa-solid fa-stopwatch"></i> זמן
                                      תגובה ממוצע כולל: {stats.averageReaction}
                                      ms
                                    </li>
                                    <li>
                                      <i
                                        class="fa-solid fa-arrow-pointer"
                                        style={{ color: "#8ec356" }}
                                      ></i>{" "}
                                      סך לחיצות נכונות: {stats.totalCorrect}
                                    </li>
                                    <li>
                                      <i
                                        class="fa-solid fa-arrow-pointer"
                                        style={{ color: "#d57979" }}
                                      ></i>{" "}
                                      סך לחיצות שגויות: {stats.totalMisses}
                                    </li>
                                    <li>
                                      <i class="fa-solid fa-arrow-pointer"></i>{" "}
                                      ממוצע לחיצות נכונות למשחק:{" "}
                                      {stats.avgCorrectPerGame}
                                    </li>
                                    {/*selectedSession === 'all' && (
                                                                        <Catch5LineChart chartData={stats.chartData} />
                                                                    )*/}
                                  </ul>
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
                      {allSaccadeClockGames.length > 0 && (
                        <div>
                          <h2>תוצאות משחק שעון סקאדות:</h2>
                          {(() => {
                            const stats = calculateSaccadeClockStats(allSaccadeClockGames);
                            return (
                              stats && (
                                <div className="game-summary">
                                  <ul>
                                    <li>
                                      <i className="fa-solid fa-stopwatch"></i> זמן תגובה ממוצע: {stats.avgResponseTime}ms
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-square-check" style={{ color: "#8ec356" }}></i> תשובות נכונות: {stats.correctAnswers} ({stats.accuracyRate}%)
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-rectangle-xmark" style={{ color: "#d57979" }}></i> תשובות שגויות: {stats.incorrectAnswers}
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-list-ol"></i> סך משחקים: {stats.totalGames}
                                    </li>
                                  </ul>
                                </div>
                              )
                            );
                          })()}
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

                      {allScanningGames.length > 0 && (
                        <div>
                          <h2>תוצאות משחק סריקה:</h2>
                          {(() => {
                            const stats = calculateScanningStats(allScanningGames);
                            return (
                              stats && (
                                <div className="game-summary">
                                  <ul>
                                    <li>
                                      <i className="fa-solid fa-stopwatch"></i> זמן תגובה ממוצע: {stats.avgReactionTime}ms
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-bullseye" style={{ color: "#8ec356" }}></i> זיהויים נכונים: {stats.correctDetections} מתוך {stats.totalTargets} ({stats.detectionRate}%)
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-text-height"></i> גודל גופן ממוצע: {stats.avgFontSize}
                                    </li>
                                    <li>
                                      <i className="fa-solid fa-list-ol"></i> סך משחקים: {stats.totalGames}
                                    </li>
                                  </ul>
                                </div>
                              )
                            );
                          })()}
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
                      {allColorShadeGames.length > 0 && (
                        <div>
                          <h2>תוצאות משחק ColorShade:</h2>
                          {(() => {
                            const stats =
                              calculateColorShadeStats(allColorShadeGames);
                            return (
                              stats && (
                                <div className="game-summary">
                                  <ul>
                                    <li>
                                      <i
                                        class="fa-solid fa-square-check"
                                        style={{ color: "#8ec356" }}
                                      ></i>{" "}
                                      סך תשובות נכונות: {stats.totalCorrect}
                                    </li>
                                    <li>
                                      <i
                                        class="fa-solid fa-rectangle-xmark"
                                        style={{ color: "#d57979" }}
                                      ></i>{" "}
                                      סך תשובות שגויות: {stats.totalIncorrect}
                                    </li>
                                    <li>
                                      <i class="fa-solid fa-bullseye"></i> דיוק
                                      ממוצע: {stats.accuracy}%
                                    </li>
                                    <li>
                                      <i class="fa-solid fa-chart-simple"></i>{" "}
                                      ממוצע רמת קושי: {stats.avgDifficulty}
                                    </li>
                                  </ul>
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

                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default MyStats;

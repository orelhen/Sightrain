import React, { useEffect, useState, useRef } from "react";
import '../css/GamesCss/Games.scss';
import { getAuth, firestore, doc, getDoc, setDoc } from '../firebase.js';
import AlertDialog from '../Components/Alert';

const Catch5Game = ({ activeUser }) => {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [missClicks, setMissClicks] = useState(0);
  const [timesFiveShown, setTimesFiveShown] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [boxSize, setBoxSize] = useState(300);
  const [numberSpeed, setNumberSpeed] = useState(1000);
  const [boxPosition, setBoxPosition] = useState("center");
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Enhancements
  const [numberFontSize, setNumberFontSize] = useState(100);
  const [numberColor, setNumberColor] = useState("black");
  const [boxBackground, setBoxBackground] = useState("white");
  const [reactionWindow, setReactionWindow] = useState(500);
  const [gameDuration, setGameDuration] = useState(15000);
  const [inputMethod, setInputMethod] = useState("keyboard");

  const timerRef = useRef(null);

  
/*
  const pauseGame = () => setIsGamePaused(true);
  const resumeGame = () => setIsGamePaused(false);
  const exitToMenu = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameRunning(false);
    setGameEnd(false);
    setIsGamePaused(false);
    setTimeRemaining(gameDuration);
  };
*/
  const saveResultsToDatabase = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!activeUser && !currentUser) {
        setMessage("אנא התחבר כדי לשמור את התוצאות שלך");
        setShowAlert(true);
        return;
      }

      const sessionKey = `Session (${new Date().toLocaleDateString()})`;
      const gameData = {
        correctClicks,
        missClicks,
        timesFiveShown,
        reactionTimes,
        averageReactionTime: reactionTimes.length > 0
          ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)
          : null,
        boxPosition,
        difficulty: numberSpeed,
        boxSize,
        numberFontSize,
        numberColor,
        boxBackground,
        reactionWindow,
        gameDuration,
        inputMethod,
        timestamp: new Date().toISOString()
      };

      if (activeUser) {
        const patientDoc = doc(firestore, "patients", activeUser);
        const patientSnapshot = await getDoc(patientDoc);
        if (!patientSnapshot.exists()) await setDoc(patientDoc, { gameResults: {} });
        const patientData = patientSnapshot.exists() ? patientSnapshot.data() : { gameResults: {} };
        const existingGames = patientData.gameResults?.[sessionKey]?.["Catch5Game"] || [];
        const patientResults = {
          gameResults: {
            ...patientData.gameResults,
            [sessionKey]: {
              ...(patientData.gameResults?.[sessionKey] || {}),
              "Catch5Game": [...existingGames, gameData]
            }
          }
        };
        await setDoc(patientDoc, patientResults, { merge: true });
      } else if (currentUser) {
        const userDoc = doc(firestore, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const existingResults = userData.gameResults?.[sessionKey]?.Catch5Game || [];
          const userResults = {
            gameResults: {
              ...userData.gameResults,
              [sessionKey]: {
                ...(userData.gameResults?.[sessionKey] || {}),
                "Catch5Game": [...existingResults, gameData]
              }
            }
          };
          await setDoc(userDoc, userResults, { merge: true });
        }
      }

      setIsGameRunning(false);
      setGameEnd(false);
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (inputMethod === "keyboard" && event.code === "Space" && isGameRunning) {
        handleClick();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameRunning, currentNumber, inputMethod]);

  useEffect(() => {
    let interval;
    let lastNumber = null;
    if (isGameRunning && !gameEnd) {
      interval = setInterval(() => {
        let randomNum;
        do {
          randomNum = Math.floor(Math.random() * 10);
        } while (randomNum === lastNumber);
        lastNumber = randomNum;
        if (!isGamePaused) setCurrentNumber(randomNum);

        if (randomNum === 5) {
          setStartTime(Date.now());
          setTimesFiveShown((prev) => prev + 1);
          setTimeout(() => {
            if (currentNumber === 5) {
              setCurrentNumber(0);
            }
          }, reactionWindow);
        }
      }, numberSpeed);
    }
    return () => interval && clearInterval(interval);
  }, [isGameRunning, numberSpeed, currentNumber, gameEnd]);

  const [timeRemaining, setTimeRemaining] = useState(gameDuration);

  const handleStartGame = () => {
    setIsGameRunning(true);
    setGameEnd(false);
    setCorrectClicks(0);
    setMissClicks(0);
    setTimesFiveShown(0);
    setReactionTimes([]);
    setTimeRemaining(gameDuration);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (!isGamePaused) {
          if (prev <= 100) {
            clearInterval(timerRef.current);
            setIsGameRunning(false);
            setGameEnd(true);
            return 0;
          }
          return prev - 100;
        }
        return prev;
      });
    }, 100);
  };

  const handleClick = () => {
    if (currentNumber === 5 && startTime) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes((prev) => [...prev, reactionTime]);
      setCorrectClicks((prev) => prev + 1);
      setCurrentNumber(0);
    } else {
      setMissClicks((prev) => prev + 1);
    }
  };

  const positionStyles = {
    center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    "left-up": { top: "10%", left: "5%" },
    "left-down": { bottom: "5%", left: "5%" },
    "right-up": { top: "10%", right: "5%" },
    "right-down": { bottom: "5%", right: "5%" }
  };

  const gameBoxStyle = {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #000",
    fontWeight: "bold",
    backgroundColor: boxBackground,
    color: numberColor
  };

  // Define difficulty presets
  const difficultyPresets = [
    { name: "קל מאוד", numberSpeed: 1800, boxSize: 400, numberFontSize: 170, boxBackground: "white", numberColor: "black" },
    { name: "קל", numberSpeed: 1500, boxSize: 300, numberFontSize: 120, boxBackground: "white", numberColor: "black" },
    { name: "בינוני", numberSpeed: 1200, boxSize: 250, numberFontSize: 80, boxBackground: "white", numberColor: "black" },
    { name: "קשה", numberSpeed: 900, boxSize: 200, numberFontSize: 70, boxBackground: "white", numberColor: "black" },
    { name: "קשה מאוד", numberSpeed: 700, boxSize: 150, numberFontSize: 30, boxBackground: "white", numberColor: "black" }
  ];

  // Function to apply preset
  const applyPreset = (preset) => {
    setNumberSpeed(preset.numberSpeed);
    setBoxSize(preset.boxSize);
    setNumberFontSize(preset.numberFontSize);
    setBoxBackground(preset.boxBackground);
    setNumberColor(preset.numberColor);
  };

  return (
    <div className="game" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>תפסו את ה 5</h1>

      {!isGameRunning && !gameEnd && !isGamePaused && (
        <div>
          <div className="gamedesc">
            <h3>במשחק הזה, עליך ללחוץ על המקש ברגע שמופיע המספר 5!
              <br /> זמן התגובה שלך ימדד, והמשחק יימשך עד שתסיים את משך הזמן שנבחר.
              <br />ניתן לבחור את מיקום הקופסא ולשנות את רמת הקושי בכמה דרכים אך יש להשאיר את הראש מול מרכז המסך.
            </h3>
          </div>
          <div className="settings">
          <div className="presets">
                                <h4>בחר רמת קושי:</h4>
                                    {difficultyPresets.map((preset, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => applyPreset(preset)}
                                            className="preset-button"
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                            </div>
                            <div class="divider"></div>

            <div className="settings-controls">
              <h3>הגדרות משחק:</h3>
                <label>משך משחק:  {gameDuration / 1000} (שניות)</label>
                <input type="range" min="5000" max="60000" step="1000" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))} />
             
            
                <label>גודל הקופסא: {boxSize} פיקסלים</label>
                <input type="range" min="150" max="400" value={boxSize} onChange={(e) => setBoxSize(parseInt(e.target.value))} />
             
             
                <label>גודל המספר: {numberFontSize} פיקסלים</label>
                <input type="range" min="30" max="200" value={numberFontSize} onChange={(e) => setNumberFontSize(parseInt(e.target.value))} />
            
             
                <label>רמת קושי: {numberSpeed} מ"ש</label>
                <input type="range" min="600" max="2000" step="50" value={numberSpeed} onChange={(e) => setNumberSpeed(parseInt(e.target.value))} />
                
                <label>מיקום הקופסא: 
                  <select value={boxPosition} onChange={(e) => setBoxPosition(e.target.value)}>
                    <option value="center">מרכז</option>
                    <option value="left-up">שמאל למעלה</option>
                    <option value="left-down">שמאל למטה</option>
                    <option value="right-up">ימין למעלה</option>
                    <option value="right-down">ימין למטה</option>
                  </select>
                </label>
              
                <label>שיטת קלט: 
                  <select value={inputMethod} onChange={(e) => setInputMethod(e.target.value)}>
                    <option value="keyboard">מקלדת (רווח)</option>
                    <option value="mouse">עכבר</option>
                  </select>
                </label>

                <label>צבע המספר: 
                  <select value={numberColor} onChange={(e) => setNumberColor(e.target.value)}>
                    <option value="black">שחור</option>
                    <option value="blue">כחול</option>
                    <option value="orange">כתום</option>
                    <option value="red">אדום</option>
                    <option value="white">לבן</option>
                    <option value="green">ירוק</option>
                    <option value="yellow">צהוב</option>
                  </select>
                </label>

                <label>צבע רקע:   
                  <select value={boxBackground} onChange={(e) => setBoxBackground(e.target.value)}>
                    <option value="white">לבן</option>
                    <option value="black">שחור</option>
                    <option value="gray">אפור</option>
                    <option value="blue">כחול</option>
                    <option value="navy">כחול כהה</option>
                    <option value="purple">סגול</option>
                    <option value="green">ירוק</option>
                  </select>
                </label>
           
          

           
            </div>
          </div>
          <button className='start_game' onClick={handleStartGame}>התחל משחק <i className="fa-solid fa-play"></i></button>
        </div>
      )}

      {isGameRunning && (
        <div>
          {inputMethod === 'mouse' ? (
            <h3>לחצו על המספר הקוביה עם העכבר כאשר מופיע המספר 5</h3>
          ) : (
            <h3>לחצו על מקש הרווח כאשר מופיע המספר 5</h3>
          )}
        <div
          style={{
            ...gameBoxStyle,
            ...positionStyles[boxPosition],
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            fontSize: `${numberFontSize}px`,
            cursor: inputMethod === 'mouse' ? 'pointer' : 'default',
          }}
          onClick={inputMethod === 'mouse' ? handleClick : undefined}
        >
          <h2 style={{ fontSize: `${numberFontSize}px`}}>{currentNumber}</h2>
        </div>
        </div>
      )}

      {gameEnd && (
        <div className="results">
          <h2>המשחק נגמר!</h2>
          <p>כמות לחיצות: {correctClicks}</p>
          <p>פספוסים: {missClicks}</p>
          <p>המספר 5 הוצג: {timesFiveShown} פעמים</p>
          {reactionTimes.length > 0 && (
            <p>זמן תגובה ממוצע: {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)} מ"ש</p>
          )}
          {reactionTimes.length === 0 && <p>לא נקלטו לחיצות</p>}
          <button onClick={() => { setGameEnd(false); setIsGameRunning(false); }}>בחזרה לתפריט</button>
          <button onClick={handleStartGame}>שחק שוב</button>
          <button onClick={saveResultsToDatabase}>שמור תוצאות</button>
        </div>
      )}

      {showAlert && (
        <AlertDialog
          open={showAlert}
          title="דרוש משתמש מחובר"
          message={message}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default Catch5Game;
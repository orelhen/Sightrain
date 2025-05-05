import React, { useEffect, useState } from "react";
import '../css/GamesCss/Games.scss';

import { getAuth, firestore, doc, getDoc, setDoc, onAuthStateChanged } from '../firebase.js'; // Ensure Firebase is correctly configured and imported


const Catch5Game = ({activeUser}) => {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [missClicks, setMissClicks] = useState(0);
  const [timesFiveShown, setTimesFiveShown] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false); 
  // Sliders state
  const [boxSize, setBoxSize] = useState(300); 
  const [numberSpeed, setNumberSpeed] = useState(1000);
  // Box position state
  const [boxPosition, setBoxPosition] = useState("center");



  const pauseGame = () => {
    //setIsGamePaused(true); // Set the game to paused state
    // Keep the current state visible but paused
    // Don't set gameEnd to false to maintain the current game state
  }
  const resumeGame = () => {
    //setIsGamePaused(false); 
  }
  const exitToManu = () => {
   /* if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsGameRunning(false);
    setGameEnd(false);  
    setIsGamePaused(false); 
    setTimeRemaining(15000);*/
  };
  

  const saveResultsToDatabase = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (activeUser == "" && !currentUser) {
        alert("Please log in to save your results.");
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
        timestamp: new Date().toISOString()
      };
      if(activeUser!== "") {
      // Save to patient document
      const patientDoc = doc(firestore, "patients", activeUser);
      // If document doesn't exist, initialize it with empty gameResults
      const patientSnapshot = await getDoc(patientDoc);
      if (!patientSnapshot.exists()) {
        await setDoc(patientDoc, { gameResults: {} });
        console.log("Patient document created successfully!");
      }
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
      console.log("Patient results saved successfully!");
    }
    else{
      // Save to user document
     
      if (currentUser) {
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
          console.log("Results saved successfully!");
        }
      }
    }
      setIsGameRunning(false);
      setGameEnd(false);
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  const handleSaveResults = () => {
    saveResultsToDatabase();
  };


  useEffect(() => {
    let interval;
    let lastNumber = null; // To ensure no two consecutive numbers are the same
    let fiveCount = 0; // To track the number of times 5 appears
    
    // Only run the interval when the game is running and not paused
    if (isGameRunning && !gameEnd) {
     
      interval = setInterval(() => {
        let randomNum;
        do {
          randomNum = Math.floor(Math.random() * 10);
        } while (randomNum === lastNumber); // Ensure no two consecutive numbers are the same
        lastNumber = randomNum;
        if(!isGamePaused)
        setCurrentNumber(randomNum);

        if (randomNum === 5) {
          setStartTime(Date.now());
          setTimesFiveShown((prev) => prev + 1);
          fiveCount++;
          setTimeout(() => {
            if (currentNumber === 5) {
              setCurrentNumber(0);
            }
          }, Math.min(numberSpeed + 300, 500));
        }
      }, numberSpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning, numberSpeed, currentNumber, gameEnd]);


  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space" && isGameRunning) {
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameRunning, currentNumber]);


  // Timer state and ref at component level
  const [timeRemaining, setTimeRemaining] = useState(15000); // 15 seconds
  const timerRef = React.useRef(null);


  const handleStartGame = () => {
    setIsGameRunning(true);
    setGameEnd(false);
    setCorrectClicks(0);
    setMissClicks(0);
    setTimesFiveShown(0);
    setReactionTimes([]);
    setTimeRemaining(15000); // Reset timer
  
    if (timerRef.current) {
      clearInterval(timerRef.current); // Clear any existing timers
    }
  
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
        return prev; // Do not decrement time if paused
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
    "left-up": { top: "5%", left: "5%" },
    "left-down": { bottom: "5%", left: "5%" },
    "right-up": { top: "5%", right: "5%" },
    "right-down": { bottom: "5%", right: "5%" },
  };

  return (
    <div className="game" style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>תפסו את ה 5</h1>
            {/* 

            <div >
                      <button onClick={pauseGame}>
                        <i className="fa-solid fa-pause"></i> השהה
                      </button>
                      <button c onClick={resumeGame}>
                        <i className="fa-solid fa-play"></i> המשך
                      </button>
                      <button  onClick={exitToManu}>
                        <i className="fa-solid fa-arrow-left"></i> חזרה לתפריט
                      </button>
                    </div>



            */ }
                
      {!isGameRunning && !gameEnd && !isGamePaused && (
        <div>
         <div className="gamedesc">
         <h3>
         במשחק הזה, יהיו לך כמה מילישניות לזכור את המספרים שאתה רואה על המסך, כאשר הזמן נגמר הזן את המספרים שראית
         </h3>
         </div> 

        <div className="settings">
       
            <h3>הגדרות משחק:</h3>        
          <div style={sliderContainerStyle}>
            <label>
              <strong>גודל הקופסא: </strong>
              {boxSize}פיקסלים
            </label>
            <input
              type="range"
              min="100"
              max="400"
              value={boxSize}
              onChange={(e) => setBoxSize(parseInt(e.target.value))}
            />
          </div>
          <div style={sliderContainerStyle}>
            <label>
              <strong>רמת קושי: </strong>
              {numberSpeed}מ"ש 
            </label>
            <input
              type="range"
              min="600"
              max="2000"
              step="50"
              value={numberSpeed}
              onChange={(e) => setNumberSpeed(parseInt(e.target.value))}
            />
          </div>
         
          <div>
            <label>
              מיקום הקופסא:
              <select value={boxPosition} onChange={(e) => setBoxPosition(e.target.value)}>
                <option value="center">מרכז</option>
                <option value="left-up">שמאל למעלה</option>
                <option value="left-down">שמאל למטה</option>
                <option value="right-up">ימין למעלה</option>
                <option value="right-down">ימין למטה</option>
              </select>
            </label>
          </div>
         
        </div>
        <button className='start_game'  onClick={handleStartGame}>התחל משחק <i class="fa-solid fa-play"></i></button>

        </div>
      )}

      
      {isGameRunning && (
        <div style={{ ...gameBoxStyle, position: "absolute", ...positionStyles[boxPosition], width: `${boxSize}px`, height: `${boxSize}px`, fontSize: `${boxSize / 3}px` }}>
          <h2>{currentNumber}</h2>
        </div>
      )}

      {gameEnd && (
        <div className="results">
          <h2>המשחק נגמר!</h2>
          <p>כמות לחיצות: {correctClicks}</p>
          <p>פספוסים: {missClicks}</p>
          <p>המספר 5 הוצג: {timesFiveShown} פעמים</p>
          {reactionTimes.length > 0 && (
            <p>
              זמן תגובה ממוצע:{" "}
              {(
                reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
              ).toFixed(2)}{" "}
              מ"ש
            </p>
          )}
          {reactionTimes.length === 0 && <p>לא נקלטו לחיצות</p>}
          <button onClick={() => {setGameEnd(false);  setIsGameRunning(false);}}>שחק שוב</button>
          <button onClick={() => {handleSaveResults();}}>שמור תוצאות</button>
        </div>
      )}
    </div>
  );
};

const sliderContainerStyle = {
  margin: "10px 0",
};

const gameBoxStyle = {
  margin: "20px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "4px solid #000",
  fontWeight: "bold",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  margin: "10px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Catch5Game;

import React, { useEffect, useState } from "react";
import '../css/GamesCss/Games.scss';


const Catch5Game = () => {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [missClicks, setMissClicks] = useState(0);
  const [timesFiveShown, setTimesFiveShown] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);

  // Sliders state
  const [boxSize, setBoxSize] = useState(300); // Default size
  const [numberSpeed, setNumberSpeed] = useState(1000); // Default number speed

  // Beep sound state
  const [beepsound, setbeepsound] = useState(true);

  // Box position state
  const [boxPosition, setBoxPosition] = useState("center");

  const toggleBeep = () => {
    setbeepsound((prev) => !prev);
  };

  useEffect(() => {
    let interval;
    if (isGameRunning) {
      interval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 10);
        setCurrentNumber(randomNum);
        if (randomNum === 5) {
          if (beepsound) playBeep();
          setStartTime(Date.now());
          setTimesFiveShown((prev) => prev + 1);
          setTimeout(() => {
            if (currentNumber === 5) {
              setCurrentNumber(0);
            }
          }, Math.min(numberSpeed + 300, 500));
        }
      }, numberSpeed);
    }

    return () => clearInterval(interval);
  }, [isGameRunning, numberSpeed, currentNumber]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space" && isGameRunning) {
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameRunning, currentNumber]);

  const playBeep = () => {
    const audio = new Audio('/Sounds/beep.mp3'); 
    audio.play().catch((err) => console.error('Error playing audio:', err));
  };

  const handleStartGame = () => {
    setIsGameRunning(true);
    setGameEnd(false);
    setCorrectClicks(0);
    setMissClicks(0);
    setTimesFiveShown(0);
    setReactionTimes([]);
    setTimeout(() => {
      setIsGameRunning(false);
      setGameEnd(true);
    }, 15000);
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
      <h1>Catch5</h1>
      {!isGameRunning && (
        <div>
         <div className="gamedesc">
         <h3>
         במשחק הזה, יהיו לך כמה מיליסניות לזכור את המספרים שאתה רואה על המסך, כאשר הזמן נגמר הזן את המספרים שראית
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
              צפצוף:
              <input type="checkbox" checked={beepsound} onChange={toggleBeep} />
            </label>
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
          <button onClick={handleStartGame} >
            התחל משחק
          </button>
        </div>
        </div>
      )}

      
      {isGameRunning && (
        <div style={{ ...gameBoxStyle, position: "absolute", ...positionStyles[boxPosition], width: `${boxSize}px`, height: `${boxSize}px`, fontSize: `${boxSize / 3}px` }}>
          <h2>{currentNumber}</h2>
        </div>
      )}

      {gameEnd && (
        <div>
          <h2>המשחק נגמר!</h2>
          <p>כמות לחיצות: {correctClicks}</p>
          <p>פספוסים: {missClicks}</p>
          <p>המספר 5 הוצג: {timesFiveShown} פעמים</p>
          {reactionTimes.length > 0 && (
            <p>
              Average reaction time:{" "}
              {(
                reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
              ).toFixed(2)}{" "}
              ms
            </p>
          )}
          {reactionTimes.length === 0 && <p>לא נקלטו לחיצות</p>}
          <button onClick={handleStartGame} style={buttonStyle}>
            שחק שוב
          </button>
          <button onClick={handleStartGame} style={buttonStyle}>
            שמור תוצאות
          </button>
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
  border: "2px solid #000",
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

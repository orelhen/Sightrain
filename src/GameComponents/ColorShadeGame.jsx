import React, { useState, useEffect } from 'react';
import { getAuth, firestore, doc, getDoc, setDoc, onAuthStateChanged } from '../firebase.js'; // Ensure Firebase is correctly configured and imported


const ColorShadeGame = () => {
  const [balls, setBalls] = useState([]);
  const [targetBall, setTargetBall] = useState(null);
  const [score, setScore] = useState(0);
  const [ballCount, setBallCount] = useState(10);
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [color, setColor] = useState('blue'); // Default blue
  const [difficulty, setDifficulty] = useState(5); // Default difficulty (shade difference)
  const [ballSize, setBallSize] = useState(3); // Default ball size
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);

  const colors = {
    blue: ['#0080ff', '#007cff'],
    orange: ['#ff8000', '#ff7c00'],
    red: ['#ff0000', '#fc0000'],
    white: ['#ffffff', '#f0f0f0'],
  };

  // Function to generate balls with one target ball
  const generateBalls = () => {
    const newBalls = [];
    const targetIndex = Math.floor(Math.random() * ballCount);

    // Adjust the color difference based on difficulty
    const shadeAdjustment = (10 - difficulty) * 5; // More difficulty = less visible difference
    const [normalColor, baseTargetColor] = colors[color] || colors.blue;
    const targetColor = adjustShade(baseTargetColor, shadeAdjustment);

    for (let i = 0; i < ballCount; i++) {
      newBalls.push({
        id: i,
        x: Math.random() * 1400 + 50,
        y: Math.random() * 600 + 50,
        color: i === targetIndex ? targetColor : normalColor,
      });
    }
    setBalls(newBalls);
    setTargetBall(targetIndex);
  };

  // Function to darken a color based on difficulty
  const adjustShade = (color, amount) => {
    let num = parseInt(color.slice(1), 16);
    let r = Math.max(0, (num >> 16) - amount);
    let g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
    let b = Math.max(0, (num & 0x0000ff) - amount);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  // Function to start the game
  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    generateBalls();
  };

  // Function to handle ball selection
  const handleBallClick = (id) => {
    if (!isGameActive) return;
    const correct = id === targetBall;
    setFeedback(correct ? 'מצויין!' : 'נסו שוב!');
    if (correct) {
      setScore(score + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setIncorrectAnswers(incorrectAnswers + 1);
    }
    setTimeout(() => {
      setFeedback('');
      generateBalls();
    }, 1000);
  };

  // Function to finish the game
  const finishGame = () => {
    setIsGameActive(false);
  };


  const saveResultsToDatabase = async () => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userDoc = doc(firestore, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const sessionKey = `Session (${new Date().toLocaleDateString()})`;
            const updatedResults = {
              [sessionKey]: {
                "ColorShadeGame": [
                  ...(Array.isArray(userData.gameResults?.[sessionKey]?.ColorShadeGame) ? userData.gameResults[sessionKey].ColorShadeGame : []),
                  {
                    correctAnswers,
                    incorrectAnswers,
                    ballCount,
                    difficulty,
                    ballSize
                  }
                ]
              }
            };
            const mergedResults = userData.gameResults
              ? {
                  ...userData.gameResults,
                  [sessionKey]: {
                    ...(userData.gameResults[sessionKey] || {}),
                    "ColorShadeGame": updatedResults[sessionKey]["ColorShadeGame"]
                  }
                }
              : updatedResults;

            await setDoc(userDoc, { gameResults: mergedResults }, { merge: true });
            console.log("Results saved successfully!");
            setScore(0); // Reset score after saving
          } else {
            console.error("No such user document!");
          }
        } else {
          alert("אנא התחבר למשתמש על מנת לשמור נתונים.");
          console.error("No user is logged in!");
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };


  useEffect(() => {
    if (isGameActive) {
      generateBalls();
    }
  }, [isGameActive, ballCount, color, difficulty, ballSize]);

  useEffect(() => {
    if (score === 5) {
      finishGame();
    }
  }, [score]);

  return (
    <div className="game" style={styles.container}>
      <h2>משחק צבעים</h2>
      <div className="gamedesc">
        <h3>מצאו את הכדור הכהה יותר!</h3>
      </div>
      {!isGameActive && score === 0 && (
        <div className="settings" style={styles.settings}>
            <h3>הגדרות משחק:</h3>
               
          <label>
            כמות כדורים:
            <input
              type="range"
              min="5"
              max="25"
              value={ballCount}
              onChange={(e) => setBallCount(Number(e.target.value))}
              disabled={isGameActive} // Disable when game is active
            />
            {ballCount}
          </label>
          <label>
            צבע הכדור:
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isGameActive} // Disable when game is active
            >
              <option value="blue">כחול</option>
              <option value="orange">כתום</option>
              <option value="red">אדום</option>
              <option value="white">לבן</option>
            </select>
          </label>
          <label>
            רמת קושי :
            <input
              type="range"
              min="1"
              max="8"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              disabled={isGameActive} // Disable when game is active
            />
            {difficulty}
          </label>
          <label>
            גודל הכדור:
            <input
              type="range"
              min="2"
              max="5"
              value={ballSize}
              onChange={(e) => setBallSize(Number(e.target.value))}
              disabled={isGameActive} // Disable when game is active
            />
            {ballSize}
          </label>
        </div>
      )}

      {isGameActive && (
        <div style={styles.gameBox}>
          {balls.map((ball) => (
            <div
              key={ball.id}
              style={{
                ...styles.ball,
                left: ball.x,
                top: ball.y,
                backgroundColor: ball.color,
                width: `${ballSize * 20}px`,
                height: `${ballSize * 20}px`,
                border: '2px solid white', // Adding white border to each ball
              }}
              onClick={() => handleBallClick(ball.id)}
            />
          ))}
          <div style={styles.score}>תוצאה: {score}</div>
        </div>
      )}
      <div style={styles.feedback}>{feedback}</div>

      {!isGameActive && (
        <>
         <button className='start_game' onClick={startGame}>התחל משחק <i class="fa-solid fa-play"></i></button>

          {score > 0 && (
            <div className="results">
              <h2>המשחק נגמר! אלו הן התוצאות:</h2>
             
              <p>נכונים: {correctAnswers}</p>
              <p>שגויים: {incorrectAnswers}</p>
              <p>רמת קושי: {difficulty} מתוך 8</p>
              <p>כמות כדורים: {ballCount}</p>
              <p>גודל כדורים: {ballSize}</p>
              <p>כמות סיבובים: {correctAnswers + incorrectAnswers}</p>
              <button onClick={saveResultsToDatabase} style={styles.button}>שמור תוצאות</button>
            </div>
          )}
        </>
      )}

      {isGameActive && (
        <button onClick={finishGame} style={styles.button}>סיים משחק</button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  score: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: 'white',
  },
  feedback: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'green',
    marginBottom: '20px',
  },
  gameBox: {
    position: 'relative',
    width: '1500px',
    height: '700px',
    border: '4px solid #FFF',
    backgroundColor: 'black',
    marginBottom: '20px',
    overflow: 'hidden',

  },
  ball: {
    position: 'absolute',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  settings: {
    marginBottom: '20px',
  },
};

export default ColorShadeGame;

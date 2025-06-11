import React, { useState, useEffect } from 'react';
import { getAuth, firestore, doc, getDoc, setDoc } from '../firebase.js';
import '../css/GamesCss/Games.scss'; // Make sure to import the styles
import AlertDialog from '../Components/Alert';



const ColorShadeGame = ({activeUser, IsTest, onTestComplete}) => {

  const [balls, setBalls] = useState([]);
  const [targetBall, setTargetBall] = useState(null);
  const [score, setScore] = useState(0);
  const [ballCount, setBallCount] = useState(10);
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [color, setColor] = useState('blue');
  const [difficulty, setDifficulty] = useState(5);
  const [ballSize, setBallSize] = useState(3);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('black');
  const [shape, setShape] = useState('circle');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Test mode states
  const [isTestMode, setIsTestMode] = useState(IsTest);
  const [testLevel, setTestLevel] = useState(1);
  const [testComplete, setTestComplete] = useState(false);
  const [finalLevel, setFinalLevel] = useState(0);
  // Track test results for accuracy calculation
  const [testResults, setTestResults] = useState([]);


  const colors = {
    blue: ['#0080ff', '#007cff'],
    orange: ['#ff8000', '#ff7c00'],
    red: ['#ff0000', '#fc0000'],
    white: ['#ffffff', '#f0f0f0'],
    green: ['#00ff00', '#00fc00'],
    yellow: ['#ffff00', '#fcfc00'],
  };

  // Test mode configuration
  const testConfig = [
    { level: 1, difficulty: 1, ballCount: 5, ballSize: 5, color: 'blue', shape: 'circle' },
    { level: 2, difficulty: 2, ballCount: 7, ballSize: 4, color: 'blue', shape: 'square' },
    { level: 3, difficulty: 3, ballCount: 10, ballSize: 3.5, color: 'red', shape: 'circle' },
    { level: 4, difficulty: 4, ballCount: 12, ballSize: 3, color: 'green', shape: 'triangle' },
    { level: 5, difficulty: 5, ballCount: 14, ballSize: 2.5, color: 'orange', shape: 'square' },
    { level: 6, difficulty: 6, ballCount: 16, ballSize: 3, color: 'yellow', shape: 'star' },
    { level: 7, difficulty: 6, ballCount: 18, ballSize: 2, color: 'white', shape: 'circle' },
    { level: 8, difficulty: 7, ballCount: 20, ballSize: 1.8, color: 'blue', shape: 'triangle' },
    { level: 9, difficulty: 7, ballCount: 22, ballSize: 1.3, color: 'yellow', shape: 'square' },
    { level: 10, difficulty: 8, ballCount: 25, ballSize: 1, color: 'green', shape: 'star' },
  ];

  // Function to process the results for the test component
const processResults = (results, finalLevel, config) => {
  // Process the game results to return a simplified object
  // with the most important information for the test component
  return {
    finalLevel: finalLevel || 0,
    shadeDifference: 10 - config.difficulty, // Convert difficulty to a percentage difference
    tileSize: config.ballSize,
    colorName: config.color,
    ballCount: config.ballCount,
    shape: config.shape,
    accuracy: calculateAccuracy(results)
  };
};

// Function to calculate accuracy from results
const calculateAccuracy = (results) => {
  if (!results || results.length === 0) return 0;
  
  const correct = results.filter(result => result === true).length;
  return Math.round((correct / results.length) * 100);
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
    
    if (isTestMode) {
      setTestLevel(1);
      setTestComplete(false);
      setFinalLevel(0);
      // Apply first level configuration
      const config = testConfig[0];
      setDifficulty(config.difficulty);
      setBallCount(config.ballCount);
      setBallSize(config.ballSize);
      setColor(config.color);
    }
    
    generateBalls();
  };
  // Function to handle ball selection
  const handleBallClick = (id) => {
    if (!isGameActive) return;
    const correct = id === targetBall;
    setFeedback(correct ? 'מצויין!' : 'נסו שוב!');
    
    // Add to test results for accuracy calculation
    setTestResults(prevResults => [...prevResults, correct]);
    
    if (correct) {
      setScore(score + 1);
      setCorrectAnswers(correctAnswers + 1);
      
      if (isTestMode) {
        // Move to next level if available
        if (testLevel < testConfig.length) {
          const newTestLevel = testLevel + 1;
          setTestLevel(newTestLevel);
          
          // Apply next level configuration after the feedback timeout
          // This prevents immediate visual change of shape and size
          setTimeout(() => {
            if (newTestLevel <= testConfig.length) {
              const nextConfig = testConfig[newTestLevel - 1];
              setDifficulty(nextConfig.difficulty);
              setBallCount(nextConfig.ballCount);
              setBallSize(nextConfig.ballSize);
              setColor(nextConfig.color);
              setShape(nextConfig.shape);
            }
          }, 1000);
        } else {
          // Completed all test levels
          setFinalLevel(testLevel);
          setTestComplete(true);
          setIsGameActive(false);
          
          // Call onTestComplete with processed results
          if (onTestComplete) {
            const config = testConfig[testLevel - 1];
            onTestComplete(processResults(testResults, testLevel, config));
          }
        }
      }
    } else {
      setIncorrectAnswers(incorrectAnswers + 1);
      
      if (isTestMode) {
        // Test failed at current level
        setFinalLevel(testLevel - 1);
        setTestComplete(true);
        setIsGameActive(false);
        
        // Call onTestComplete with processed results
        if (onTestComplete) {
          const config = testConfig[Math.max(0, testLevel - 2)];
          onTestComplete(processResults(testResults, testLevel - 1, config));
        }
      }
    }
    
    setTimeout(() => {
      setFeedback('');
      if (isGameActive && (!isTestMode || (isTestMode && !testComplete))) {
        generateBalls();
      }
    }, 1000);
  };

  // Function to finish the game
  const finishGame = () => {
    setIsGameActive(false);
    setScore(0);
  };

  const saveResultsToDatabase = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (activeUser === "" && !currentUser) {
        setMessage("אנא התחבר כדי לשמור את התוצאות שלך"); 
        setShowAlert(true);
        return;
      }
      
      const sessionKey = `Session (${new Date().toLocaleDateString()})`;
      const gameData = {
        correctAnswers,
        incorrectAnswers,
        ballCount,
        difficulty,
        ballSize,
        color,
        timestamp: new Date().toISOString(),
        isTestMode,
        ...(isTestMode && { finalLevel }),
      };

      if (activeUser !== "") {
        // Save to patient document
        const patientDoc = doc(firestore, "patients", activeUser);
        // If document doesn't exist, initialize it with empty gameResults
        const patientSnapshot = await getDoc(patientDoc);
        if (!patientSnapshot.exists()) {
          await setDoc(patientDoc, { gameResults: {} });
          console.log("Patient document created successfully!");
        }
        
        const patientData = patientSnapshot.exists() ? patientSnapshot.data() : { gameResults: {} };
        const existingGames = patientData.gameResults?.[sessionKey]?.["ColorShadeGame"] || [];
        const patientResults = {
          gameResults: {
            ...patientData.gameResults,
            [sessionKey]: {
              ...(patientData.gameResults?.[sessionKey] || {}),
              "ColorShadeGame": [...existingGames, gameData]
            }
          }
        };
        
        await setDoc(patientDoc, patientResults, { merge: true });
        console.log("Patient results saved successfully!");
        setScore(0); // Reset score after saving
      } else {
        // Save to user document
        if (currentUser) {
          const userDoc = doc(firestore, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const existingResults = userData.gameResults?.[sessionKey]?.ColorShadeGame || [];
            
            const userResults = {
              gameResults: {
                ...userData.gameResults,
                [sessionKey]: {
                  ...(userData.gameResults?.[sessionKey] || {}),
                  "ColorShadeGame": [...existingResults, gameData]
                }
              }
            };
            
            await setDoc(userDoc, userResults, { merge: true });
            console.log("Results saved successfully!");
            setScore(0); // Reset score after saving
          }
        }
      }
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  useEffect(() => {
    if (isGameActive && !feedback) {
      generateBalls();
    }
  }, [isGameActive]);
  
  // Re-generate balls when game settings change, but only if not in the middle of showing feedback
  useEffect(() => {
    if (isGameActive && !feedback) {
      generateBalls();
    }
  }, [ballCount, color, difficulty, ballSize]);

  useEffect(() => {
    if (!isTestMode && score === 5) {
      setIsGameActive(false);
    }
  }, [score, isTestMode]);




// Define difficulty presets
const difficultyPresets = [
  { 
    name: "קל מאוד", 
    difficulty: 1, 
    ballCount: 5, 
    ballSize: 5, 
    color: 'blue',
    backgroundColor: 'black',
    shape: 'circle'
  },
  { 
    name: "קל", 
    difficulty: 3, 
    ballCount: 8, 
    ballSize: 4, 
    color: 'orange',
    backgroundColor: 'black',
    shape: 'circle'
  },
  { 
    name: "בינוני", 
    difficulty: 5, 
    ballCount: 12, 
    ballSize: 3, 
    color: 'green',
    backgroundColor: 'black', 
    shape: 'square'
  },
  { 
    name: "קשה", 
    difficulty: 6, 
    ballCount: 16, 
    ballSize: 2, 
    color: 'red',
    backgroundColor: 'gray',
    shape: 'triangle'
  },
  { 
    name: "קשה מאוד", 
    difficulty: 7, 
    ballCount: 22, 
    ballSize: 2, 
    color: 'white',
    backgroundColor: 'navy',
    shape: 'star'
  }
];

// Function to apply preset
const applyPreset = (preset) => {
  setDifficulty(preset.difficulty);
  setBallCount(preset.ballCount);
  setBallSize(preset.ballSize);
  setColor(preset.color);
  setBackgroundColor(preset.backgroundColor);
  setShape(preset.shape);
};

  return (
    <div className="game">
      <h2>משחק צבעים</h2>
      {!isGameActive &&( 
      <div className="gamedesc">
        <h3>
        במשחק זה יופיעו אובייקטים על המסך בצבע דומה. עליכם לאתר ולבחור את האובייקט הכהה ביותר מביניהם.
        <br/>ככל שרמת הקושי גבוהה יותר, כך ההבדל בין הצבעים יהיה קטן יותר ומאתגר יותר לזיהוי.
        <br/>ניתן לשנות את צבע האובייקטים, כמותם וגודלם בהגדרות המשחק.
        <br/>המטרה היא לאתר בהצלחה את האובייקט הכהה בכל סיבוב ולשפר את יכולת ההבחנה הויזואלית.
        <br/>השחק מסתיים לאחר 5 סיבובים, בהצלחה!
        </h3>
        

        {!IsTest && ( 
            <button onClick={() => { setIsTestMode((prev) => !prev); setScore(0); }}>
            {isTestMode ? 'שחק במשחק הרגיל' : 'שחק במבדק'} <i className="fa-regular fa-eye"></i>  
            </button>
          )}
      
      </div>)}

      {!isGameActive && score === 0 && !isTestMode && (
        <div className="settings">
          
          <div className="presets">
            <h4>בחר רמת קושי:</h4>
                {difficultyPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-button"
                    onClick={() => applyPreset(preset)}
                    disabled={isGameActive}
                  >
                    {preset.name}
                  </button>
                ))}
            </div>
            <div class="divider"></div>
        <div  className="settings-controls">
            <h3>הגדרות משחק:</h3>
            
            <label>רמת קושי:  {difficulty} </label>
              <input
                type="range"
                min="1"
                max="8"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                disabled={isGameActive}
              />
            
          
            <label>
              כמות אובייקטים:  {ballCount}
              </label>
              <input
                type="range"
                min="5"
                max="25"
                value={ballCount}
                onChange={(e) => setBallCount(Number(e.target.value))}
                disabled={isGameActive}
              />
            
              
            <label>
              גודל האובייקט:    {ballSize}
              </label>
              <input
                type="range"
                min="2"
                max="5"
                value={ballSize}
                onChange={(e) => setBallSize(Number(e.target.value))}
                disabled={isGameActive}
              />
          
            
            <label>
              צבע האובייקט:
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isGameActive}
              >
                <option value="blue">כחול</option>
                <option value="orange">כתום</option>
                <option value="red">אדום</option>
                <option value="white">לבן</option>
                <option value="green">ירוק</option>
                <option value="yellow">צהוב</option>
              </select>
            </label>
            
            <label>
              צבע רקע:
              <select
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={isGameActive}
              >
                <option value="black">שחור</option>
                <option value="gray">אפור</option>
                <option value="blue">כחול</option>
                <option value="navy">כחול כהה</option>
                <option value="purple">סגול</option>
                <option value="green">ירוק</option>
              </select>
            </label>
            
            <label>
              צורת האובייקט:
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                disabled={isGameActive}
              >
                <option value="circle">עיגול</option>
                <option value="square">ריבוע</option>
                <option value="triangle">משולש</option>
                <option value="star">כוכב</option>
              </select>
            </label>
            </div>
        </div>
      )}
      
      {!isGameActive && score === 0 && isTestMode && (
        <div className="test-mode-info">
          <h2>מצב מבדק</h2>
          <h3>המבדק יתחיל עם אובייקטים גדולים ורמה קלה ויהפוך לאתגר בהדרגה</h3>
          <h3>המבדק יכלול 10 רמות קושי שונות</h3>
          <h3>המבדק נועד לבדוק מה רמת הקושי המומלץ עבורך!</h3>
         
        </div>
      )}

      {isTestMode && isGameActive && (
        <div className="test-level-indicator">
          <h3>רמה {testLevel}/{testConfig.length}</h3>
        </div>
      )}

      {isGameActive && (
        <div style={{...styles.gameBox, backgroundColor: backgroundColor}}>
          {balls.map((ball) => (
            <div
              key={ball.id}
              style={{
                ...styles.ball,
                ...styles[shape],
                left: ball.x,
                top: ball.y,
                backgroundColor: ball.color,
                width: `${ballSize * 20}px`,
                height: `${ballSize * 20}px`,
                border: '2px solid black',
              }}
              onClick={() => handleBallClick(ball.id)}
            />
          ))}
          <div style={styles.score}>תוצאה: {score}</div>
        </div>
      )}
      {!isGameActive && score==0 &&(
      <button className='start_game' onClick={startGame}>
            {isTestMode ? 'התחל מבדק' : 'התחל משחק'} <i className="fa-solid fa-play"></i>
          </button>)}

      {!isGameActive &&(
        <>
          

          {(score > 0 ) && (
            <div className="results">
              <h2>המשחק נגמר! אלו הן התוצאות:</h2>
              
              {isTestMode && testComplete && (
                <div className="test-results">
                  <h3>
                    {finalLevel > 0 
                      ? `כל הכבוד! הגעת לרמה ${finalLevel} מתוך ${testConfig.length}` 
                      : 'נסה שוב את המבדק'}
                  </h3>
                </div>
              )}
              
              <p>נכונים: {correctAnswers}</p>
              <p>שגויים: {incorrectAnswers}</p>
              
              {isTestMode && testComplete && (
                <h3>אפשרויות המשחק המומלצות עבורך:</h3>
              )}
              {!isTestMode && <h3>אפשרויות המשחק:</h3>}
              
              <p>רמת קושי: {difficulty} מתוך 8</p>
              <p>כמות אובייקטים: {ballCount}</p>
              <p>גודל אובייקט: {ballSize}</p>
              <p>צבע: {color}</p>
              <p>כמות סיבובים: {correctAnswers + incorrectAnswers}</p>
              <button onClick={finishGame}>בחזרה לתפריט</button>
              <button onClick={startGame}>שחק שוב</button>
              <button onClick={saveResultsToDatabase}>שמור תוצאות</button>
            </div>
          )}
        </>
        
            
      )}
          {showAlert && (
                    <AlertDialog 
                      open={showAlert} 
                      title="דרוש משתמש מחובר"
                 message={message}
                 onClose={() => setShowAlert(false)}
                        />  )}
      {isGameActive && (
        <button onClick={finishGame}>סיים משחק</button>
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
    backgroundColor: 'black',
    marginBottom: '20px',
    overflow: 'hidden',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
  },
  ball: {
    position: 'absolute',
    cursor: 'pointer',
  },
  circle: {
    borderRadius: '50%',
  },
  square: {
    // No border radius for square
  },
  triangle: {
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  },
  star: {
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  },
  button: {
    padding: '10px 20px',
    fontSize: '18px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
};

export default ColorShadeGame;


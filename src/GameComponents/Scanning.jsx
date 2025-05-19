import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import AlertDialog from '../Components/Alert';

const symbolSets = {
  numbers: '0123456789'.split(''),
  letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  symbols: '!@#$%^&*'.split(''),
};

const ScanningGame = ({activeUser}) => {
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [stage, setStage] = useState('start');
  const [displayTime, setDisplayTime] = useState(1000);
  const [charactersPerRow, setCharactersPerRow] = useState(10);
  const [spacing, setSpacing] = useState(30);
  const [fontSize, setFontSize] = useState(30);
  const [symbolSetType, setSymbolSetType] = useState('symbols');
  const [scanDirection, setScanDirection] = useState('ltr');
  const [beepSound, setBeepSound] = useState(false);
  const [targetChar, setTargetChar] = useState('X');
  const [rows, setRows] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(-1);
  const [visibleChars, setVisibleChars] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [correctDetections, setCorrectDetections] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [user, setUser] = useState(null);
  const [numberOfLines, setNumberOfLines] = useState(5);
  
  // Test mode variables
  const [isTestMode, setIsTestMode] = useState(false);
  const [testLevel, setTestLevel] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [finalLevel, setFinalLevel] = useState(0);

  // Test configuration levels
  const testConfig = [
    { level: 1, charactersPerRow: 10, displayTime: 1500, spacing: 15, fontSize: 40, numberOfLines: 5, scanDirection: 'rtl', symbolSetType: 'numbers' },
    { level: 2, charactersPerRow: 10, displayTime: 1300, spacing: 15, fontSize: 38, numberOfLines: 5, scanDirection: 'ltr', symbolSetType: 'letters' },
    { level: 3, charactersPerRow: 12, displayTime: 1200, spacing: 17, fontSize: 36, numberOfLines: 5, scanDirection: 'rtl', symbolSetType: 'symbols' },
    { level: 4, charactersPerRow: 12, displayTime: 1100, spacing: 18, fontSize: 34, numberOfLines: 5, scanDirection: 'ltr', symbolSetType: 'numbers' },
    { level: 5, charactersPerRow: 14, displayTime: 1000, spacing: 20, fontSize: 32, numberOfLines: 6, scanDirection: 'rtl', symbolSetType: 'letters' },
    { level: 6, charactersPerRow: 15, displayTime: 900, spacing: 22, fontSize: 30, numberOfLines: 6, scanDirection: 'ltr', symbolSetType: 'symbols' },
    { level: 7, charactersPerRow: 16, displayTime: 800, spacing: 25, fontSize: 28, numberOfLines: 7, scanDirection: 'rtl', symbolSetType: 'numbers' },
    { level: 8, charactersPerRow: 18, displayTime: 700, spacing: 30, fontSize: 26, numberOfLines: 7, scanDirection: 'ltr', symbolSetType: 'letters' },
    { level: 9, charactersPerRow: 19, displayTime: 600, spacing: 35, fontSize: 24, numberOfLines: 8, scanDirection: 'rtl', symbolSetType: 'symbols' },
    { level: 10, charactersPerRow: 20, displayTime: 500, spacing: 40, fontSize: 22, numberOfLines: 8, scanDirection: 'ltr', symbolSetType: 'numbers' },
  ];

  const auth = getAuth();
  const charIntervalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Apply test configuration based on current level
  useEffect(() => {
    if (isTestMode && testLevel <= testConfig.length) {
      const config = testConfig[testLevel - 1];
      setCharactersPerRow(config.charactersPerRow);
      setDisplayTime(config.displayTime);
      setSpacing(config.spacing);
      setFontSize(config.fontSize);
      setNumberOfLines(config.numberOfLines);
      setScanDirection(config.scanDirection);
      setSymbolSetType(config.symbolSetType);
    }
  }, [testLevel, isTestMode]);

  const generateRow = () => {
    const symbols = symbolSets[symbolSetType];
    const row = [];
    const shouldIncludeTarget = Math.random() <= 0.5; // 50% chance of including target
    
    if (shouldIncludeTarget) {
      // Include target character at random position
      const targetPosition = Math.floor(Math.random() * charactersPerRow);
      for (let i = 0; i < charactersPerRow; i++) {
        if (i === targetPosition) {
          row.push(targetChar);
        } else {
          let randomChar;
          do {
            randomChar = symbols[Math.floor(Math.random() * symbols.length)];
          } while (randomChar === targetChar);
          row.push(randomChar);
        }
      }
    } else {
      // Don't include target character
      for (let i = 0; i < charactersPerRow; i++) {
        let randomChar;
        do {
          randomChar = symbols[Math.floor(Math.random() * symbols.length)];
        } while (randomChar === targetChar);
        row.push(randomChar);
      }
    }
    
    return row;
  };

  const revealRowCharacters = (row, rowIndex) => {
    let index = 0;
    const direction = scanDirection === 'ltr' ? 1 : -1;
    const initial = scanDirection === 'rtl' ? row.length - 1 : 0;

    const revealed = [...row].map(() => null); // Ensure fixed positions
    setVisibleChars((prev) => [...prev, revealed]);

    charIntervalRef.current = setInterval(() => {
      revealed[initial + index * direction] = row[initial + index * direction];
      setVisibleChars((prev) => {
        const updated = [...prev];
        updated[rowIndex] = [...revealed];
        return updated;
      });

      if (row[initial + index * direction] === targetChar) {
        setStartTime(Date.now());
      }

      index++;
      if (index >= row.length) {
        clearInterval(charIntervalRef.current);
        charIntervalRef.current = null;

        if (rowIndex + 1 < numberOfLines) {
          setTimeout(() => {
            showNextRow(rowIndex + 1);
          }, displayTime);
        } else {
          setTimeout(() => {
            setStage('results');
            setGameEnd(true);
          }, displayTime);
        }
      }
    }, displayTime / row.length);
  };

  const showNextRow = (index) => {
    const newRow = generateRow();
    setRows((prev) => [...prev, newRow]);
    setCurrentRowIndex(index);
    
    // Only increment totalTargets if the row contains the targetChar
    if (newRow.includes(targetChar)) {
      setTotalTargets((prev) => prev + 1);
    }
    
    revealRowCharacters(newRow, index);
  };


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && stage === 'play') {
        const now = Date.now();
        if (startTime) {
          const reactionTime = now - startTime;
          setReactionTimes((prev) => [...prev, reactionTime]);
          setCorrectDetections((prev) => prev + 1);
          setStartTime(null);
          
          if (isTestMode) {
            setCorrectAnswers((prev) => prev + 1);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stage, startTime, isTestMode]);

  // Handle test level progression
  useEffect(() => {
    if (isTestMode && gameEnd) {
      // If success rate is acceptable, move to next level
      const successRate = correctDetections / totalTargets;
      
      if (successRate >= 0.7 && testLevel < testConfig.length) {
        // Progress to next level
        setFinalLevel(testLevel);
        setTestLevel((prev) => prev + 1);
        // Reset for next level
        setTimeout(() => {
          setRows([]);
          setVisibleChars([]);
          setCurrentRowIndex(-1);
          setReactionTimes([]);
          setCorrectDetections(0);
          setTotalTargets(0);
          setGameEnd(false);
          setStartTime(null);
          setStage('play');
          showNextRow(0);
        }, 700);
      } else {
        // End test
        setFinalLevel(testLevel);
        setTestComplete(true);
          // Apply level 1 settings immediately
        const config = testConfig[0];
        setCharactersPerRow(config.charactersPerRow);
        setDisplayTime(config.displayTime);
        setSpacing(config.spacing);
        setFontSize(config.fontSize);
        setNumberOfLines(config.numberOfLines);
        setScanDirection(config.scanDirection);
        setSymbolSetType(config.symbolSetType);
      }
    }
  }, [gameEnd, isTestMode, correctDetections, totalTargets]);

  const saveResultsToDatabase = async () => {
    try {
      if (activeUser === "" && !user) {
        setMessage("אנא התחבר כדי לשמור את התוצאות שלך"); 
        setShowAlert(true);
        return;
      }
      
      const sessionKey = `Session (${new Date().toLocaleDateString()})`;
      const gameData = {
        correctDetections,
        totalTargets,
        reactionTimes,
        averageReactionTime: reactionTimes.length > 0
          ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(2)
          : null,
        displayTime,
        charactersPerRow,
        spacing,
        fontSize,
        symbolSetType,
        scanDirection,
        targetChar,
        numberOfLines,
        isTestMode,
        ...(isTestMode && { finalLevel, testLevel }),
        timestamp: new Date().toISOString()
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
        const existingGames = patientData.gameResults?.[sessionKey]?.["ScanningGame"] || [];
        const patientResults = {
          gameResults: {
            ...patientData.gameResults,
            [sessionKey]: {
              ...(patientData.gameResults?.[sessionKey] || {}),
              "ScanningGame": [...existingGames, gameData]
            }
          }
        };
        
        await setDoc(patientDoc, patientResults, { merge: true });
        console.log("Patient results saved successfully!");
        
        setStage('start')
      } else {
        // Save to user document
        if (user) {
          const userDoc = doc(firestore, "users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const existingResults = userData.gameResults?.[sessionKey]?.ScanningGame || [];
            
            const userResults = {
              gameResults: {
                ...userData.gameResults,
                [sessionKey]: {
                  ...(userData.gameResults?.[sessionKey] || {}),
                  "ScanningGame": [...existingResults, gameData]
                }
              }
            };
            
            await setDoc(userDoc, userResults, { merge: true });
            console.log("Results saved successfully!");
            
            setStage('start')
          }
        }
      }
    } catch (error) {
      console.error("Error saving results:", error);
      alert('Error saving results. Please try again.');
    }
  };

  // Ensure test settings are applied properly before starting the game
  const startGame = () => {
     // For test mode, reset to level 1 and apply level 1 settings immediately
     if (isTestMode) {
      setTestLevel(1);
      setCorrectAnswers(0);
      setTestComplete(false);
      setFinalLevel(0);
      
      // Apply level 1 settings immediately
      const config = testConfig[0];
      setCharactersPerRow(config.charactersPerRow);
      setDisplayTime(config.displayTime);
      setSpacing(config.spacing);
      setFontSize(config.fontSize);
      setNumberOfLines(config.numberOfLines);
      setScanDirection(config.scanDirection);
      setSymbolSetType(config.symbolSetType);
      // Give settings time to apply before starting the game
      setTimeout(() => {
        setStage('play');
        showNextRow(0);
      }, 100);
    } else {
      // For regular mode, start immediately
      setStage('play');
      showNextRow(0);
    }
    // Reset game state
    setRows([]);
    setVisibleChars([]);
    setCurrentRowIndex(-1);
    setReactionTimes([]);
    setCorrectDetections(0);
    setTotalTargets(0);
    setGameEnd(false);
    setStartTime(null);
  
  };


  // Define difficulty presets
  const difficultyPresets = [
    { 
      name: "קל מאוד", 
      displayTime: 2000, 
      charactersPerRow: 8, 
      spacing: 15, 
      fontSize: 42,
      numberOfLines: 4,
      symbolSetType: 'numbers',
      scanDirection: 'ltr'
    },
    { 
      name: "קל", 
      displayTime: 1500, 
      charactersPerRow: 10, 
      spacing: 20, 
      fontSize: 38,
      numberOfLines: 5,
      symbolSetType: 'numbers',
      scanDirection: 'ltr'
    },
    { 
      name: "בינוני", 
      displayTime: 1200, 
      charactersPerRow: 12, 
      spacing: 30, 
      fontSize: 34,
      numberOfLines: 5,
      symbolSetType: 'letters',
      scanDirection: 'rtl'
    },
    { 
      name: "קשה", 
      displayTime: 900, 
      charactersPerRow: 15, 
      spacing: 40, 
      fontSize: 30,
      numberOfLines: 6,
      symbolSetType: 'letters',
      scanDirection: 'ltr'
    },
    { 
      name: "קשה מאוד", 
      displayTime: 700, 
      charactersPerRow: 18, 
      spacing: 45, 
      fontSize: 26,
      numberOfLines: 8,
      symbolSetType: 'symbols',
      scanDirection: 'rtl'
    }
  ];

  // Function to apply preset
  const applyPreset = (preset) => {
    setDisplayTime(preset.displayTime);
    setCharactersPerRow(preset.charactersPerRow);
    setSpacing(preset.spacing);
    setFontSize(preset.fontSize);
    setNumberOfLines(preset.numberOfLines);
    setSymbolSetType(preset.symbolSetType);
    setScanDirection(preset.scanDirection);
  };

  return (
    <div className="game">
      {stage === 'start' && (
        <div>
          <h2>סריקה לרוחב</h2>
          <div className="gamedesc">
            <h3>
              משחק זה נועד לשפר את מהירות הסריקה החזותית, זיהוי דפוסים ותגובה מהירה.<br/>
              בכל סבב מופיעה שורת תווים, כאשר כל תו נחשף אחד אחרי השני, בהתאם לכיוון שנבחר (מימין לשמאל או משמאל לימין).<br/>
              המטרה היא לזהות תו מטרה שהוגדר מראש – ברגע שהמשתמש מזהה את התו, עליו ללחוץ על מקש הרווח במהירות האפשרית.<br/>
            </h3>
            <button onClick={() => setIsTestMode((prev) => !prev)}>
            {isTestMode ? 'שחק במשחק הרגיל' : 'שחק במבדק'} <i className="fa-regular fa-eye"></i>
          </button>
          </div>
          
        
          
          {!isTestMode && (
            <div className="settings">
         
              <div className="presets">
              <h4>בחר רמת קושי:</h4>
              {difficultyPresets.map((preset, index) => (
                <button 
                  key={index} 
                  className="preset-button" 
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div class="divider"></div>
            <div  className="settings-controls">
            <h3>הגדרות משחק:</h3>
              <label>
                זמן באלפיות שנייה: {displayTime}:
                <input
                  type="range"
                  min="500" 
                  max="2000"
                  step="50"
                  value={displayTime}
                  onChange={(e) => setDisplayTime(Number(e.target.value))}
                />
              </label>
              <label>
                מספר שורות: {numberOfLines}
                <input
                  type="range"
                  min="3"
                  max="25"
                  step="1"
                  value={numberOfLines}
                  onChange={(e) => setNumberOfLines(Number(e.target.value))}
                />
              </label>
              <label>
                מספר סמלים בכל שורה:{charactersPerRow}
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={charactersPerRow}
                  onChange={(e) => setCharactersPerRow(Number(e.target.value))}
                />
              </label>
              <label>
                רווח בין סמלים : {spacing}
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="1"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                />
              </label>
              <label>
                גודל הגופן: {fontSize}
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </label>
              <label>
                סוגי סמלים:
                <select
                  value={symbolSetType}
                  onChange={(e) => setSymbolSetType(e.target.value)}
                >
                  <option value="numbers">מספרים</option>
                  <option value="letters">אותיות</option>
                  <option value="symbols">סמלים</option>
                </select>
              </label>
              <label>
                כיוון סריקה:
                <select
                  value={scanDirection}
                  onChange={(e) => setScanDirection(e.target.value)}
                >
                  <option value="ltr">מימין לשמאל</option> 
                  <option value="rtl">משמאל לימין</option>
                </select>
              </label>
              <label>
                חפש את הסמל:
                <input
                  type="text"
                  maxLength="1"
                  value={targetChar}
                  onChange={(e) => setTargetChar(e.target.value)}
                />
              </label>
            </div>
            </div>
          )}
          
          {isTestMode && (
            <div className="test-mode-info">
              <h2>מצב מבדק</h2>
              <h3>המבדק יתחיל עם מהירות איטית יותר ומעט סימנים, והקושי יגבר בהדרגה</h3>
              <h3>המבדק יימשך עד 10 שלבים</h3>
              <h3>המבדק נועד לבדוק מה רמת הקושי המומלץ עבורך!</h3>
            </div>
          )}
          
          <button className='start_game' onClick={startGame}>
            {isTestMode ? 'התחל מבדק' : 'התחל משחק'} <i className="fa-solid fa-play"></i>
          </button>
        </div>
      )}

      {stage === 'play' && (
        <div className="game-area">
          <div className="target-display">
            <h3>לחץ על מקש הרווח בכל פעם שמופיע התו: <span>{targetChar}</span></h3>
            {isTestMode && <h3>רמה {testLevel}/{testConfig.length}</h3>}
          </div>
          {visibleChars.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '10px',
                filter: i < currentRowIndex ? 'blur(8px)' : 'none',
              }}
            >
              {row.map((char, j) => (
                <span
                  key={j}
                  style={{
                    display: 'inline-block',
                    width: `${fontSize * 0.6}px`,  
                    height: `${fontSize * 1.2}px`,
                    marginRight: `${spacing}px`,
                    fontSize: `${fontSize}px`,  
                    textAlign: 'center',
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {stage === 'results' && (!isTestMode || (isTestMode && testComplete)) && (
        <div className="results">
          <h2>תוצאות</h2>
          
          {isTestMode && testComplete && (
            <div className="test-results">
              <h3>כל הכבוד! הגעת לרמה {finalLevel} מתוך {testConfig.length}</h3>
              <p>תשובות נכונות: {correctAnswers}</p>
            </div>
          )}
          
          <p>התו :{targetChar} ,הוצג סך הכל {totalTargets} פעמים.</p>
          <p>כמות לחיצות נכונות: {correctDetections}</p>
          <p>
            זמן תגובה ממוצע:{' '}
            {reactionTimes.length > 0
              ? (
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                ).toFixed(2) + ' אלפיות שנייה'
              : 'לא נקלטו לחיצות'}
          </p>
          
          {isTestMode && testComplete && (<h3>אפשרויות המשחק המומלצות עבורך:</h3>)}
          {!isTestMode && <h3>אפשרויות המשחק:</h3>}
          <ul>
            <li>זמן תצוגה: {displayTime} מ"ש</li>
            <li>מספר שורות: {numberOfLines}</li>
            <li>סמלים בשורה: {charactersPerRow}</li>
            <li>רווח בין סמלים: {spacing}</li>
            <li>גודל הגופן: {fontSize}</li>
          </ul>
          <button onClick={() => setStage('start')}>בחזרה לתפריט</button>
          <button onClick={startGame}>שחק שוב</button>
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

export default ScanningGame;
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

  const auth = getAuth();
  const charIntervalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
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

  const startGame = () => {
    setStage('play');
    setRows([]);
    setVisibleChars([]);
    setCurrentRowIndex(-1);
    setReactionTimes([]);
    setCorrectDetections(0);
    setTotalTargets(0);
    setGameEnd(false);
    setStartTime(null);
    showNextRow(0);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && stage === 'play') {
        const now = Date.now();
        if (startTime) {
          const reactionTime = now - startTime;
          setReactionTimes((prev) => [...prev, reactionTime]);
          setCorrectDetections((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stage, startTime]);

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
        alert('Results saved successfully!');
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
            alert('Results saved successfully!');
          }
        }
      }
    } catch (error) {
      console.error("Error saving results:", error);
      alert('Error saving results. Please try again.');
    }
  };

  return (
    <div className="game">
      {stage === 'start' && (
        <div>
          <h2>סריקה</h2>
          <div className="gamedesc">
         <h3>
          <></>
         משחק זה נועד לשפר את מהירות הסריקה החזותית, זיהוי דפוסים ותגובה מהירה.<br/>
        בכל סבב מופיעה שורת תווים, כאשר כל תו נחשף אחד אחרי השני, בהתאם לכיוון שנבחר (מימין לשמאל או משמאל לימין).<br/>
        המטרה היא לזהות תו מטרה שהוגדר מראש – ברגע שהמשתמש מזהה את התו, עליו ללחוץ על מקש הרווח במהירות האפשרית.<br/>
         </h3>
         </div> 
          <div className="settings">
            <label>
            זמן באלפיות שנייה:  {displayTime}: 
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
                <option value="ltr"> מימין לשמאל</option> 
                <option value="rtl">משמאל לימין </option>
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
          
          <button className='start_game' onClick={startGame}>התחל משחק <i class="fa-solid fa-play"></i></button>
        </div>
      )}

      {stage === 'play' && (
        <div className="game-area">
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
                    width: `${fontSize * 0.6 }px`,  
                    height: `${fontSize* 1.2 }px`,
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

      {stage === 'results' && (
        <div className="results">
          <h2>תוצאות</h2>
          <p>התו :{targetChar} ,הוצג סך הכל  {totalTargets} פעמים.</p>
          <p>כמות לחיצות נכונות: {correctDetections}</p>
          <p>
            זמן תגובה ממוצע:{' '}
            {reactionTimes.length > 0
              ? (
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                ).toFixed(2) + ' אלפיות שנייה'
              : 'לא נקלטו לחיצות'}
          </p>
          <button onClick={() => setStage('start')}>שחק שוב</button>
          <button onClick={saveResultsToDatabase}>שמור תוצאות</button>
          
        </div>
        
      )}
      {showAlert && (
            <AlertDialog 
              open={showAlert} 
              title="דרוש משתמש מחובר"
         message={message}
         onClose={() => setShowAlert(false)}
                />  )}
    </div>
  );
};

export default ScanningGame;
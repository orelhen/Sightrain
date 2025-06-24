import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, doc, getDoc, setDoc, firestore } from '../firebase.js';
import ConfirmDialog from '../Components/ConfirmDialog.jsx'; 
import AlertDialog from '../Components/Alert';



const symbolSets = {
  numbers: '0123456789'.split(''),
  letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  symbols: '!@#$%^&*'.split('')
};

const SaccadeClockGame = ({activeUser}) => {
  const [stage, setStage] = useState('start');
  const [displayDuration, setDisplayDuration] = useState(1000);
  const [symbolSetType, setSymbolSetType] = useState('numbers');
  const [fontSize, setFontSize] = useState(3);
  const [beepSound, setBeepSound] = useState(true);
  const [startSide, setStartSide] = useState('left');
  const [currentSymbols, setCurrentSymbols] = useState([]);
  const [showIndex, setShowIndex] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState([]);
  const [inputReady, setInputReady] = useState(false);
  const [symbolLength, setSymbolLength] = useState(2); // Initialize with default value
  const [customHours, setCustomHours] = useState([9, 3]); // Initialize with default horizontal positions
  const inputRef = useRef(null);
  const roundStartTime = useRef(null);
  const auth = getAuth(); 
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [circleSize, setCircleSize] = useState(600); // Initialize with default value
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);



  useEffect(() => {
    if (stage === 'results') setInputReady(false);
  }, [stage]);

  const getRandomSymbol = () => {
    const set = symbolSets[symbolSetType];
    return set[Math.floor(Math.random() * set.length)];
  };

  const playBeep = () => {
    if (beepSound) {
      const audio = new Audio('/Sounds/beep.mp3');
      audio.play().catch(console.error);
    }
  };

  const startGame = () => {
    const symbols = Array.from({ length: symbolLength }, () => getRandomSymbol());
    setCurrentSymbols(symbols);
    setStage('play');
    let currentIndex = 0;
    const showNextSymbol = () => {
      if (currentIndex < symbolLength) {
      setShowIndex(currentIndex);
      playBeep();
      setTimeout(() => {
        currentIndex++;
        if (currentIndex < symbolLength) {
        showNextSymbol();
        } else {
        setShowIndex(null);
        setInputReady(true);
        inputRef.current?.focus();
        }
      }, displayDuration);
      }
    };

    roundStartTime.current = Date.now();
    setInputReady(false);
    showNextSymbol();
  };

  const handleInput = () => {
    const timeTaken = Date.now() - roundStartTime.current;
    const isCorrect = userInput === currentSymbols.join('');
    setResults(prev => [...prev, {
      shown: currentSymbols.join(''),
      input: userInput,
      isCorrect,
      timeTaken
    }]);
    setUserInput('');
    setStage('results');
  };

  useEffect(() => {
    if (stage === 'SaveResults') {
      const saveResults = async () => {
        try {
          const currentUser = auth.currentUser;
          if (activeUser === "" && !currentUser) {
            setMessage("אנא התחבר כדי לשמור את התוצאות שלך"); 
            setShowAlert(true);
            setStage('results');
            return;
          }
          
          const sessionKey = `Session (${new Date().toLocaleDateString()})`;
          const newResults = results.map(r => ({
            ...r,
            displayDuration,
            symbolSetType,
            startSide,
            fontSize,
            timestamp: new Date().toISOString()
          }));

          if (activeUser !== "") {
            // Save to patient document
            const patientDoc = doc(firestore, "patients", activeUser);
            const patientSnapshot = await getDoc(patientDoc);
            
            if (!patientSnapshot.exists()) {
              await setDoc(patientDoc, { gameResults: {} });
            }
            
            const patientData = patientSnapshot.exists() ? patientSnapshot.data() : { gameResults: {} };
            const existingGames = patientData.gameResults?.[sessionKey]?.["SaccadeClockGame"] || [];
            
            const patientResults = {
              gameResults: {
                ...patientData.gameResults,
                [sessionKey]: {
                  ...(patientData.gameResults?.[sessionKey] || {}),
                  "SaccadeClockGame": [...existingGames, ...newResults]
                }
              }
            };
            
            await setDoc(patientDoc, patientResults, { merge: true });
            console.log("Patient results saved successfully!");
          } else {
            // Save to user document
            if (currentUser) {
              const userDoc = doc(firestore, "users", currentUser.uid);
              const userSnapshot = await getDoc(userDoc);
              
              if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const existingResults = userData.gameResults?.[sessionKey]?.SaccadeClockGame || [];
                
                const userResults = {
                  gameResults: {
                    ...userData.gameResults,
                    [sessionKey]: {
                      ...(userData.gameResults?.[sessionKey] || {}),
                      "SaccadeClockGame": [...existingResults, ...newResults]
                    }
                  }
                };
                
                await setDoc(userDoc, userResults, { merge: true });
                console.log("Results saved successfully!");
              }
            }
          }
          
          setResults([]);
          setStage('start');
        } catch (error) {
          console.error("Error saving results:", error);
          alert("אירעה שגיאה בשמירת התוצאות.");
          setStage('start');
        }
      };

      saveResults();
    }
  }, [stage, activeUser, results, displayDuration, symbolSetType, startSide, fontSize]);

  const difficultyPresets = [
    { 
      name: "קל מאוד", 
      displayDuration: 2000, 
      symbolLength: 2, 
      fontSize: 6, 
      circleSize: 800, 
      symbolSetType: "numbers"
    },
    { 
      name: "קל", 
      displayDuration: 1600, 
      symbolLength: 3, 
      fontSize: 5, 
      circleSize: 700, 
      symbolSetType: "numbers"
    },
    { 
      name: "בינוני", 
      displayDuration: 1200, 
      symbolLength: 3, 
      fontSize: 4, 
      circleSize: 600, 
      symbolSetType: "letters"
    },
    { 
      name: "קשה", 
      displayDuration: 800, 
      symbolLength: 4, 
      fontSize: 3, 
      circleSize: 500, 
      symbolSetType: "letters"
    },
    { 
      name: "קשה מאוד", 
      displayDuration: 500, 
      symbolLength: 5, 
      fontSize: 2, 
      circleSize: 400, 
      symbolSetType: "symbols"
    }
  ];
  
  // Add this function inside your component
  const applyPreset = (preset) => {
    setDisplayDuration(preset.displayDuration);
    setSymbolLength(preset.symbolLength);
    setFontSize(preset.fontSize);
    setCircleSize(preset.circleSize);
    setSymbolSetType(preset.symbolSetType);
  };

  return (
    <div className="game">
      <h2>סקאדת שעון</h2>
      {stage === 'start' && (
        <div>
        <div className="gamedesc">
         <h3>
          <></>
          המשחק מדמה תרגילי סקאדה עם סימבולים המוצגים בשעון דמיוני. הסימבולים יופיעו במקומות שונים על השעון בהתאם לבחירתך.<br/>
          יוצגו בפניך {symbolLength} סימבולים בזה אחר זה. עליך לזכור את הסימבולים שהוצגו בסדר הופעתם ולהקליד אותם בתיבת הטקסט.<br/>
          ניתן לשנות את מהירות התצוגה, סוג הסימבולים, גודל הגופן ומיקום התצוגה על השעון.
          בהצלחה!
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
        <div  className="settings-controls">
        <h3>הגדרות משחק:</h3>
          <label>משך תצוגה (אלפיות שנייה): {displayDuration}</label>
          <input type="range" min="300" max="2000" step="100" value={displayDuration} onChange={e => setDisplayDuration(Number(e.target.value))} />
          


          <label>מספר סמלים: {symbolLength}</label>
          <input type="range" min="2" max="5" step="1" value={symbolLength} onChange={e => setSymbolLength(Number(e.target.value))} />
          <label>גודל גופן: {fontSize}</label>
          <input type="range" min="1" max="7" step="1" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
          <label>גודל מעגל: {circleSize}px</label>
          <input type="range" min="300" max="1200" step="50" value={circleSize} onChange={e => setCircleSize(Number(e.target.value))} />
          <label>קבוצת סמלים: <select value={symbolSetType} onChange={e => setSymbolSetType(e.target.value)}>
            <option value="numbers">מספרים</option>
            <option value="letters">אותיות</option>
            <option value="symbols">סמלים</option>
          </select></label>

          <label>כיוון תצוגה: <select value={startSide} onChange={e => setStartSide(e.target.value)}>
            <option value="LTR">שמאל-ימין (3-9)</option>
            <option value="RTL">ימין-שמאל (9-3)</option>
            <option value="vertical">למעלה-למטה (12-6)</option>
            <option value="diagonalL">אלכסוני (8-2)</option>
            <option value="diagonalR">אלכסוני (2-8)</option>
            <option value="custom">מותאם אישית</option>
          </select></label>

          {startSide === 'custom' && (
            <div>
              <label>שעה ראשונה (1-12): <input 
                type="number" 
                min="1" 
                max="12" 
                value={customHours?.[0] || 1} 
                onChange={e => setCustomHours(prev => [Number(e.target.value), prev?.[1] || 1])}
              /></label>
              <label>שעה שנייה (1-12): <input 
                type="number" 
                min="1" 
                max="12" 
                value={customHours?.[1] || 1} 
                onChange={e => setCustomHours(prev => [prev?.[0] || 1, Number(e.target.value)])}
              /></label>
            </div>
          )}

          <label>צליל ביפ:<input type="checkbox" checked={beepSound} onChange={() => setBeepSound(prev => !prev)} />
          </label>
          </div> 
          </div>
          <button className='start_game' onClick={startGame}>התחל משחק <i class="fa-solid fa-play"></i></button>
        </div>
      )}

      {stage === 'play' && !inputReady && (
          <div className="square-game-circle" style={{ width: `${circleSize}px`, height: `${circleSize}px` }}>
          {Array.from({ length: symbolLength }).map((_, index) => {
            let symbolStyle = {
              fontSize: `${fontSize}rem`,
              position: 'absolute',
              color: 'black',
            };

            let hourPositions;
            switch (startSide) {
              case 'LTR':
                hourPositions = [9, 3];
                break;
              case 'RTL':
                hourPositions = [3, 9];
                break;
              case 'vertical':
                hourPositions = [12, 6];
                break;
              case 'diagonalL':
                hourPositions = [8, 2];
                break;
              case 'diagonalR':
                hourPositions = [2, 8]; 
                break
              case 'custom':
                hourPositions = customHours || [9, 3];
                break;
              default:
                hourPositions = [9, 3];
            }
            const progressRatio = index / (symbolLength - 1);  // Will go from 0 to 1
            const startAngle = ((hourPositions[0] % 12) / 12) * 2 * Math.PI - Math.PI / 2;
            const endAngle = ((hourPositions[1] % 12) / 12) * 2 * Math.PI - Math.PI / 2;
            const angle = startAngle + (endAngle - startAngle) * progressRatio;

            const radius = 150;
            symbolStyle = {
              ...symbolStyle,
              left: `${50 + 40 * Math.cos(angle)}%`,
              top: `${50 + 40 * Math.sin(angle)}%`,
              transform: 'translate(-50%, -50%)'
            };

            return (
              <div 
                key={index} 
                className="symbol"
                style={symbolStyle}
              >
                {showIndex === index && currentSymbols[index]}
              </div>
            );
          })}
        </div>
      )}

      {inputReady && (
        <div className="answer_input">
          <h2>הכנסת את התווית שראית</h2>
          <input
            ref={inputRef}
            value={userInput}
            onChange={e => setUserInput(e.target.value.slice(0, 5))}
            onKeyDown={e => e.key === 'Enter' && handleInput()}
            maxLength={5}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleInput();
              }
          }}
          />
          <button onClick={handleInput}>שלח</button>
        </div>
      )}

      {stage === 'results' && (
        <div className="results">
          <h2>תוצאות</h2>
          <ul>
            {results.map((r, i) => (
                <li key={i}>
                  סימנים שהוצגו: {r.shown}, אתה הכנסת: {r.input}. {r.isCorrect ? 'תשובה נכונה' : 'תשובה שגויה'} (לקח לך:{r.timeTaken}מ"ש)
                </li>
            ))}
          </ul>
          <button onClick={() => setStage('start')}>בחזרה לתפריט</button>
          <button onClick={startGame}>שחק שוב</button>
          <button onClick={() => {
            setShowConfirmReset(true);
            }}>אפס תוצאות</button>
            {showConfirmReset && (
            <ConfirmDialog 
              message="האם אתה בטוח שברצונך לאפס את התוצאות מבלי לשמור אותן?"
              onConfirm={() => {
              setResults([]);
              setShowConfirmReset(false);
              }}
              onCancel={() => setShowConfirmReset(false)}
            />
            )}
          <button onClick={() => setStage('SaveResults')}>שמור תוצאות</button>
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

export default SaccadeClockGame;

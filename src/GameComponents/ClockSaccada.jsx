import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, doc, getDoc, setDoc, firestore } from '../firebase.js';

const symbolSets = {
  numbers: '0123456789'.split(''),
  letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  symbols: '!@#$%^&*'.split('')
};

const SaccadeClockGame = () => {
  const [stage, setStage] = useState('start');
  const [displayDuration, setDisplayDuration] = useState(1000);
  const [symbolSetType, setSymbolSetType] = useState('numbers');
  const [fontSize, setFontSize] = useState(3);
  const [beepSound, setBeepSound] = useState(false);
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            alert("אנא התחבר למשתמש על מנת לשמור נתונים.");
            return;
          }
          const userDoc = doc(firestore, "users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          const sessionKey = `Session (${new Date().toLocaleDateString()})`;
          const newResults = results.map(r => ({
            ...r,
            displayDuration,
            symbolSetType,
            startSide,
            fontSize
          }));
          const updatedResults = {
            [sessionKey]: {
              SaccadeClockGame: newResults
            }
          };
          const mergedResults = userSnapshot.exists() && userSnapshot.data().gameResults
            ? {
              ...userSnapshot.data().gameResults,
              [sessionKey]: {
                ...(userSnapshot.data().gameResults[sessionKey] || {}),
                SaccadeClockGame: [
                  ...(userSnapshot.data().gameResults[sessionKey]?.SaccadeClockGame || []),
                  ...newResults
                ]
              }
            }
            : updatedResults;

          await setDoc(userDoc, { gameResults: mergedResults }, { merge: true });
          setResults([]);
          setStage('start');
        });
        return () => unsubscribe();
      };
      saveResults();
    }
  }, [stage]);

  
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
          <label>משך תצוגה (אלפיות שנייה): {displayDuration}</label>
          <input type="range" min="300" max="2000" step="100" value={displayDuration} onChange={e => setDisplayDuration(Number(e.target.value))} />
          
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

          <label>מספר סמלים: {symbolLength}</label>
          <input type="range" min="2" max="5" step="1" value={symbolLength} onChange={e => setSymbolLength(Number(e.target.value))} />
          <label>גודל גופן: {fontSize}</label>
          <input type="range" min="1" max="10" step="1" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
          <label>צליל ביפ:          <input type="checkbox" checked={beepSound} onChange={() => setBeepSound(prev => !prev)} />
          </label>
        
          </div>
          <button className='start_game' onClick={startGame}>התחל משחק <i class="fa-solid fa-play"></i></button>
        </div>
      )}

      {stage === 'play' && (
        <div className="square-game-circle">
          {Array.from({ length: symbolLength }).map((_, index) => {
            let symbolStyle = {
              fontSize: `${fontSize}rem`,
              position: 'absolute'
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
          <h2>מה ראית?</h2>
          <input
            ref={inputRef}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInput()}
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
          <button onClick={() => setStage('start')}>נשחק שוב</button>
          <button onClick={() => setStage('SaveResults')}>שמור תוצאות</button>
        </div>
      )}
    </div>
  );
};

export default SaccadeClockGame;

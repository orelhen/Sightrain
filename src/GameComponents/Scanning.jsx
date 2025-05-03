import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const symbolSets = {
  numbers: '0123456789'.split(''),
  letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  symbols: '!@#$%^&*'.split(''),
};

const ScanningGame = () => {
  const [stage, setStage] = useState('start');
  const [displayTime, setDisplayTime] = useState(1000);
  const [charactersPerRow, setCharactersPerRow] = useState(10);
  const [spacing, setSpacing] = useState(10);
  const [fontSize, setFontSize] = useState(24);
  const [symbolSetType, setSymbolSetType] = useState('letters');
  const [scanDirection, setScanDirection] = useState('ltr');
  const [beepSound, setBeepSound] = useState(false);
  const [targetChar, setTargetChar] = useState('a');
  const [rows, setRows] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(-1);
  const [visibleChars, setVisibleChars] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [correctDetections, setCorrectDetections] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [user, setUser] = useState(null);
  const [numberOfLines, setNumberOfLines] = useState(3);

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

      if (beepSound && row[initial + index * direction] === targetChar) {
        const audio = new Audio('/Sounds/beep.mp3');
        audio.play().catch(() => {});
      }

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
    setTotalTargets((prev) => prev + 1);
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
    if (!user) {
      alert('Please log in to save your results.');
      return;
    }

    const userDoc = doc(firestore, 'users', user.uid);
    const userSnapshot = await getDoc(userDoc);
    const sessionKey = `Session (${new Date().toLocaleDateString()})`;

    const newResults = {
      correctDetections,
      totalTargets,
      reactionTimes,
      averageReactionTime:
        reactionTimes.length > 0
          ? (
              reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            ).toFixed(2)
          : null,
      displayTime,
      charactersPerRow,
      spacing,
      fontSize,
      symbolSetType,
      scanDirection,
      targetChar,
      numberOfLines,
      timestamp: new Date().toISOString(),
    };

    const existing = userSnapshot.exists()
      ? userSnapshot.data().gameResults?.[sessionKey]?.ScanningGame || []
      : [];

    const merged = {
      [sessionKey]: {
        ScanningGame: [...existing, newResults],
      },
    };

    await setDoc(userDoc, { gameResults: merged }, { merge: true });
    alert('Results saved successfully!');
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
                min="50" 
                max="1000"
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
            <label>
              השמע צליל:
              <input
                type="checkbox"
                checked={beepSound}
                onChange={() => setBeepSound((prev) => !prev)}
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
          <p>תו: {targetChar}</p>
          <p>סה"כ מטרות שהוצגו: {totalTargets}</p>
          <p>זיהויים נכונים: {correctDetections}</p>
          <p>
            זמן תגובה ממוצע:{' '}
            {reactionTimes.length > 0
              ? (
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                ).toFixed(2) + ' אלפיות שנייה'
              : 'לא זמין'}
          </p>
          <button onClick={() => setStage('start')}>שחק שוב</button>
          <button onClick={saveResultsToDatabase}>שמור תוצאות</button>
        </div>
      )}
    </div>
  );
};

export default ScanningGame;
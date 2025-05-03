import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, doc, getDoc, setDoc, firestore } from '../firebase.js';

const symbolSets = {
  numbers: '0123456789'.split(''),
  letters: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  symbols: '!@#$%^&*'.split('')
};

const getClockPosition = (hour, radius, centerX, centerY) => {
  const angle = ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2;
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);
  return { x, y };
};

const ClockSaccada = () => {
  const [stage, setStage] = useState('start');
  const [displayDuration, setDisplayDuration] = useState(1000);
  const [symbolSetType, setSymbolSetType] = useState('numbers');
  const [fontSize, setFontSize] = useState(3); // Default 3em
  const [spacing, setSpacing] = useState(300);
  const [leftHour, setLeftHour] = useState(9);
  const [rightHour, setRightHour] = useState(3);
  const [startSide, setStartSide] = useState('left');
  const [beepSound, setBeepSound] = useState(true);
  const [currentSymbols, setCurrentSymbols] = useState([]);
  const [showIndex, setShowIndex] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState([]);
  const [inputReady, setInputReady] = useState(false);
  const inputRef = useRef(null);
  const roundStartTime = useRef(null);
  const auth = getAuth();

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
    const symbol1 = getRandomSymbol();
    const symbol2 = getRandomSymbol();
    setCurrentSymbols(startSide === 'left' ? [symbol1, symbol2] : [symbol2, symbol1]);
    setStage('play');
    setShowIndex(0);
    setInputReady(false);
    roundStartTime.current = Date.now();
    playBeep();

    setTimeout(() => {
      setShowIndex(1);
      playBeep();
      setTimeout(() => {
        setShowIndex(null);
        setInputReady(true);
        inputRef.current?.focus();
      }, displayDuration);
    }, displayDuration);
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
            spacing,
            leftHour,
            rightHour,
            startSide,
            fontSize
          }));
          const updatedResults = {
            [sessionKey]: {
              ClockSaccadaGame: newResults
            }
          };
          const mergedResults = userSnapshot.exists() && userSnapshot.data().gameResults
            ? {
              ...userSnapshot.data().gameResults,
              [sessionKey]: {
                ...(userSnapshot.data().gameResults[sessionKey] || {}),
                ClockSaccadaGame: [
                  ...(userSnapshot.data().gameResults[sessionKey]?.ClockSaccadaGame || []),
                  ...newResults
                ]
              }
            }
            : updatedResults;
          await setDoc(userDoc, { gameResults: mergedResults }, { merge: true });
        });
        setStage('start');
        return () => unsubscribe();
      };
      saveResults();
    }
  }, [stage]);

  const radius = spacing / 2;
  const centerX = 400;
  const centerY = 250;

  const positions = {
    left: getClockPosition(leftHour, radius * 0.8, centerX, centerY),
    right: getClockPosition(rightHour, radius * 0.8, centerX, centerY)
  };

  return (
    <div className="game">
      {stage === 'start' && (
        <div>
          <h2>Clock Saccada Game</h2>
          <div className="settings">
            <label>Display Duration (ms): {displayDuration}</label>
            <input type="range" min="100" max="2000" step="100" value={displayDuration} onChange={e => setDisplayDuration(Number(e.target.value))} />

            <label>Symbol Set:</label>
            <select value={symbolSetType} onChange={e => setSymbolSetType(e.target.value)}>
              <option value="numbers">Numbers</option>
              <option value="letters">Letters</option>
              <option value="symbols">Symbols</option>
            </select>
            
            <label>Font Size (em): {fontSize}</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />

            <label>Spacing (px): {spacing}</label>
            <input type="range" min="100" max="1000" step="50" value={spacing} onChange={e => setSpacing(Number(e.target.value))} />

            <label>Left Clock Hour:</label>
            <select value={leftHour} onChange={e => setLeftHour(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>

            <label>Right Clock Hour:</label>
            <select value={rightHour} onChange={e => setRightHour(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>

            <label>Start Side:</label>
            <select value={startSide} onChange={e => setStartSide(e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>

            <label>
              Beep Sound:
              <input type="checkbox" checked={beepSound} onChange={() => setBeepSound(prev => !prev)} />
            </label>
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {stage === 'play' && (
        <div className="clock-area">
          <svg width="800" height="500">
            <circle cx={centerX} cy={centerY} r={radius} stroke="#000" strokeWidth="3" fill="none" />
            {showIndex !== null && (
              <text
                x={showIndex === 0 ? positions.left.x : positions.right.x}
                y={showIndex === 0 ? positions.left.y : positions.right.y}
                textAnchor="middle"
                fontSize={`${fontSize}em`}
                dominantBaseline="middle"
              >
                {currentSymbols[showIndex]}
              </text>
            )}
          </svg>
        </div>
      )}

      {inputReady && (
        <div className="input-area">
          <h3>What did you see?</h3>
          <input
            ref={inputRef}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInput()}
          />
          <button onClick={handleInput}>Submit</button>
        </div>
      )}

      {stage === 'results' && (
        <div className="results">
          <h2>Results</h2>
          <ul>
            {results.map((r, i) => (
              <li key={i}>
                {r.shown} → {r.input} = {r.isCorrect ? 'Correct' : 'Wrong'} ({r.timeTaken}ms)
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

export default ClockSaccada;
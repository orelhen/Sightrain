import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Ensure this path is correct based on your project structure

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
  const [beepSound, setBeepSound] = useState(true);
  const [targetChar, setTargetChar] = useState('a');
  const [rows, setRows] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [correctDetections, setCorrectDetections] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

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

  const startGame = () => {
    setStage('play');
    setRows([]);
    setCurrentRowIndex(0);
    setReactionTimes([]);
    setCorrectDetections(0);
    setTotalTargets(0);
    setGameEnd(false);
    setStartTime(null);

    const interval = setInterval(() => {
      const newRow = generateRow();
      setRows((prevRows) => [...prevRows, newRow]);
      setCurrentRowIndex((prevIndex) => prevIndex + 1);
      setTotalTargets((prevTotal) => prevTotal + 1);
      setStartTime(Date.now());

      if (beepSound) {
        const audio = new Audio('/Sounds/beep.mp3'); // Ensure this path is correct
        audio.play().catch(console.error);
      }

      if (currentRowIndex >= 20) { // Adjust the number of rows as needed
        clearInterval(interval);
        setGameEnd(true);
        setStage('results');
      }
    }, displayTime);
  };

  const handleKeyPress = (event) => {
    if (event.code === 'Space' && stage === 'play') {
      const reactionTime = Date.now() - startTime;
      setReactionTimes((prevTimes) => [...prevTimes, reactionTime]);
      setCorrectDetections((prevCount) => prevCount + 1);
    }
  };

  useEffect(() => {
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
      timestamp: new Date().toISOString(),
    };

    const updatedResults = {
      [sessionKey]: {
        ScanningGame: [
          ...(userSnapshot.exists() &&
          userSnapshot.data().gameResults &&
          userSnapshot.data().gameResults[sessionKey] &&
          userSnapshot.data().gameResults[sessionKey].ScanningGame
            ? userSnapshot.data().gameResults[sessionKey].ScanningGame
            : []),
          newResults,
        ],
      },
    };

    const mergedResults = userSnapshot.exists()
      ? {
          ...userSnapshot.data().gameResults,
          ...updatedResults,
        }
      : updatedResults;

    await setDoc(
      userDoc,
      { gameResults: mergedResults },
      { merge: true }
    );
    alert('Results saved successfully!');
  };

  return (
    <div className="game">
      {stage === 'start' && (
        <div>
          <h2>Scanning Game</h2>
          <div className="settings">
            <label>
              Display Time (ms): {displayTime}
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={displayTime}
                onChange={(e) => setDisplayTime(Number(e.target.value))}
              />
            </label>
            <label>
              Characters per Row: {charactersPerRow}
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
              Spacing (px): {spacing}
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
              />
            </label>
            <label>
              Font Size (px): {fontSize}
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
              Symbol Set:
              <select
                value={symbolSetType}
                onChange={(e) => setSymbolSetType(e.target.value)}
              >
                <option value="numbers">Numbers</option>
                <option value="letters">Letters</option>
                <option value="symbols">Symbols</option>
              </select>
            </label>
            <label>
              Scan Direction:
              <select
                value={scanDirection}
                onChange={(e) => setScanDirection(e.target.value)}
              >
                <option value="ltr">Left to Right</option>
                <option value="rtl">Right to Left</option>
              </select>
            </label>
            <label>
              Target Character:
              <input
                type="text"
                maxLength="1"
                value={targetChar}
                onChange={(e) => setTargetChar(e.target.value)}
              />
            </label>
            <label>
              Beep Sound:
              <input
                type="checkbox"
                checked={beepSound}
                onChange={() => setBeepSound((prev) => !prev)}
              />
            </label>
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {stage === 'play' && (
        <div className="game-area">
          {rows.map((row, index) => (
            <div
              key={index}
              className="row"
              style={{
                display: 'flex',
                flexDirection: scanDirection === 'ltr' ? 'row' : 'row-reverse',
                marginBottom: '10px',
                filter: index < currentRowIndex - 1 ? 'blur(2px)' : 'none',
              }}
            >
              {row.map((char, idx) => (
                <span
                  key={idx}
                  style={{
                    marginRight: `${spacing}px`,
                    fontSize: `${fontSize}px`,
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
          <h2>Results</h2>
          <p>Target Character: {targetChar}</p>
          <p>Total Targets Shown: {totalTargets}</p>
          <p>Correct Detections: {correctDetections}</p>
          <p>
            Average Reaction Time:{' '}
            {reactionTimes.length > 0
              ? (
                  reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
                ).toFixed(2) + ' ms'
              : 'N/A'}
          </p>
          <button onClick={() => setStage('start')}>Play Again</button>
          <button onClick={saveResultsToDatabase}>Save Results</button>
        </div>
      )}
    </div>
  );
};

export default ScanningGame;
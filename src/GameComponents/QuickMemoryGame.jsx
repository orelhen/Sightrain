import React, { useState, useEffect } from 'react';
import '../css/GamesCss/Games.scss';

import { getAuth, firestore, doc, getDoc, setDoc, onAuthStateChanged } from '../firebase.js'; // Ensure Firebase is correctly configured and imported

const QuickMemoryGame = () => {
    const [stage, setStage] = useState('start'); // start, countdown, showNumber, input, results
    const [countdown, setCountdown] = useState(2); // Countdown timer
    const [currentNumber, setCurrentNumber] = useState(''); // Formatted number
    const [DisplayNumber, setDisplayNumber] = useState(''); // Formatted number with spaces
    const [userInput, setUserInput] = useState('');
    const [round, setRound] = useState(1); // 3 rounds
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    
    // New state variables for sliders
    const [difficulty, setDifficulty] = useState(1200); // Difficulty slider (number display time)
    const [gameLength, setGameLength] = useState(1); // Game length slider (rounds)
    const [fontSize, setFontSize] = useState(3); // Font size slider (number font size)
    const [Spacing, setSpacing] = useState(0); // Spacing between numbers
    const auth = getAuth(); // Ensure getAuth is correctly initialized
    //beep
    const [beepsound, setbeepsound] = useState(true);
    const toggleBeep = () => {
        setbeepsound((prev) => !prev);
    };


    const generateNumber = () => {
        const number = Math.floor(100 + Math.random() * 99900).toString(); // Generate 3-digit number
        setCurrentNumber(number); // Set the formatted number
        return number.split('').join(' '.repeat(Spacing));; // Format the number with spacing
    };

    const playBeep = () => {
        const audio = new Audio('/Sounds/beep.mp3'); 
        audio.play().catch((err) => console.error('Error playing audio:', err));
    };

    const startGame = () => {
        setStage('countdown');
        setCountdown(3);
        setRound(1);
        setResults([]);
    };

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleInputSubmit = () => {
        if (userInput.length < 3 || isNaN(userInput)) {
            setErrorMessage('Please enter a valid 3-digit number.');
            return;
        }
        setErrorMessage('');
        const isCorrect = userInput === currentNumber;
        setResults((prev) => [
            ...prev,
            { round, number: currentNumber, input: userInput, isCorrect },
        ]);
        setUserInput('');
        if (round < gameLength) {
            setRound(round + 1);
            setStage('countdown');
            setCountdown(2);
        } else {
            setStage('results');
        }
    };



   

    useEffect(() => {
        let timer;
        if (stage === 'countdown') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
                if (beepsound)
                    playBeep();
            } else {
                const number = generateNumber(); // Generate and format number
                setDisplayNumber(number);
                setStage('showNumber');
                
                setTimeout(() => {
                    setStage('input'); // Transition to input after showing number
                    setCountdown(2);
                }, difficulty); // Use difficulty to control the delay before showing the input stage
            }
        }

        if (stage === 'input') {
            // Automatically focus on the input field once the input stage is active
            setTimeout(() => {
                document.getElementById('numberInput').focus();
            }, 100);
        }
        if (stage === 'SaveResults') {
            const saveResultsToDatabase = async () => {
            try {
                const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    const userDoc = doc(firestore, "users", currentUser.uid);
                    const userSnapshot = await getDoc(userDoc);
                    if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    const sessionKey = `Session (${new Date().toLocaleDateString()})`;
                    const updatedResults = {
                        [sessionKey]: {
                        "QuickMemoryGame": results
                        }
                    };
                    const mergedResults = userData.gameResults
                        ? { 
                            ...userData.gameResults, 
                            [sessionKey]: {
                                ...(userData.gameResults[sessionKey] || {}),
                                "QuickMemoryGame": [
                                    ...(userData.gameResults[sessionKey]?.QuickMemoryGame || []),
                                    ...results.map(result => ({
                                        ...result,
                                        difficulty,
                                        spacing: Spacing,
                                        fontSize
                                    }))
                                ]
                            }
                        }
                        : {
                            ...updatedResults,
                            [sessionKey]: {
                                "QuickMemoryGame": results.map(result => ({
                                    ...result,
                                    difficulty,
                                    spacing: Spacing,
                                    fontSize
                                }))
                            }
                        };
                    await setDoc(userDoc, { gameResults: mergedResults }, { merge: true });
                    console.log("Results saved successfully!");
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

            saveResultsToDatabase();
            setStage('start')
        }
        return () => clearTimeout(timer); // Cleanup timeout when component unmounts or state changes
        }, [stage, countdown, difficulty, gameLength, Spacing]);

        
    return (
        <div className="game">
            {stage === 'start' && (
                <div>
                    <h2>משחק זכרון</h2>

                    <div className="gamedesc">
                        <h3>
                        במשחק הזה, יהיו לך כמה מיליסניות לזכור את המספרים שאתה רואה על המסך, כאשר הזמן נגמר הזן את המספרים שראית
                        </h3>
                    </div>

                    <div className="settings"> 
                        <h3>הגדרות משחק:</h3>

                        <label>רמת קושי (זמן הצגת המספר): {difficulty}מ"ש</label>
                        <input
                            type="range"
                            min="150"
                            max="2500"
                            value={difficulty}
                            onChange={(e) => setDifficulty(Number(e.target.value))}
                        />

                        <label>אורך המשחק (שלבים): {gameLength}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={gameLength}
                            onChange={(e) => setGameLength(Number(e.target.value))}
                        />

                        <label>גודל הטקסט: {fontSize}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                        />

                        <label>רווח בין המספרים: {Spacing}</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={Spacing}
                            onChange={(e) => setSpacing(Number(e.target.value))}
                        />

                        <label>
                        צפצוף:
                            <input
                                type="checkbox"
                                checked={beepsound}
                                onChange={toggleBeep}
                            />
                        </label>
                    </div>

                    <button className='start_game' onClick={startGame}>התחל משחק <i class="fa-solid fa-play"></i></button>
                </div>
            )}

            {stage === 'countdown' && (
                <div>
                    <h2>התכונן!</h2>
                    <p>{countdown}</p>
                </div>
            )}

            {stage === 'showNumber' && (
                <div>
                    <h2>זכור את המספר הבא:</h2>
                    <p style={{ fontSize: `${fontSize}em`, whiteSpace: 'pre' }}>[ {DisplayNumber} ]</p>
                </div>
            )}

            {stage === 'input' && (
                <div class="answer_input">
                    <h2>הכנס מספר:</h2>
                    <input
                        id="numberInput"
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        maxLength="5"
                        autoFocus
                    />
                    <button onClick={handleInputSubmit}>אישור</button>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                </div>
            )}

            {stage === 'results' && (
                <div class="results">
                    <h2>המשחק נגמר! אלו הן התוצאות:</h2>
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>
                                סיבוב {result.round}: מספר {result.number} - המספר שלך: {result.input} ({result.isCorrect ? 'מצויין' : 'שגיאה'})
                            </li>
                        ))}
                         <h2>אפשרויות המשחק:</h2>
                         <li>זמן תצוגת המספר: {difficulty} ms </li>
                         <li>אורך המשחק: {gameLength} שלבים</li>
                         <li>גודל הטקסט: {fontSize}</li>
                         <li>מרווח בין המספרים: {Spacing}</li>
                         
                    </ul>
                    <button onClick={() => setStage('start')}>חזרה להתחלה</button>
                    <button onClick={() => setStage('SaveResults')}>שמור תוצאות</button>
                </div>
            )}
        </div>
    );
};

export default QuickMemoryGame;

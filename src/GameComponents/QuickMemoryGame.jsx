import React, { useState, useEffect } from 'react';
import '../css/GamesCss/Games.scss';
import { getAuth, firestore, doc, getDoc, setDoc } from '../firebase.js';
import AlertDialog from '../Components/Alert';






// Update the QuickMemoryGame component to receive and use onTestComplete prop
const QuickMemoryGame = ({activeUser, IsTest, onTestComplete}) => {

    // Original state variables
    const [stage, setStage] = useState('start');
    const [countdown, setCountdown] = useState(2);
    const [currentNumber, setCurrentNumber] = useState('');
    const [DisplayNumber, setDisplayNumber] = useState('');
    const [userInput, setUserInput] = useState('');
    const [round, setRound] = useState(1);
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);


    const [isTestMode, setIsTestMode] = useState(IsTest); // Test mode state variable

    // Settings state variables
    const [difficulty, setDifficulty] = useState(1200);
    const [gameLength, setGameLength] = useState(1);
    const [fontSize, setFontSize] = useState(3);
    const [Spacing, setSpacing] = useState(0);
    const [numberOfDigits, setNumberOfDigits] = useState(3);
    const auth = getAuth();
    const [beepsound, setbeepsound] = useState(true);

    // Adaptive test mode variables
    const [testLevel, setTestLevel] = useState(1);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [testComplete, setTestComplete] = useState(false);
    const [finalLevel, setFinalLevel] = useState(0);
    
    const processResults = (results, finalLevel, settingsData) => {
        // Process the game results to return a simplified object
        // with the most important information for the test component
        const processedResults = {
            finalLevel: finalLevel || 0,
            digits: settingsData.numberOfDigits || 0,
            fontSize: settingsData.fontSize || 0,
            difficulty: settingsData.difficulty || 0,
            accuracy: calculateAccuracy(results),
            details: results // Keep the full details if needed
        };
        
        return processedResults;
    };
    
    const calculateAccuracy = (results) => {
        if (!results || results.length === 0) return 0;
        
        const correctAnswers = results.filter(result => result.isCorrect).length;
        return Math.round((correctAnswers / results.length) * 100);
    };

    
    // Configure test levels max="7"  max="10"
    const testConfig = [
        { level: 1, digits: 2, fontSize: 7, spacing: 0, difficulty: 2500 },
        { level: 2, digits: 3, fontSize: 6, spacing: 1, difficulty: 2200 },
        { level: 3, digits: 4, fontSize: 5.5, spacing: 2, difficulty: 1900 },
        { level: 4, digits: 4, fontSize: 5, spacing: 3, difficulty: 1600 },
        { level: 5, digits: 5, fontSize: 4.5, spacing: 4, difficulty: 1300 },
        { level: 6, digits: 5, fontSize: 4, spacing: 5, difficulty: 1200 },
        { level: 7, digits: 6, fontSize: 3.5, spacing: 6, difficulty: 1000 },
        { level: 8, digits: 6, fontSize: 3, spacing: 7, difficulty: 900 },
        { level: 9, digits: 7, fontSize: 2.5, spacing: 8, difficulty: 800 },
        { level: 10, digits: 7, fontSize: 1, spacing: 10, difficulty: 700 },
    ];

    const toggleBeep = () => {
        setbeepsound((prev) => !prev);
    };

    // Apply test configuration based on current level
    useEffect(() => {
        if (isTestMode && testLevel <= testConfig.length) {
            const config = testConfig[testLevel - 1];
            setNumberOfDigits(config.digits);
            setFontSize(config.fontSize);
            setSpacing(config.spacing);
            setDifficulty(config.difficulty);
            setGameLength(1); // Each test level is one round
        }
    }, [testLevel, isTestMode]);

    const generateNumber = () => {
        let number;
        const min = Math.pow(10, numberOfDigits - 1);
        const max = Math.pow(10, numberOfDigits) - 1;
        number = Math.floor(min + Math.random() * (max - min + 1)).toString();

        setCurrentNumber(number); 
        const formattedNumber = number.split('')
            .map(digit => `\u202D${digit}\u202C`)
            .join(' '.repeat(Spacing));
        return formattedNumber;
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
        if (isTestMode) {
            setTestLevel(1);
            setCorrectAnswers(0);
            setTestComplete(false);
            setFinalLevel(0);
        }
    };

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleInputSubmit = () => {
        if (userInput.length !== currentNumber.length || isNaN(userInput)) {
            setErrorMessage(`אנא הכנס מספר בן  ${numberOfDigits} ספרות.`);
            return;
        }
        setErrorMessage('');
        const isCorrect = userInput === currentNumber;
        setResults((prev) => [
            ...prev,
            { round, number: currentNumber, input: userInput, isCorrect, level: isTestMode ? testLevel : null },
        ]);
        setUserInput('');

        if (isTestMode) {
            if (isCorrect) {
                setCorrectAnswers(prev => prev + 1);
                // Move to next level
                if (testLevel < testConfig.length) {
                    setTestLevel(prev => prev + 1);
                    setStage('countdown');
                    setCountdown(2);
                } else {
                    // Completed all levels successfully
                    setFinalLevel(testLevel);
                    setTestComplete(true);
                    setStage('results');
                    
                    // Call onTestComplete with processed results
                    if (onTestComplete) {
                        const settingsData = testConfig[testLevel - 1];
                        onTestComplete(processResults(results, testLevel, settingsData));
                    }
                }
            } else {
                // Failed - test ends at current level
                setFinalLevel(testLevel - 1);
                setTestComplete(true);
                setStage('results');
                
                // Call onTestComplete with processed results
                if (onTestComplete) {
                    const settingsData = testConfig[Math.max(0, testLevel - 2)];
                    onTestComplete(processResults(results, testLevel - 1, settingsData));
                }
            }
        } else {
            // Normal gameplay logic
            if (round < gameLength) {
                setRound(round + 1);
                setStage('countdown');
                setCountdown(2);
            } else {
                setStage('results');
            }
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
                const number = generateNumber();
                setDisplayNumber(number);
                setStage('showNumber');
                
                setTimeout(() => {
                    setStage('input');
                    setCountdown(2);
                }, difficulty);
            }
        }

        if (stage === 'input') {
            setTimeout(() => {
                document.getElementById('numberInput')?.focus();
            }, 100);
        }
        
        if (stage === 'SaveResults') {
            const saveResultsToDatabase = async () => {
                try {
                    const gameData = results.map(result => {
                        // Create a clean copy of the result without undefined values
                        const cleanResult = Object.entries(result).reduce((acc, [key, value]) => {
                            if (value !== undefined) acc[key] = value;
                            return acc;
                        }, {});
                        
                        return {
                            ...cleanResult,
                            difficulty: difficulty || 0,
                            spacing: Spacing || 0,
                            fontSize: fontSize || 0,
                            timestamp: new Date().toISOString(),
                            isTestMode: isTestMode || false,
                            ...(isTestMode && finalLevel !== undefined ? { finalLevel } : {})
                        };
                    });
                    
                    const sessionKey = `Session (${new Date().toLocaleDateString()})`;
                    
                    if (activeUser !== "") {
                        const patientDoc = doc(firestore, "patients", activeUser);
                        const patientSnapshot = await getDoc(patientDoc);
                        
                        if (!patientSnapshot.exists()) {
                            await setDoc(patientDoc, { gameResults: {} });
                        }
                        
                        const patientData = patientSnapshot.exists() ? patientSnapshot.data() : { gameResults: {} };
                        const existingGames = patientData.gameResults?.[sessionKey]?.["QuickMemoryGame"] || [];
                        
                        const patientResults = {
                            gameResults: {
                                ...patientData.gameResults,
                                [sessionKey]: {
                                    ...(patientData.gameResults?.[sessionKey] || {}),
                                    "QuickMemoryGame": [...existingGames, ...gameData]
                                }
                            }
                        };
                        
                        await setDoc(patientDoc, patientResults, { merge: true });
                        console.log("Patient results saved successfully!");
                        setStage('start');
                    } else {
                        const currentUser = auth.currentUser;
                        if (currentUser) {
                            const userDoc = doc(firestore, "users", currentUser.uid);
                            const userSnapshot = await getDoc(userDoc);
                            
                            if (userSnapshot.exists()) {
                                const userData = userSnapshot.data();
                                const existingResults = userData.gameResults?.[sessionKey]?.QuickMemoryGame || [];
                                
                                const userResults = {
                                    gameResults: {
                                        ...userData.gameResults,
                                        [sessionKey]: {
                                            ...(userData.gameResults?.[sessionKey] || {}),
                                            "QuickMemoryGame": [...existingResults, ...gameData]
                                        }
                                    }
                                };
                                
                                await setDoc(userDoc, userResults, { merge: true });
                                console.log("Results saved successfully!");
                                setStage('start');
                            }
                        } else {
                            setMessage("אנא התחבר כדי לשמור את התוצאות שלך"); 
                            setShowAlert(true);
                            setStage('results');
                        }
                    }
                   
                } catch (error) {
                    console.error("Error saving results:", error);
                    alert("שגיאה בשמירת הנתונים, אנא נסה שנית.");
                }
            };

            saveResultsToDatabase();
        }
        return () => clearTimeout(timer);
    }, [stage, countdown, difficulty, gameLength, Spacing]);

    // Define presets
    const difficultyPresets = [
        { name: "קל מאוד", difficulty: 2400, numberOfDigits: 2, gameLength: 3, fontSize: 6, spacing: 0 },
        { name: "קל", difficulty: 2000, numberOfDigits: 3, gameLength: 3, fontSize: 5, spacing: 1 },
        { name: "בינוני", difficulty: 1500, numberOfDigits: 4, gameLength: 4, fontSize: 4, spacing: 2 },
        { name: "קשה", difficulty: 1000, numberOfDigits: 5, gameLength: 4, fontSize: 3, spacing: 4 },
        { name: "קשה מאוד", difficulty: 600, numberOfDigits: 6, gameLength: 5, fontSize: 2, spacing: 6 }
    ];
    
    // Function to apply preset
    const applyPreset = (preset) => {
        setDifficulty(preset.difficulty);
        setNumberOfDigits(preset.numberOfDigits);
        setGameLength(preset.gameLength);
        setFontSize(preset.fontSize);
        setSpacing(preset.spacing);
    };

    return (
        <div className="game">
            {stage === 'start' && (
                <div>
                    <h2>משחק זכרון</h2>

                    <div className="gamedesc">
                        <h3>
                        במשחק הזה, יהיה לך זמן מוגבל לזכור את המספרים שאתה רואה על המסך, כאשר הזמן נגמר הזן את המספרים שראית.
                        </h3>
                        {!IsTest && ( 
                                   <button onClick={() => setIsTestMode((prev) => !prev)}>
                                   {isTestMode ? 'שחק במשחק הרגיל' : 'שחק במבדק'} <i className="fa-regular fa-eye"></i>  
                               </button>
                            )}
                      
                    </div>

                    {!isTestMode && (
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
                            <div className="settings-controls">
                            <h3>הגדרות משחק:</h3>
                            <label>רמת קושי: {difficulty}מ"ש</label>
                            <input
                                type="range"
                                min="150"
                                max="2500"
                                value={difficulty}
                                onChange={(e) => setDifficulty(Number(e.target.value))}
                            />
                            
                            <label>מספר ספרות: {numberOfDigits}</label>
                            <input
                                type="range"
                                min="2"
                                max="7"
                                value={numberOfDigits}
                                onChange={(e) => setNumberOfDigits(Number(e.target.value))}
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
                                max="6"
                                step="0.1"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                            />

                            <label>רווח בין המספרים: {Spacing}</label>
                            <input
                                type="range"
                                min="0"
                                max="10"
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
                        </div>
                    )}

                    {isTestMode && (
                        <div className="test-mode-info">
                           <h2>מצב מבדק</h2>
                            <h3>המבדק יתחיל עם מספרים גדולים וקלים יותר ויהפוך לאתגר בהדרגה</h3>
                            <h3>המבדק יימשך עד 10 שלבים</h3>
                            <h3>המבדק נועד לבדוק מה רמת הקושי המומלץ עבורך!</h3>
                        </div>
                    )}

                    <button className='start_game' onClick={startGame}>
                    
                        {isTestMode ? 'התחל מבדק' : 'התחל משחק'} <i className="fa-solid fa-play"></i>
                    </button>
                </div>
            )}

            {stage === 'countdown' && (
                <div>
                    {isTestMode && <h2>רמה {testLevel}/{testConfig.length}</h2>}
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
                <div className="answer_input">
                    <h2>הכנס מספר:</h2>
                    <input
                        id="numberInput"
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        maxLength={numberOfDigits.toString()}
                        autoFocus
                    />
                    <button onClick={handleInputSubmit}>אישור</button>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                </div>
            )}

            {stage === 'results' && (
                <div className="results">
                    <h2>המשחק נגמר! אלו הן התוצאות:</h2>
                    
                    {isTestMode && testComplete && (
                        <div className="test-results">
                            <h3>כל הכבוד! הגעת לרמה {finalLevel} מתוך {testConfig.length}</h3>
                            <p>תשובות נכונות: {correctAnswers}</p>
                        </div>
                    )}
                    
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>
                                {isTestMode ? `שלב ${result.level}: ` : `סיבוב ${result.round}: `}
                                מספר {result.number} - המספר שלך: {result.input} 
                                ({result.isCorrect ? 'מצויין' : 'שגיאה'})
                            </li>
                        ))}
                          {isTestMode && testComplete && (   <h3>אפשרויות המשחק המומלצות עבורך:</h3>)}
                        {!isTestMode && <h3>אפשרויות המשחק:</h3>}
                        <li>זמן תצוגת המספר: {difficulty} מ"ש</li>
                        {!isTestMode && <li>אורך המשחק: {gameLength} שלבים</li>}
                        <li>גודל הטקסט: {fontSize}</li>
                        <li>מרווח בין המספרים: {Spacing}</li>
                        <li>מספר ספרות: {numberOfDigits}</li>
                    </ul>
                    <button onClick={() => setStage('start')}>בחזרה לתפריט</button>
                    <button onClick={() => startGame()}>שחק שוב</button>
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

export default QuickMemoryGame;

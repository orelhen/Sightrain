import React, { useState, useEffect } from 'react';
import './Css/QuickMemoryGame.css';

const QuickMemoryGame = () => {
    const [stage, setStage] = useState('start'); // start, countdown, showNumber, input, results
    const [countdown, setCountdown] = useState(2); // Countdown timer
    const [currentNumber, setCurrentNumber] = useState('');
    const [userInput, setUserInput] = useState('');
    const [round, setRound] = useState(1); // 3 rounds
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    // New state variables for sliders
    const [difficulty, setDifficulty] = useState(500); // Difficulty slider (number display time)
    const [gameLength, setGameLength] = useState(3); // Game length slider (rounds)
    const [fontSize, setFontSize] = useState(3); // Font size slider (number font size)

    const generateNumber = () => {
        return Math.floor(100 + Math.random() * 99900).toString(); // Generate 3-digit number
    };

    const startGame = () => {
        setStage('countdown');
        setCountdown(2);
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
            } else {
                const number = generateNumber();
                setCurrentNumber(number);
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

        if (stage === 'results') {
            // Show the final results after the rounds
        }

        return () => clearTimeout(timer); // Cleanup timeout when component unmounts or state changes
    }, [stage, countdown, difficulty, gameLength]);

    return (
        <div className="quick-memory-game">
            {stage === 'start' && (
                <div>
                    <h2>Quick Memory Game</h2>

                    <div>
                        <label>Difficulty (number display time): {difficulty}ms</label>
                        <input
                            type="range"
                            min="150"
                            max="2000"
                            value={difficulty}
                            onChange={(e) => setDifficulty(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label>Game Length (rounds): {gameLength}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={gameLength}
                            onChange={(e) => setGameLength(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label>Font Size: {fontSize}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                    </div>

                    <button onClick={startGame}>Start Game</button>
                </div>
            )}

            {stage === 'countdown' && (
                <div>
                    <h2>Get Ready!</h2>
                    <p>{countdown}</p>
                </div>
            )}

            {stage === 'showNumber' && (
                <div>
                    <h2>Remember this number:</h2>
                    <p style={{ fontSize: `${fontSize}em` }}>{currentNumber}</p>
                </div>
            )}

            {stage === 'input' && (
                <div>
                    <h2>Enter the number:</h2>
                    <input
                        id="numberInput"
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        maxLength="5"
                        autoFocus
                    />
                    <button onClick={handleInputSubmit}>Submit</button>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                </div>
            )}

            {stage === 'results' && (
                <div>
                    <h2>Game Over! Here are your results:</h2>
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>
                                Round {result.round}: Number {result.number} - Your Answer: {result.input} ({result.isCorrect ? 'Correct' : 'Incorrect'})
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setStage('start')}>Back to Start</button>
                </div>
            )}
        </div>
    );
};

export default QuickMemoryGame;

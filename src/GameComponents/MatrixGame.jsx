import React, { useState, useEffect } from 'react';
import './Css/MatrixGame.css';

const MatrixGame = () => {
    const [stage, setStage] = useState('start'); // start, showX, input, results
    const [matrix, setMatrix] = useState([['', ''], ['', '']]); // 2x2 matrix
    const [clickedSquare, setClickedSquare] = useState([]); // Track clicked square
    const [xPosition, setXPosition] = useState(null); // Position of the 'X'
    const [round, setRound] = useState(1);
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [difficulty, setDifficulty] = useState(1); // Number of X's to show (1, 2, 3)
    const [blinkSpeed, setBlinkSpeed] = useState(200); // Blink speed (200ms to 1000ms)

    // Function to generate random positions for 'X's based on difficulty
    const generateRandomXPositions = () => {
        const positions = [];
        for (let i = 0; i < difficulty; i++) {
            const randomRow = Math.floor(Math.random() * 2);
            const randomCol = Math.floor(Math.random() * 2);
            positions.push([randomRow, randomCol]);
        }
        return positions;
    };

    const startGame = () => {
        setStage('showX');
        setRound(1);
        setResults([]);
    };

    const handleSquareClick = (row, col) => {
        setClickedSquare(prevClickedSquares => [
            ...prevClickedSquares, // Spread previous squares
            [row, col] // Add the new clicked square
        ]);
    };

    const handleInputSubmit = () => {
        if (!clickedSquare) {
            setErrorMessage('Please click a square!');
            return;
        }
        setErrorMessage('');

        const isCorrect = JSON.stringify(clickedSquare) === JSON.stringify(xPosition);

        setResults((prev) => [
            ...prev,
            { round, position: xPosition, clicked: clickedSquare, isCorrect },
        ]);

        if (round < 3) { // Assuming 3 rounds for this game
            setRound(round + 1);
            setStage('showX');
        } else {
            setStage('results');
        }
    };

    useEffect(() => {
        let timer;
        if (stage === 'showX') {
            // Generate random positions for X's
            const positions = generateRandomXPositions();
            setXPosition(positions);

            // Clear the matrix and place the X's
            setMatrix((prevMatrix) => {
                const newMatrix = prevMatrix.map(row => row.slice()); // Copy of matrix
                positions.forEach(([row, col]) => {
                    newMatrix[row][col] = 'X';
                });
                return newMatrix;
            });

            // Hide the X's after the specified blink speed
            timer = setTimeout(() => {
                setMatrix([['', ''], ['', '']]);
                setStage('input');
            }, blinkSpeed); // X will be visible for `blinkSpeed` ms
        }

        return () => clearTimeout(timer); // Cleanup timer when state changes
    }, [stage, round, difficulty, blinkSpeed]);

    return (
        <div className="matrix-game">
            {stage === 'start' && (
                <div>
                    <h2>Matrix Memory Game</h2>
                    <button onClick={startGame}>Start Game</button>
                </div>
            )}

            {stage === 'showX' && (
                <div>
                    <h2>Watch the X Blink!</h2>
                    <div className="matrix">
                        {matrix.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`square ${cell === 'X' ? 'blink' : ''}`}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {stage === 'input' && (
                <div>
                    <h2>Where was the X?</h2>
                    <div className="matrix">
                        {matrix.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className="square"
                                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>
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
                                Round {result.round}: X was at [{result.position[0]}, {result.position[1]}] - You clicked [{result.clicked[0]}, {result.clicked[1]}] ({result.isCorrect ? 'Correct' : 'Incorrect'})
                            </li>
                        ))}
                    </ul>
                    <button onClick={startGame}>Play Again</button>
                </div>
            )}

            {/* Difficulty and Blink Speed Sliders */}
            <div>
                <label>
                    Difficulty (Number of X's):
                    <input
                        type="range"
                        min="1"
                        max="3"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                    />
                    {difficulty} X(s)
                </label>
            </div>

            <div>
                <label>
                    Blink Speed (ms):
                    <input
                        type="range"
                        min="200"
                        max="1000"
                        value={blinkSpeed}
                        onChange={(e) => setBlinkSpeed(Number(e.target.value))}
                    />
                    {blinkSpeed} ms
                </label>
            </div>
        </div>
    );
};

export default MatrixGame;

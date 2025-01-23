import React, { useState, useEffect } from 'react';
import '../css/GamesCss/MatrixGame.css';
import '../css/GamesCss/Games.scss';

const MatrixGame = () => {
    const [stage, setStage] = useState('start'); // start, showX, input, results
    const [matrix, setMatrix] = useState([['', '', ''], ['', '', ''], ['', '', '']]); // 2x2 matrix
    const [clickedSquare, setClickedSquare] = useState(null); // Track clicked square
    const [xPosition, setXPosition] = useState([]); // Positions of X's for the current round
    const [round, setRound] = useState(1);
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [difficulty, setDifficulty] = useState(1); // Number of X's to show (1, 2, 3)
    const [blinkSpeed, setBlinkSpeed] = useState(200); // Blink speed (200ms to 1000ms)

    // Function to generate random positions for 'X's based on difficulty
    const generateRandomXPositions = () => {
        const positions = [];
        for (let i = 0; i < difficulty; i++) {
            const randomRow = Math.floor(Math.random() * 3);
            const randomCol = Math.floor(Math.random() * 3);
            positions.push([randomRow, randomCol]);
        }
        return positions; // Return an array of positions, e.g. [[0, 1], [1, 0]]
    };

    const startGame = () => {
        setStage('showX');
        setRound(1);
        setResults([]);
        setErrorMessage('');
        setClickedSquare(null);
    };

    const handleSquareClick = (row, col) => {
        // Track only the last clicked square
        setClickedSquare([row, col]);
    };

    const handleInputSubmit = () => {
        if (!clickedSquare) {
            setErrorMessage('Please click a square!');
            return;
        }
        setErrorMessage('');

        // Check if clickedSquare matches any position in xPosition
        const isCorrect = xPosition.some(pos => JSON.stringify(pos) === JSON.stringify(clickedSquare));

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
            setMatrix([['', '', ''], ['', '', ''], ['', '', '']]); // Reset the matrix

            setTimeout(() => {
                const newMatrix = [['', '', ''], ['', '', ''], ['', '', '']];
                positions.forEach(([row, col]) => {
                    newMatrix[row][col] = 'X';
                });
                setMatrix(newMatrix);
            }, 0); // Immediately show X's before the timer

            // Hide the X's after the specified blink speed
            timer = setTimeout(() => {
                setMatrix([['', '', ''], ['', '', ''], ['', '', '']]);
                setStage('input');
            }, blinkSpeed); // X will be visible for `blinkSpeed` ms
        }

        return () => clearTimeout(timer); // Cleanup timer when state changes
    }, [stage, round, difficulty, blinkSpeed]);

    return (
        <div className="game">
            
            {stage === 'start' && (
                <div>
                    <h2>Matrix Memory Game</h2>
                    <div className="gamedesc">
                        <h3>
                       עליכם לזהות באילו מהקוביות נמצאו ה-X
                        </h3>
                    </div>

                    <div className='settings'>
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
                    <button className='start_game' onClick={startGame}>Start Game <i class="fa-solid fa-play"></i></button>
            

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
                                    className={`matrixsquare ${cell === 'X' ? 'blink' : ''}`}
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
                                    className="matrixsquare"
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
                                Round {result.round}: X was at {result.position.map(pos => `[${pos[0]}, ${pos[1]}]`).join(', ')} - You clicked [{result.clicked[0]}, {result.clicked[1]}] ({result.isCorrect ? 'Correct' : 'Incorrect'})
                            </li>
                        ))}
                    </ul>
                    <button onClick={startGame}>Play Again</button>
                </div>
            )}

            {/* Difficulty and Blink Speed Sliders */}
           
        </div>
    );
};

export default MatrixGame;

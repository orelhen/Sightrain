import React, { useState, useEffect, useRef } from 'react';
import '../css/GamesCss/RedSquareGame.css';

const RedSquareGame = () => {
    const [isRed, setIsRed] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [responseTimes, setResponseTimes] = useState([]);
    const [redSquareCount, setRedSquareCount] = useState(0);
    const [missedCount, setMissedCount] = useState(0);
    const [gameRunning, setGameRunning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const redTimeoutRef = useRef(null); // Reference for the miss timeout
    const intervalRef = useRef(null); // Reference for the main interval

    const handleUserResponse = () => {
        if (isRed) {
            const reactionTime = Date.now() - startTime;
            setResponseTimes((prev) => [...prev, reactionTime]);
            setIsRed(false);
            clearTimeout(redTimeoutRef.current); // Prevent marking as missed
        }
    };

    const handleKeyPress = (e) => {
        if (e.code === 'Backspace') {
            handleUserResponse();
        }
    };

    const startGame = () => {
        setResponseTimes([]);
        setRedSquareCount(0);
        setMissedCount(0);
        setShowResults(false);
        setGameRunning(true);

        const gameDuration = 15000; // Game duration (15 seconds)
        const endTime = Date.now() + gameDuration;

        const turnRedRandomly = () => {
            const delay = Math.random() * 3000 + 1000; // Random interval (1-4 seconds)
            intervalRef.current = setTimeout(() => {
                if (Date.now() > endTime) {
                    // Stop the game when time is up
                    setGameRunning(false);
                    setShowResults(true);
                    clearTimeout(intervalRef.current);
                    clearTimeout(redTimeoutRef.current);
                    setIsRed(false); // Reset the square
                    return;
                }

                setIsRed(true);
                setRedSquareCount((prev) => prev + 1);
                setStartTime(Date.now());

                // Automatically revert the square and increment missed count after 0.7 seconds
                redTimeoutRef.current = setTimeout(() => {
                    if (isRed) {
                        setMissedCount((prev) => prev + 1);
                        setIsRed(false);
                    }
                }, 700);

                turnRedRandomly(); // Schedule the next red square
            }, delay);
        };

        turnRedRandomly();
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(intervalRef.current);
            clearTimeout(redTimeoutRef.current);
        };
    }, []);

    return (
        <div className="red-square-game">
            <h2>Red Square Game</h2>
            {gameRunning ? (
                <div
                    className={`square ${isRed ? 'red' : ''}`}
                    onClick={handleUserResponse}
                ></div>
            ) : (
                <>
                    <button onClick={startGame}>Start Game</button>
                    {showResults && (
                        <div className="results">
                            <h3>Game Results</h3>
                            <p>Red Squares Shown: {redSquareCount}</p>
                            <p>Missed Squares: {missedCount}</p>
                            <p>
                                Reaction Times:{' '}
                                {responseTimes.length > 0
                                    ? responseTimes.join(', ') + ' ms'
                                    : 'No responses'}
                            </p>
                            {responseTimes.length > 0 && (
                                <p>
                                    Average Reaction Time:{' '}
                                    {(
                                        responseTimes.reduce(
                                            (a, b) => a + b,
                                            0
                                        ) / responseTimes.length
                                    ).toFixed(2)}{' '}
                                    ms
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RedSquareGame;

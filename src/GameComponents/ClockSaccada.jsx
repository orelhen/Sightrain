import React, { useState, useEffect } from "react";

const ClockSaccada = () => {
    const [symbols] = useState(["A", "B"]); // Default symbols
    const [currentSymbol, setCurrentSymbol] = useState("");
    const [position, setPosition] = useState("left"); // "left" or "right"
    const [responses, setResponses] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [gameRunning, setGameRunning] = useState(false);

    const displayDuration = 200; // in milliseconds
    const totalRounds = 10; // Number of symbol alternations

    useEffect(() => {
        if (gameRunning) {
            let round = 0;
            const interval = setInterval(() => {
                if (round >= totalRounds) {
                    clearInterval(interval);
                    setGameRunning(false);
                    return;
                }

                const nextSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const nextPosition = position === "left" ? "right" : "left";

                setCurrentSymbol(nextSymbol);
                setPosition(nextPosition);
                setStartTime(Date.now());

                if (nextSymbol === "A") {
                    playBeep();
                }

                round++;
            }, displayDuration);

            return () => clearInterval(interval);
        }
    }, [gameRunning, position, symbols]);

    const handleInput = (input) => {
        if (!gameRunning || !currentSymbol) return;

        const reactionTime = Date.now() - startTime;
        setReactionTimes((prev) => [...prev, reactionTime]);

        const isCorrect = input === currentSymbol;
        setResponses((prev) => [...prev, isCorrect]);
    };

    const playBeep = () => {
        
        
    };

    const startGame = () => {
        setResponses([]);
        setReactionTimes([]);
        setGameRunning(true);
    };

    const calculateResults = () => {
        const correctResponses = responses.filter((res) => res).length;
        const averageReactionTime =
            reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length || 0;

        return {
            correctResponses,
            totalResponses: responses.length,
            averageReactionTime: averageReactionTime.toFixed(2),
        };
    };

    return (
        <div>
            <h1>Clock Saccada Game</h1>
            {!gameRunning && (
                <button onClick={startGame}>Start Game</button>
            )}
            {gameRunning && (
                <div>
                    <div
                        style={{
                            position: "relative",
                            width: "200px",
                            height: "200px",
                            border: "2px solid black",
                            borderRadius: "50%",
                            margin: "20px auto",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: position === "left" ? "50%" : "auto",
                                bottom: position === "right" ? "50%" : "auto",
                                left: position === "left" ? "10%" : "auto",
                                right: position === "right" ? "10%" : "auto",
                                transform: "translate(-50%, -50%)",
                                fontSize: "24px",
                                fontWeight: "bold",
                            }}
                        >
                            {currentSymbol}
                        </div>
                    </div>
                    <div>
                        <button onClick={() => handleInput("A")}>A</button>
                        <button onClick={() => handleInput("B")}>B</button>
                    </div>
                </div>
            )}
            {!gameRunning && responses.length > 0 && (
                <div>
                    <h2>Results</h2>
                    <p>Correct Responses: {calculateResults().correctResponses}</p>
                    <p>Total Responses: {calculateResults().totalResponses}</p>
                    <p>Average Reaction Time: {calculateResults().averageReactionTime} ms</p>
                </div>
            )}
        </div>
    );
};

export default ClockSaccada;
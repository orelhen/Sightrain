import React, { useEffect, useState } from "react";

const Catch5Game = () => {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [missClicks, setMissClicks] = useState(0);
  const [timesFiveShown, setTimesFiveShown] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);

  // Sliders state
  const [boxSize, setBoxSize] = useState(100); // Default size
  const [numberSpeed, setNumberSpeed] = useState(500); // Default number speed

  useEffect(() => {
    let interval;
    if (isGameRunning) {
      interval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 10); // Generate a random number between 0-9
        setCurrentNumber(randomNum);
        if (randomNum === 5) {
          setStartTime(Date.now());
          setTimesFiveShown((prev) => prev + 1); // Increment count of 5s shown
          setTimeout(() => {
            if (currentNumber === 5) {
              setCurrentNumber(0); // Reset if not clicked
            }
          }, Math.min(numberSpeed + 300, 500)); // Show 5 for a little longer than the hardness level
        }
      }, numberSpeed);
    }

    return () => clearInterval(interval);
  }, [isGameRunning, numberSpeed, currentNumber]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space" && isGameRunning) {
        handleClick(); // Trigger click handler
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameRunning, currentNumber]);

  const handleStartGame = () => {
    setIsGameRunning(true);
    setGameEnd(false);
    setCorrectClicks(0);
    setMissClicks(0);
    setTimesFiveShown(0);
    setReactionTimes([]);
    setTimeout(() => {
      setIsGameRunning(false);
      setGameEnd(true);
    }, 15000); // Run game for 15 seconds
  };

  const handleClick = () => {
    if (currentNumber === 5 && startTime) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes((prev) => [...prev, reactionTime]);
      setCorrectClicks((prev) => prev + 1);
      setCurrentNumber(0); // Reset the number
    } else {
      setMissClicks((prev) => prev + 1); // Increment miss clicks if wrong number
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Catch5</h1>

      {/* Box Size Slider */}
      <div style={sliderContainerStyle}>
        <label>
          <strong>Box Size: </strong>
          {boxSize}px
        </label>
        <input
          type="range"
          min="100"
          max="300"
          value={boxSize}
          onChange={(e) => setBoxSize(parseInt(e.target.value))}
        />
      </div>

      {/* Hardness Slider */}
      <div style={sliderContainerStyle}>
        <label>
          <strong>Diffeculty </strong>
          {numberSpeed}ms
        </label>
        <input
          type="range"
          min="300"
          max="1500"
          step="50"
          value={numberSpeed}
          onChange={(e) => setNumberSpeed(parseInt(e.target.value))}
        />
      </div>

      {!isGameRunning && !gameEnd && (
        <button onClick={handleStartGame} style={buttonStyle}>
          Start Game
        </button>
      )}

      {isGameRunning && (
        <div
          style={{
            ...gameBoxStyle,
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            fontSize: `${boxSize / 3}px`,
          }}
        >
          <h2>{currentNumber}</h2>
        </div>
      )}

      {isGameRunning && (
        <button onClick={handleClick} style={buttonStyle}>
          Click if it's 5 (or press Space)
        </button>
      )}

      {gameEnd && (
        <div>
          <h2>Game Over!</h2>
          <p>Correct clicks: {correctClicks}</p>
          <p>Miss clicks: {missClicks}</p>
          <p>Number 5 was shown: {timesFiveShown} times</p>
          {reactionTimes.length > 0 && (
            <p>
              Average reaction time:{" "}
              {(
                reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
              ).toFixed(2)}{" "}
              ms
            </p>
          )}
          {reactionTimes.length === 0 && <p>No correct clicks recorded!</p>}
          <button onClick={handleStartGame} style={buttonStyle}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

const sliderContainerStyle = {
  margin: "10px 0",
};

const gameBoxStyle = {
  margin: "20px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #000",
  fontWeight: "bold",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  margin: "10px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Catch5Game;

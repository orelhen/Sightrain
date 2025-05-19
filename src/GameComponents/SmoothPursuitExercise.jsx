import React, { useState, useEffect } from "react";
import '../css/GamesCss/Games.scss';


const SmoothPursuitExercise = () => {
  const boxSize = { width: 1600, height: 600 }; // Box dimensions
  const [dotSize, setDotSize] = useState(50); // Initial dot size
  const [speed, setSpeed] = useState(3); // Initial speed
  const [movementDirection, setMovementDirection] = useState("diagonal"); // Default direction
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [DotColor, setDotColor] = useState("red"); // Default dot color

  useEffect(() => {
    // Set the initial position based on the selected direction
    if (movementDirection === "horizontal") {
      setPosition({ x: 0, y: boxSize.height / 2 - dotSize / 2 });
      setDirection({ x: 1, y: 0 });
    } else if (movementDirection === "vertical") {
      setPosition({ x: boxSize.width / 2 - dotSize / 2, y: 0 });
      setDirection({ x: 0, y: 1 });
    } else {
      setPosition({ x: 0, y: 0 });
      setDirection({ x: 1, y: 1 });
    }
  }, [movementDirection]);

  useEffect(() => {
    const moveDot = () => {
      setPosition((prevPos) => {
        let newX = prevPos.x + speed * direction.x;
        let newY = prevPos.y + speed * direction.y;

        let newDirX = direction.x;
        let newDirY = direction.y;

        // Bounce horizontally
        if (newX + dotSize >= boxSize.width || newX <= 0) {
          newDirX *= -1; // Reverse horizontal direction
          newX = newX <= 0 ? 0 : boxSize.width - dotSize;
        }

        // Bounce vertically
        if (newY + dotSize >= boxSize.height || newY <= 0) {
          newDirY *= -1; // Reverse vertical direction
          newY = newY <= 0 ? 0 : boxSize.height - dotSize;
        }

        setDirection({ x: newDirX, y: newDirY });
        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(moveDot, 20);
    return () => clearInterval(interval);
  }, [direction, speed, dotSize]);
  // Define speed presets

  const speedPresets = [
    {
      name: "תנועה איטית",
      speed: 2,
      dotSize: 80
    },
    {
      name: "תנועה בינונית",
      speed: 6,
      dotSize: 50
    },
    {
      name: "תנועה מהירה",
      speed: 20,
      dotSize: 30
    }
  ];

  // Function to apply speed presets
  const applySpeedPreset = (preset) => {
    setSpeed(preset.speed);
    setDotSize(preset.dotSize);
  };

  return (
    <div className="game">
        <h2>אימון תנועה חלקה</h2>
      <div className="gamedesc"> 
      <p>הסתכלו למרכז המסך ועקבו אחרי הכדור עם העיניים.</p>
      </div>
      <div class="smoothbox" style={{ ...styles.box, width: boxSize.width, height: boxSize.height }}>
        <div
          style={{
            ...styles.dot,
            width: dotSize,
            height: dotSize,
            backgroundColor: DotColor,
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        ></div>
      </div>
      {/* Speed Control */}
      <div className="settings">
      <div className="presets">
            <h4>בחר מהירות:</h4>
                {speedPresets.map((preset, index) => (
                  <button
                    key={index}
                    className="preset-button"
                    onClick={() => applySpeedPreset(preset)}
                  >
                    {preset.name}
                  </button>
                ))}
            </div>
            <div class="divider"></div>

      <div className="settings-controls">
      <h3>הגדרות:</h3>
      <label>
        מהירות:
        <input
          type="range"
          min="1"
          max="30"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        {speed}
      </label>

      {/* Dot Size Control */}
      <label>
        גודל הכדור:
        <input
          type="range"
          min="10"
          max="200"
          value={dotSize}
          onChange={(e) => setDotSize(Number(e.target.value))}
        />
        {dotSize}
      </label>
        {/* Direction Control */}
        <label>
        כיוון התנועה:
        <select
          value={movementDirection}
          onChange={(e) => setMovementDirection(e.target.value)}
        >
          <option value="diagonal">אלכסון </option>
          <option value="horizontal">לרוחב</option>
          <option value="vertical">למעלה,למטה</option>
        </select>
      </label>
          <label>
            צבע הכדור:
            <select
              value={DotColor}
              onChange={(e) => setDotColor(e.target.value)}
            >
              <option value="red">אדום</option>
              <option value="yellow">צהוב</option>
              <option value="white">לבן</option>
              <option value="black">שחור</option>
              <option value="green">ירוק</option>
              <option value="blue">כחול</option>
            </select>
          </label>
    
      </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    border: "5px solid #000",
    backgroundColor: "#fff",
    overflow: "hidden",
    margin: "20px auto", // Center the box horizontally
    padding: "20px", // Add some padding inside the box
    width: "80%", // Set a width for the box
    height: "80%", // Set a height for the box
    // Add some space between the box and controls
    },
    dot: {
    borderRadius: "50%",
    border: "2px solid black", // Adding white border to the dot
  },
};

export default SmoothPursuitExercise;

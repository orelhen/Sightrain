import React, { useState, useEffect } from "react";
import '../css/GamesCss/Games.scss';


const SmoothPursuitExercise = () => {
  const boxSize = { width: 1800, height: 800 }; // Box dimensions
  const [dotSize, setDotSize] = useState(50); // Initial dot size
  const [speed, setSpeed] = useState(3); // Initial speed
  const [movementDirection, setMovementDirection] = useState("diagonal"); // Default direction
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });

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

  return (
    <div className="game" style={styles.container}>
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
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        ></div>
      </div>

      {/* Speed Control */}
      <div className="settings">
      <label>
        מהירות:
        <input
          type="range"
          min="1"
          max="10"
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
          min="30"
          max="100"
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
    border: "2px solid #000",
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: "20px", // Add some space between the box and controls
  },
  dot: {
    backgroundColor: "red",
    borderRadius: "50%",
    position: "absolute",
  },
};

export default SmoothPursuitExercise;

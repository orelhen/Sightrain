import React, { useState, useEffect } from 'react';

const DepthPerceptionTrainer = () => {
  const [objects, setObjects] = useState([]);  // Store the positions and depths of objects
  const [selectedObject, setSelectedObject] = useState(null);  // Track the object selected by the user
  const [score, setScore] = useState(0);  // User's score
  const [difficulty, setDifficulty] = useState(1);  // Difficulty level (controls speed and depth range)
  const [isGameActive, setIsGameActive] = useState(false);  // Game status
  const [feedback, setFeedback] = useState('');  // Feedback text (correct/incorrect)

  // Function to generate random objects at varying depths
  const generateObjects = () => {
    const newObjects = [];
    const numberOfObjects = 5 + difficulty;  // Increase the number of objects as difficulty increases

    for (let i = 0; i < numberOfObjects; i++) {
      const size = Math.random() * 50 + 20;  // Random object size between 20px and 70px
      const x = Math.random() * 1800;  // Random x position
      const y = Math.random() * 800;  // Random y position
      const depth = Math.random() * 1800;  // Random depth (distance from the user)
      newObjects.push({ id: i, x, y, size, depth });
    }
    setObjects(newObjects);
  };

  // Function to start the game
  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    generateObjects();
  };

 // Function to handle object selection
const handleObjectClick = (id, depth) => {
  if (selectedObject === null) {
    setSelectedObject(id);  // Mark the object as selected
    
    // Find the closest object by comparing depths
    const closestObject = objects.reduce((closest, obj) => {
      return obj.depth < closest.depth ? obj : closest;
    });

    // Check if the selected object is the closest one
    const correct = depth === closestObject.depth;

    setFeedback(correct ? 'Correct!' : 'Try Again!');
    if (correct) setScore(score + 1);

    // Reset the selection after feedback
    setTimeout(() => {
      setSelectedObject(null);
      generateObjects();  // Generate new objects for the next round
    }, 1000);
  }
};


  // Effect to run the game
  useEffect(() => {
    if (isGameActive) {
      generateObjects();
    }
  }, [isGameActive, difficulty]);

  return (
    <div className='game' style={styles.container}>
      <h2>Depth Perception Trainer</h2>
          <div className="gamedesc">
                        <h3>
                        לחץ על הכדור הכי רחוק
                          </h3>
          </div>
          <div className="settings" style={styles.controls}> 
                        <h3>הגדרות משחק:</h3>
        <label>
          Difficulty (Number of Objects and Speed):
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
          {difficulty}
        </label>
      </div>
        {/* Controls */}
     

        {!isGameActive && (
        <div style={styles.controls}>
          <button className='start_game' onClick={startGame}>Start Game</button>
        </div>
      )}
      <div style={styles.score}>Score: {score}</div>
      <div style={styles.feedback}>{feedback}</div>

      {/* Game area */}
      <div style={styles.gameBox}>
        {objects.map((obj) => (
          <div
            key={obj.id}
            style={{
              ...styles.object,
              left: obj.x,
              top: obj.y,
              width: obj.size,
              height: obj.size,
              backgroundColor: obj.depth < 500 ? 'white' : 'blue', // Color based on depth (red = closer)
            }}
            onClick={() => handleObjectClick(obj.id, obj.depth)}
          />
        ))}
      </div>

    
   
     
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  score: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  feedback: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'green',
    marginBottom: '20px',
  },
  gameBox: {
    position: 'relative',
    width: '1800px',
    height: '800px',
    border: '2px solid #000',
    backgroundColor: 'black',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  object: {
    position: 'absolute',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
};

export default DepthPerceptionTrainer;

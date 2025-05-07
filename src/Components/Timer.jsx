import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [showReminder, setShowReminder] = useState(false); // State to manage the reminder visibility
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
      if ((seconds + 1) % 300 === 0) { 
        setShowReminder(true); // Show reminder every 5 minutes (300 seconds)
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [seconds]);
  

  const resetTimer = () => {
    setSeconds(0);
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleReminderClick = () => {
    setShowReminder(false); 
  };

  return (
    <div className="timer-container">
      <button onClick={resetTimer}>
        איפוס זמן 
      </button>
      <div className="timer">{formatTime(seconds)} <i className="fa-regular fa-clock"></i></div>

      {showReminder && (
        <div className="reminder">
          <div className="reminder-message">
            <p>לא לשכוח למצמץ</p>
            <button onClick={handleReminderClick}>אוקי</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;

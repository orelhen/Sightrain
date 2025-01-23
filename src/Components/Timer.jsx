import React, { useState, useEffect } from 'react';
//import { FaClock } from 'react-icons/fa'; // Install react-icons if not already installed


const Timer = () => {
    const [seconds, setSeconds] = useState(0);
  
    useEffect(() => {
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
  
      return () => clearInterval(timer); // Cleanup on unmount
    }, []);
  
    const resetTimer = () => {
      setSeconds(0);
    };
  
    const formatTime = (sec) => {
      const minutes = Math.floor(sec / 60);
      const remainingSeconds = sec % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
  
    return (
      <div className="timer-container">
        <button onClick={resetTimer}>
          איפוס זמן 
        </button>
        <div className="timer">{formatTime(seconds)} <i class="fa-regular fa-clock"></i></div>
      </div>
    );
  };
  
  export default Timer;
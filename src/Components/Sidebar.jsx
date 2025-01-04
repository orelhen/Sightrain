import React, { useState } from 'react';
import './Css/Sidebar.css';

const Sidebar = ({ onGameClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="sidebar">
      <button className="sidebar-btn" onClick={() => onGameClick('profile')}>Profile</button>
      <button className="sidebar-btn" onClick={() => onGameClick('main')}>Main</button>
      <button className="sidebar-btn" onClick={() => onGameClick('videos')}>Videos</button>

      {/* Dropdown for Games */}
      <div className="dropdown-container">
        <button className="sidebar-btn dropdown-toggle" onClick={toggleDropdown}>
          Games
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => onGameClick('game1')}>
              Game 1
            </button>
            <button className="dropdown-item" onClick={() => onGameClick('game2')}>
              Game 2
            </button>
            <button className="dropdown-item" onClick={() => onGameClick('game3')}>
              Game 3
            </button>
            <button className="dropdown-item" onClick={() => onGameClick('game4')}>
              Game 4
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Sidebar;

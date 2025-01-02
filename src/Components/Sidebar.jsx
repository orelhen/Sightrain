import React from 'react';
import './Css/Sidebar.css';

const Sidebar = ({ onGameClick }) => {
  return (
    <div className="sidebar">
      <button className="sidebar-btn" onClick={() => onGameClick('profile')}>Profile</button>
      <button className="sidebar-btn" onClick={() => onGameClick('main')}>Main</button>
      <button className="sidebar-btn" onClick={() => onGameClick('game1')}>Game 1</button>
      <button className="sidebar-btn" onClick={() => onGameClick('game2')}>Game 2</button>
      <button className="sidebar-btn" onClick={() => onGameClick('game3')}>Game 3</button>
      <button className="sidebar-btn" onClick={() => onGameClick('game4')}>Game 4</button>
      <button className="sidebar-btn" onClick={() => onGameClick('videos')}>Videos</button>
    </div>
  );
};

export default Sidebar;

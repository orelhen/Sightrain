import React from 'react';
import './Sidebar.css'; // Add your custom CSS here

const Sidebar = () => {
  return (
    <div className="sidebar">
      <button className="sidebar-btn">Profile</button>
      <button className="sidebar-btn">Game 1</button>
      <button className="sidebar-btn">Game 2</button>
      <button className="sidebar-btn">Game 3</button>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import '../css/ComponentsCss/Sidebar.scss';

const Sidebar = ({ onGameClick }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <>
      {/* Floating menu button */}
      <div className="floating-menu" onClick={() => setIsSidebarVisible(true)}>
        <i class="fa-solid fa-bars"></i>
      </div>

      {/* Sidebar */}
      <div 
        className={`sidebar ${isSidebarVisible ? 'visible' : ''}`} 
      >
        <button className='close_menu' onClick={() => setIsSidebarVisible(false)}><i class="fa-solid fa-xmark"></i></button>

        <div className='primary_btn'>
          <button onClick={() => onGameClick('profile')}>פרופיל <i class="fa-regular fa-id-card"></i></button>
          <button onClick={() => onGameClick('main')}>דף הבית <i class="fa-solid fa-house"></i></button>
          <button onClick={() => onGameClick('videos')}>סרטונים <i class="fa-solid fa-film"></i></button>
        </div>
        <h3>משחקים <i class="fa-solid fa-brain"></i></h3>
        <div className='games_btn'>
          <button onClick={() => onGameClick('game1')}>לתפוס 5</button>
          <button onClick={() => onGameClick('game2')}><i class="fa-solid fa-cube"></i> קוביה אדומה</button>
          <button onClick={() => onGameClick('game3')}>משחק זכרון</button>
          <button onClick={() => onGameClick('game4')}>מציאת X</button>
          <button onClick={() => onGameClick('game5')}>תנועה חלקה <i class="fa-regular fa-eye"></i></button>
          <button onClick={() => onGameClick('game6')}>צבעים</button>
          <button onClick={() => onGameClick('game7')}>סאקדת שעון</button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;

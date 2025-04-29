import React, { useState } from 'react';
import '../css/ComponentsCss/Sidebar.scss';

const Sidebar = ({ComponentClick ,Loggedinuserdata}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [lastclicked, setLastClicked] = useState(null);

  const handleSetLastClicked = (value) => {
    setLastClicked(value);
    setIsSidebarVisible(false);
  };


  return (
    <>
      {/* Floating menu button */}
      <div className="floating-menu" onClick={() => setIsSidebarVisible(true)}>
        <i className="fa-solid fa-bars"></i>
      </div>

      {/* Sidebar */}
      <div 
        className={`sidebar ${isSidebarVisible ? 'visible' : ''}`} 
      >
        <button
         className='close_menu' onClick={() => setIsSidebarVisible(false)}><i className="fa-solid fa-xmark"></i>
        </button>

        <div className='primary_btn'>
          {Loggedinuserdata?.role !== 'caregiver' ? (
            <>
              <button
               className={lastclicked === 'profile' ? 'active' : ''} onClick={() => { ComponentClick('profile'); handleSetLastClicked('profile'); }}>פרופיל <i className="fa-regular fa-id-card"></i>
              </button>
              <button 
                className={lastclicked === 'HomePage' ? 'active' : ''} onClick={() => { ComponentClick('HomePage'); handleSetLastClicked('HomePage'); }}>דף הבית <i className="fa-solid fa-house"></i>
              </button>
              <button 
                className={lastclicked === 'videos' ? 'active' : ''} onClick={() => { ComponentClick('videos'); handleSetLastClicked('videos'); }}>סרטונים <i className="fa-solid fa-film"></i>
              </button>
            </>
          ) : (
            <>
              <button 
                className={lastclicked === 'profile' ? 'active' : ''} onClick={() => { ComponentClick('profile'); handleSetLastClicked('profile'); }}>פרופיל <i className="fa-solid fa-user"></i>
              </button>
              <button
               className={lastclicked === 'cgHomePage' ? 'active' : ''} onClick={() => { ComponentClick('cgHomePage'); handleSetLastClicked('cgHomePage'); }}>דף הבית 
              </button>
              <button
                className={lastclicked === 'patientManagment' ? 'active' : ''} onClick={() => { ComponentClick('patientManagment'); handleSetLastClicked('patientManagment'); }}>ניהול מטופלים <i className="fa-solid fa-user-shield"></i>
              </button>
              <button 
                className={lastclicked === 'manual' ? 'active' : ''} onClick={() => { ComponentClick('manual'); handleSetLastClicked('manual'); }}>הדרכת שימוש באתר
              </button>
            </>
          )}
        </div>
        {Loggedinuserdata?.role !== 'caregiver' ? (
          <>
            <h3>משחקים <i className="fa-solid fa-brain"></i></h3>
            <div className='games_btn'>
              <button
               className={lastclicked === 'Catch5Game' ? 'active' : ''} onClick={() => { ComponentClick('Catch5Game'); handleSetLastClicked('Catch5Game'); }}>לתפוס 5
              </button>
              <button 
                className={lastclicked === 'QuickMemoryGame' ? 'active' : ''} onClick={() => { ComponentClick('QuickMemoryGame'); handleSetLastClicked('QuickMemoryGame'); }}>משחק זכרון
              </button>
              <button 
                className={lastclicked === 'ColorShadeGame' ? 'active' : ''} onClick={() => { ComponentClick('ColorShadeGame'); handleSetLastClicked('ColorShadeGame'); }}>צבעים
              </button>
              <button 
                className={lastclicked === 'ClockSaccada' ? 'active' : ''} onClick={() => { ComponentClick('ClockSaccada'); handleSetLastClicked('ClockSaccada'); }}>סאקדת שעון
              </button>
              <h3>אימון ראיה <i className="fa-regular fa-eye"></i></h3>
              <button 
                className={lastclicked === 'SmoothPursuitExercise' ? 'active' : ''} onClick={() => { ComponentClick('SmoothPursuitExercise'); handleSetLastClicked('SmoothPursuitExercise'); }}>תנועה חלקה <i></i>
              </button>
            </div>  
          </>
        ) : (
          <div>
            <p>תוכן למטפלים בלבד.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

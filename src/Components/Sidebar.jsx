import React, { act, useState } from 'react';
import '../css/ComponentsCss/Sidebar.scss';
import { useNavigate } from 'react-router-dom'; 
const Sidebar = ({ComponentClick ,Loggedinuserdata,activeUser,setActiveUser}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [lastclicked, setLastClicked] = useState(null);

  const handleSetLastClicked = (value) => {
    setLastClicked(value);
    setIsSidebarVisible(false);
  };
  const navigate = useNavigate(); 


  return (
    <>
        <div className="floating-menu" onClick={() => setIsSidebarVisible(true)}>
          
          <i className="fa-solid fa-bars"></i>
        </div>
        
          <div 
            className={`sidebar ${isSidebarVisible ? 'visible' : ''}`} 
          >
            <button
            
             className='close_menu' onClick={() => setIsSidebarVisible(false)}><i className="fa-solid fa-xmark"></i>
            </button>

            <div className="sidebar-scroll"> 
            <h1 className="main_logo_sbar">SighTrain</h1>
            <div className='primary_btn'>
            

          {/* Guest User */}
          {!Loggedinuserdata && activeUser === "" && (
              <>
                <button 
                  onClick={() => {  navigate('/login'); }}>
                 התחבר <i className="fa-regular fa-id-card"></i>
                </button>
                <button 
                  className={lastclicked === 'HomePage' ? 'active' : ''} 
                  onClick={() => { ComponentClick('HomePage'); handleSetLastClicked('HomePage'); }}>
                  דף הבית <i className="fa-solid fa-house"></i>
                </button>
              </>
            )}

            {/* Patient User (Active User) */}
                  {activeUser !== "" && (
                    <>
                    <button
                      className={lastclicked === 'logout' ? 'active' : ''} 
                      onClick={() => { 
                      handleSetLastClicked('logout'); 
                      setActiveUser(""); 
                      navigate('/home', { state: { patientId: "" } }); 
                      ComponentClick('patientManagment');
                      }}>
                          התנתק ממשתמש {activeUser} <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                          <button 
                           className={lastclicked === 'HomePage' ? 'active' : ''} 
                          onClick={() => { ComponentClick('HomePage'); handleSetLastClicked('HomePage'); }}>דף הבית <i className="fa-solid fa-house"></i>
                </button>
               <button 
                className={lastclicked === 'Statistics' ? 'active' : ''} 
               onClick={() => { ComponentClick('Statistics'); handleSetLastClicked('Statistics'); }}>סטטיסטיקה 
               </button>
                </>
            )}

            {/* Regular User (not caregiver) */}
            {Loggedinuserdata && Loggedinuserdata.role !== 'caregiver'&& (
             <>
               <h3>שלום {Loggedinuserdata.name} </h3>
            <button
                className={lastclicked === 'profile' ? 'active' : ''} 
                onClick={() => { ComponentClick('profile'); handleSetLastClicked('profile'); }}>
                פרופיל <i className="fa-regular fa-id-card"></i>
              </button>
              <button 
              className={lastclicked === 'HomePage' ? 'active' : ''} 
              onClick={() => { ComponentClick('HomePage'); handleSetLastClicked('HomePage'); }}>דף הבית <i className="fa-solid fa-house"></i>
              </button>
              <button 
              className={lastclicked === 'Statistics' ? 'active' : ''} 
              onClick={() => { ComponentClick('Statistics'); handleSetLastClicked('Statistics'); }}>סטטיסטיקה 
              </button>
              

           </> )}


            {/* caregiver User ( caregiver) */}
            {Loggedinuserdata &&  Loggedinuserdata.role == 'caregiver' && activeUser == "" &&(
              <>
                <h3>שלום {Loggedinuserdata.name} </h3>
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
              <button 
                className={lastclicked === 'Test' ? 'active' : ''} onClick={() => { ComponentClick('Test'); handleSetLastClicked('Test'); }}>מבחן למטופל
              </button>
            </> )}

        </div>
        {/* does not display only for caregivers.*/}
        {Loggedinuserdata?.role !== 'caregiver'|| activeUser !== "" ? (
          <>
            <h3>תרגילים <i className="fa-solid fa-brain"></i></h3>
            <div className='games_btn'>
              
              <button 
                className={lastclicked === 'QuickMemoryGame' ? 'active' : ''} onClick={() => { ComponentClick('QuickMemoryGame'); handleSetLastClicked('QuickMemoryGame'); }}> זיכרון חזותי


              </button>
              <button 
                className={lastclicked === 'ColorShadeGame' ? 'active' : ''} onClick={() => { ComponentClick('ColorShadeGame'); handleSetLastClicked('ColorShadeGame'); }}> הבחנת צבעים
              </button>
            
              <button 
                className={lastclicked === 'Scanning' ? 'active' : ''} onClick={() => { ComponentClick('Scanning'); handleSetLastClicked('Scanning'); }}>  סריקה רוחבית
              </button>
              <button 
                className={lastclicked === 'ClockSaccada' ? 'active' : ''} onClick={() => { ComponentClick('ClockSaccada'); handleSetLastClicked('ClockSaccada'); }}> סריקה מעגלית 
              </button>
              <button
               className={lastclicked === 'Catch5Game' ? 'active' : ''} onClick={() => { ComponentClick('Catch5Game'); handleSetLastClicked('Catch5Game'); }}> תגובה ממוקדת
              </button>

              <h3>אימון ראיה <i className="fa-regular fa-eye"></i></h3>
              <button 
                className={lastclicked === 'SmoothPursuitExercise' ? 'active' : ''} onClick={() => { ComponentClick('SmoothPursuitExercise'); handleSetLastClicked('SmoothPursuitExercise'); }}>תנועה חלקה <i></i>
              </button>
            
              <button 
                className={lastclicked === 'videos' ? 'active' : ''} onClick={() => { ComponentClick('videos'); handleSetLastClicked('videos'); }}>סרטונים <i className="fa-solid fa-film"></i>
              </button>
            </div>  
          </>
        ) : (
          <div>
            <p>תוכן למטפלים בלבד.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Sidebar;

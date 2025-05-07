import React, { useState ,useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import HomePage from '../Components/HomePage';
import Catch5Game from '../GameComponents/Catch5';
import RedSquareGame from '../GameComponents/RedSquareGame';
import QuickMemoryGame from '../GameComponents/QuickMemoryGame';
import MatrixGame from '../GameComponents/MatrixGame';
import SmoothPursuitExercise from '../GameComponents/SmoothPursuitExercise';
import ColorShadeGame from '../GameComponents/ColorShadeGame';
import ClockSaccada from '../GameComponents/ClockSaccada';
import Scanning from '../GameComponents/Scanning';
import VideoGallery from '../Components/VideoGallery';
import UserProfile from '../Components/UserProfile';
import Timer from '../Components/Timer';
import Manual from '../Components/manual.jsx';
import CgHomepage from '../Components/CgHomepage.jsx';
import PatientManagement from '../Components/PatientManagment.jsx';
import { getAuth, onAuthStateChanged ,firestore,doc, getDoc} from "../firebase.js";
import MyStats from '../Components/MyStats.jsx';
import { useLocation } from 'react-router-dom';



const MainFrame = () => {
    const location = useLocation();
    const [activeComponent, setActiveComponent] = useState(''); // TODO: navigate to home page based on use.
    const [theme, setTheme] = useState('light');  // light, dark, high-contrast
    const [activeUser, setActiveUser] = useState(location.state.patientId); // TODO: get the active user from the firebase.
    const [user, setUser] = useState(null);


    const toggleTheme = () => {
        setTheme((prevTheme) => 
            prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'high-contrast' : 'light'
        );
    };

    useEffect(() => {
        document.body.className = `main_frame ${theme}`;
    }, [theme]);

    useEffect(() => {
        const fetchUserData = async (userId) => {
            const userDoc = doc(firestore, "users", userId);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUser({
                    id: userData.ID,
                    age: userData.age,
                    createdAt: userData.createdAt,
                    email: userData.email,
                    patients: userData.patients || [],
                    name: userData.name,
                    role: userData.role,
                    gameResults: userData.gameResults || {},
                    department: userData.department || null,
                });
                if(userData.role === "caregiver" && activeUser === "") {
                    setActiveComponent('cgHomePage');
                } else {
                    setActiveComponent('HomePage');
                }
            } else {
                console.error("No such user document!");
            }
        };

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Logged in user:", user.displayName || user.email );
                fetchUserData(user.uid);
        
            } else {
                console.log("No user is logged in.");
                console.log(activeUser);
                setUser(null);
                setActiveComponent('HomePage'); // Set default component to HomePage when no user is logged in
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);
    

    return (
        <div >
            <div class="controllers">
                <button onClick={toggleTheme}>
                    {theme === 'light' && 'שנה תצוגה לחשוך'}
                    {theme === 'dark' && 'שנה תצוגה לכחול'}
                    {theme === 'high-contrast' && 'שנה תצוגה ללבן'}
                </button>
                <Timer />
            </div>

            <Sidebar ComponentClick={setActiveComponent} Loggedinuserdata={user} activeUser={activeUser} setActiveUser={setActiveUser}  /> 

            <main>
                <h1 className="main_logo">SighTrain</h1>
                <h3 >
                    {activeUser !== "" ? `ברוכים הבאים משתמש מספר ${activeUser}` : ""}
                </h3>

                {activeComponent === 'profile' && <UserProfile Loggedinuserdata={user}/>}
                {activeComponent === 'patientManagment' && <PatientManagement setActiveUser={setActiveUser} ComponentClick={setActiveComponent} Loggedinuserdata={user}/>}
                {activeComponent === 'HomePage' && <HomePage/>}
                {activeComponent === 'cgHomePage' && <CgHomepage ComponentClick={setActiveComponent} />}
                {activeComponent === 'manual' && <Manual />}
                {activeComponent === 'Catch5Game' && <Catch5Game activeUser={activeUser} />}
                {activeComponent === 'RedSquareGame' && <RedSquareGame  />}
                {activeComponent === 'QuickMemoryGame' && <QuickMemoryGame  activeUser={activeUser} />}
                {activeComponent === 'MatrixGame' && <MatrixGame />}
                {activeComponent === 'SmoothPursuitExercise' && <SmoothPursuitExercise  activeUser={activeUser} />}
                {activeComponent === 'ColorShadeGame' && <ColorShadeGame  activeUser={activeUser} />}
                {activeComponent === 'ClockSaccada' && <ClockSaccada  activeUser={activeUser}/>} 
                {activeComponent === 'Scanning' && <Scanning  activeUser={activeUser}/>} 
                {activeComponent === 'videos' && <VideoGallery />}
                {activeComponent === 'Statistics' && <MyStats Loggedinuserdata={user} activeUser={activeUser} />}
            </main>
        </div>
    );
};

export default MainFrame;

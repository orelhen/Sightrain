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

const MainFrame = () => {
    const [activeComponent, setActiveComponent] = useState('HomePage'); // TODO: navigate to home page based on use.
    const [theme, setTheme] = useState('light');  // light, dark, high-contrast

    const toggleTheme = () => {
        setTheme((prevTheme) => 
            prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'high-contrast' : 'light'
        );
    };

    const [user, setUser] = useState(null);

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
                    hospital: userData.hospital,
                    name: userData.name,
                    role: userData.role,
                    gameResults: userData.gameResults || {},
                });
            } else {
                console.error("No such user document!");
            }
        };

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Logged in user:", user.displayName || user.email);
                fetchUserData(user.uid);
            } else {
                console.log("No user is logged in.");
                setUser(null);
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

            <Sidebar ComponentClick={setActiveComponent} Loggedinuserdata={user} /> 

            <main>
                <h1 className="main_logo">SighTrain</h1>
                {activeComponent === 'profile' && <UserProfile Loggedinuserdata={user}/>}
                {activeComponent === 'patientManagment' && <PatientManagement/>}
                {activeComponent === 'HomePage' && <HomePage/>}
                {activeComponent === 'cgHomePage' && <CgHomepage/>}
                {activeComponent === 'manual' && <Manual />}
                {activeComponent === 'Catch5Game' && <Catch5Game />}
                {activeComponent === 'RedSquareGame' && <RedSquareGame />}
                {activeComponent === 'QuickMemoryGame' && <QuickMemoryGame />}
                {activeComponent === 'MatrixGame' && <MatrixGame />}
                {activeComponent === 'SmoothPursuitExercise' && <SmoothPursuitExercise />}
                {activeComponent === 'ColorShadeGame' && <ColorShadeGame />}
                {activeComponent === 'ClockSaccada' && <ClockSaccada/>} 
                {activeComponent === 'Scanning' && <Scanning/>} 

                {activeComponent === 'videos' && <VideoGallery />}
            </main>
        </div>
    );
};

export default MainFrame;

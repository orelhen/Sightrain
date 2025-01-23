import React, { useState ,useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import HomePage from '../Components/HomePage';
import Catch5Game from '../GameComponents/Catch5';
import RedSquareGame from '../GameComponents/RedSquareGame';
import QuickMemoryGame from '../GameComponents/QuickMemoryGame';
import MatrixGame from '../GameComponents/MatrixGame';
import SmoothPursuitExercise from '../GameComponents/SmoothPursuitExercise';
import DepthPerceptionTrainer from '../GameComponents/DepthPerceptionTrainer';

import VideoGallery from '../Components/VideoGallery';
import UserProfile from '../Components/UserProfile';
import Timer from '../Components/Timer';



const MainFrame = () => {
    const [activeGame, setActiveGame] = useState('main');
    const [theme, setTheme] = useState('light');  // light, dark, high-contrast

    const toggleTheme = () => {
        setTheme((prevTheme) => 
            prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'high-contrast' : 'light'
        );
    };

    useEffect(() => {
        document.body.className = `main_frame ${theme}`;
    }, [theme]);

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

            <Sidebar onGameClick={setActiveGame} />

            <main>
                <h1 className="main_logo">SighTrain</h1>
                {activeGame === 'profile' && <UserProfile />}
                {activeGame === 'main' && <HomePage />}
                {activeGame === 'game1' && <Catch5Game />}
                {activeGame === 'game2' && <RedSquareGame />}
                {activeGame === 'game3' && <QuickMemoryGame />}
                {activeGame === 'game4' && <MatrixGame />}
                {activeGame === 'game5' && <SmoothPursuitExercise />}
                {activeGame === 'game6' && <DepthPerceptionTrainer />}
                {activeGame === 'videos' && <VideoGallery />}
            </main>
        </div>
    );
};

export default MainFrame;

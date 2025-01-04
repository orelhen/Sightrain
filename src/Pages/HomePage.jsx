import React, { useState } from 'react';
import '../css/HomePage.css';
import Sidebar from '../Components/Sidebar';
import MainFrame from '../Components/MainFrame';
import Catch5Game from '../GameComponents/Catch5';
import RedSquareGame from '../GameComponents/RedSquareGame';
import QuickMemoryGame from '../GameComponents/QuickMemoryGame';
import MatrixGame from '../GameComponents/MatrixGame';  // Import Game 4 (MatrixGame)
import VideoGallery from '../Components/VideoGallery';
import UserProfile from '../Components/UserProfile';
import Timer from '../Components/Timer'; 

const HomePage = () => {
    const [activeGame, setActiveGame] = useState('main');

    const handleGameClick = (gameId) => {
        setActiveGame(gameId);
    };


    return (
        <div className="homepage">
            <Sidebar onGameClick={handleGameClick} />
            <Timer />
                <main className="main-content">
                <h1 className="main_logo">Sightrain</h1>
                    {activeGame === 'profile' && <UserProfile />}
                    {activeGame === 'main' && <MainFrame />}
                    {activeGame === 'game1' && <Catch5Game />}
                    {activeGame === 'game2' && <RedSquareGame />}
                    {activeGame === 'game3' && <QuickMemoryGame />}
                    {activeGame === 'game4' && <MatrixGame />}
                    {activeGame === 'videos' && <VideoGallery />}
                </main>
        </div>
    );
};

export default HomePage;

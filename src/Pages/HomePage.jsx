import React, { useState } from 'react';
import './HomePage.css';
import Sidebar from '../Components/Sidebar';
import Catch5Game from '../GameComponents/Catch5';
import RedSquareGame from '../GameComponents/RedSquareGame';
import QuickMemoryGame from '../GameComponents/QuickMemoryGame';
import MatrixGame from '../GameComponents/MatrixGame';  // Import Game 4 (MatrixGame)

const HomePage = () => {
    const [activeGame, setActiveGame] = useState(null);

    const handleGameClick = (gameId) => {
        setActiveGame(gameId);
    };

    return (
        <div className="homepage">
            <Sidebar onGameClick={handleGameClick} />
            <div className="container">
                <main className="main-content">
                    <h1 className="main_logo">Sightrain</h1>
                    {activeGame === 'game1' && <Catch5Game />}
                    {activeGame === 'game2' && <RedSquareGame />}
                    {activeGame === 'game3' && <QuickMemoryGame />}
                    {activeGame === 'game4' && <MatrixGame />}
                </main>
            </div>
        </div>
    );
};

export default HomePage;

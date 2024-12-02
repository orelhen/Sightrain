import React, { useRef, useState, useEffect } from 'react';
import './HomePage.css';
import Sidebar from '../Components/Sidebar';
import Catch5Game from '../Components/Catch5';

const HomePage = () => {
    useEffect(() => {
        // Add any side effects or initializations here if needed
    }, []);

    return (
        <div className="homepage">
            <Sidebar />
            <div className="container">
                <main className="main-content">
                    <h1 className="main_logo">Sightrain </h1> {/* Apply hoverable class here */}
                    <Catch5Game></Catch5Game>
                </main>
            </div>
            
        </div>
    );
};

export default HomePage;

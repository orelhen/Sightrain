import React, { useRef, useState, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
    useEffect(() => {
        // Add any side effects or initializations here if needed
    }, []);

    return (
        <div className="homepage">
            <div className="container">
                <main className="main-content">
                    <h1 className="main_logo">Vision</h1> {/* Apply hoverable class here */}
                </main>
            </div>
        </div>
    );
};

export default HomePage;

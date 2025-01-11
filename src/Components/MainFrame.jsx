import React from 'react';
import '../css/ComponentsCss/MainFrame.css';

const MainFrame = () => {
    return (
        <div className="home-container" id="home">
            {/* About Us Section */}
            <section className="hero-section">
                <h2>Welcome to SighTrain</h2>
                <p>
                    At SighTrain, we’re revolutionizing the way minds and eyes work together. 
                    Our platform blends science, technology, and engaging experiences to create a space where progress is not only achievable but enjoyable. 
                    Whether you’re exploring interactive games or guided video sessions, SighTrain is here to help strengthen connections and inspire growth.
                </p>
            </section>
            
            {/* Features Section */}
            <section className="hero-section" id="features">
                <h2>What Makes SighTrain Unique?</h2>
                <ul className="benefits-list">
                    <li>Dynamic eye-training games that challenge and entertain</li>
                    <li>Curated video sessions to enhance focus and coordination</li>
                    <li>Real-time progress tracking with insightful data</li>
                    <li>Accessible from anywhere with a user-friendly design</li>
                </ul>
            </section>

            {/* Call to Action Section */}

            <section className="hero-section video">
                <h2>See SighTrain in Action</h2>
                <video controls className="highlight-video">...</video>
            </section>

            <section className="hero-section faq">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-item">...</div>
            </section>
            <section className="hero-section call-to-action">
                <h2>Hop On Board with SighTrain</h2>
                <p>
                    Join the journey to better connections. With SighTrain you’re unlocking your eyes potential.
                </p>
                <button className="cta-button">Get Started</button>
            </section>
        </div>
    );
};

export default MainFrame;

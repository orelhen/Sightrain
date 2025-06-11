import React, { useState, useEffect } from 'react';
import '../css/GamesCss/Games.scss';
import { getAuth, firestore, doc, getDoc, setDoc } from '../firebase.js';
import AlertDialog from '../Components/Alert';
import QuickMemoryGame from './QuickMemoryGame';
import Scanning from './Scanning';
import ColorShadeGame from './ColorShadeGame';

const Test = ({ activeUser }) => {
    const [currentGameIndex, setCurrentGameIndex] = useState(0);
    const [testResults, setTestResults] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    // List of games to test in order - switched Scanning and ColorShadeGame
    const games = [
        'QuickMemoryGame',
        'ColorShadeGame',
        'Scanning'
    ];

    // Handler for when a game test is completed
    const handleGameComplete = (gameName, results) => {
        setTestResults(prev => ({
            ...prev,
            [gameName]: results
        }));
        
        // Move to next game or show summary if all games completed
        if (currentGameIndex < games.length - 1) {
            setCurrentGameIndex(currentGameIndex + 1);
        } else {
            setShowSummary(true);
        }
    };


    const restartTest = () => {
        setCurrentGameIndex(0);
        setTestResults({});
        setShowSummary(false);
    };

    const renderGameComponent = () => {
        const currentGame = games[currentGameIndex];
        
        switch (currentGame) {
            case 'QuickMemoryGame':
                return (
                    <QuickMemoryGame 
                        activeUser={activeUser} 
                        IsTest={true} 
                        onTestComplete={(results) => handleGameComplete('QuickMemoryGame', results)} 
                    />
                );
            case 'ColorShadeGame':
                return (
                    <ColorShadeGame 
                        activeUser={activeUser} 
                        IsTest={true} 
                        onTestComplete={(results) => handleGameComplete('ColorShadeGame', results)} 
                    />
                );
            case 'Scanning':
                return (
                    <Scanning 
                        activeUser={activeUser} 
                        IsTest={true} 
                        onTestComplete={(results) => handleGameComplete('Scanning', results)} 
                    />
                );
            default:
                return null;
        }
    };

    const renderSummary = () => {
        return (
            <div className="test-summary">
                <h2>סיכום המבחן</h2>
                
                {Object.keys(testResults).map(gameName => (
                    <div key={gameName} className="game-result">
                        <h3>{getGameHebrewName(gameName)}</h3>
                        {renderGameSpecificResults(gameName, testResults[gameName])}
                    </div>
                ))}
                
                <div className="summary-actions">
                    <button onClick={restartTest}>התחל מבחן חדש</button>
                </div>
            </div>
        );
    };

    const getGameHebrewName = (gameName) => {
        switch (gameName) {
            case 'QuickMemoryGame': return 'משחק זכרון מהיר';
            case 'Scanning': return 'משחק סריקה';
            case 'ColorShadeGame': return 'משחק גווני צבע';
            default: return gameName;
        }
    };

    const renderGameSpecificResults = (gameName, results) => {
        if (!results) return <p>אין נתונים זמינים</p>;

        switch (gameName) {
            case 'QuickMemoryGame':
                return (
                    <div>
                        <p>רמות שעברו: {results.finalLevel}</p>
                        <p>מספר ספרות: {results.digits}</p>
                        <p>גודל טקסט: {results.fontSize}</p>
                        <p>זמן תצוגה: {results.difficulty} מ"ש</p>
                    </div>
                );
                case 'ColorShadeGame':
                return (
                    <div>
                        <p>רמות שעברו: {results.finalLevel}</p>
                        <p>הבדל גוון: {results.shadeDifference}%</p>
                        <p>גודל אריח: {results.tileSize}</p>
                    </div>
                );

            case 'Scanning':
                return (
                    <div>
                        <p>רמות שעברו: {results.finalLevel}</p>
                        <p>מהירות סריקה: {results.speed}</p>
                        <p>מספר פריטים: {results.items}</p>
                    </div>
                );
            default:
                return <p>תוצאות המשחק: {JSON.stringify(results)}</p>;
        }
    };

    return (
        <div className="test-container">
            {!showSummary ? (
                <div>
                    <div className="test-progress">
                        <h3>מבדק: {currentGameIndex + 1} מתוך {games.length}</h3>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{width: `${(currentGameIndex / games.length) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                    
                    {renderGameComponent()}
                </div>
            ) : (
                renderSummary()
            )}
            
            {showAlert && (
                <AlertDialog 
                    open={showAlert} 
                    title="הודעת מערכת"
                    message={message}
                    onClose={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};

export default Test;
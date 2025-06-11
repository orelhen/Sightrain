import React, { useState } from 'react';
import { firestore, addDoc, collection } from '../firebase.js';
import AlertDialog from './Alert.jsx';    

const FeedbackForm = ({ onClose, collectionName = 'feedback' }) => {
    const [feedback, setFeedback] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const handleFeedbackSubmit = async () => {
        try {
            const feedbackCollection = collection(firestore, collectionName);
            await addDoc(feedbackCollection, {
                feedback: feedback,
                timestamp: new Date().toISOString()
            });
            console.log('Feedback submitted successfully');
            setFeedback('');
            setShowAlert(true);
           
           
            // Reset the form fields after showing the alert
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div className="report_form">
            <h2>טופס משוב</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="דעתך חשובה לנו! אנא שתף אותנו בכל מה שתרצה לשפר או להוסיף"
                    rows="4"
                />
                <div className="button-group">
                    <button onClick={onClose}>סגור</button>

                    <button 
                        onClick={handleFeedbackSubmit} 
                        disabled={feedback.length <= 8}
                    >
                        שלח משוב
                    </button>

                    
                    {showAlert && (
                        <AlertDialog
                            message="תודה רבה! המשוב שלך נקלט בהצלחה"
                            onClose={() => {
                                setShowAlert(false);
                                onClose();
                            }}
                        />
                    )}
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
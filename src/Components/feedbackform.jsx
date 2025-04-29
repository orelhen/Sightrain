import React, { useState } from 'react';
import { firestore, addDoc, collection } from '../firebase.js';

const FeedbackForm = ({ onClose, collectionName = 'feedback' }) => {
    const [feedback, setFeedback] = useState('');

    const handleFeedbackSubmit = async () => {
        try {
            const feedbackCollection = collection(firestore, collectionName);
            await addDoc(feedbackCollection, {
                feedback: feedback,
                timestamp: new Date().toISOString()
            });
            console.log('Feedback submitted successfully');
            setFeedback('');
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div>
            <h3>טופס משוב</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="דעתך חשובה לנו! אנא שתף אותנו בכל מה שתרצה לשפר או להוסיף"
                    rows="4"
                />
                <div className="button-group">
                    <button onClick={onClose}>סגור</button>
                    <button onClick={handleFeedbackSubmit}>שלח משוב</button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
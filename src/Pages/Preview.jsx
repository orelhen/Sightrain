import React from 'react';
import HomePage from '../Components/HomePage';
import SmoothPursuitExercise from '../GameComponents/SmoothPursuitExercise';
/**
 * Preview component
 * Simply renders the HomePage component as a preview
 */
const Preview = () => {
    return (
        <div className="preview-container">
            <HomePage />
        </div>
    );
};

export default Preview;
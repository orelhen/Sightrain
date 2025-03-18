import React from 'react';
import '../css/ComponentsCss/VideoGallery.css';

const VideoGallery = () => {
    const videos = [
        {
            title: "Lazy Eye Exercises / Lazy eye Training / Eye exercise to improve Vision",
            description: "In order to regain sight, it is highly recommended to do eye exercises. Doing eye exercises regularly can help you to improve the eyesight or Lazy eye. Your eyes will work in full force and it will give you an opportunity to see the world better..",
            link: "https://www.youtube.com/embed/mqXR8O2VJLo?si=ISTEAFacKTsvevAS" // Replace with your YouTube embed link
        },
        {
            title: "DARKMODE FPS Eye Training Warmup",
            description: "a warmup that was high-resolution and didn't have little errors in it. Practicing eye tracking and training your eyes can improve focus, reading speed, visual perception, and can improve cognitive abilities.",
            link: "https://www.youtube.com/embed/gCR5EbuNcIE?si=EXmyYkGmyonCYFZb" // Replace with your YouTube embed link
        },
        {
            title: "Eye Exercises - Eye Exercises to improve Vision - Vision Therapy",
            description: "How to improve vision? Our eye exercises are also ideal for people with good eyesight. Various eye care techniques can help you avoid dryness, fatigue,  computer vision syndrome, eye redness and problems caused by the constant use of computers and smartphones in work and daily life.",
            link: "https://www.youtube.com/embed/A3v5F2by_u4?si=ZG3g1634CwujIvfy" // Replace with your YouTube embed link
        },
        {
            title: "Eye Exercises - Loss of orientation exercise",
            description: "Use only one eye, Cover your healthy eye. 1 or 2 feet distance from the screen, depending on screen size.Keep focus on the red dot at all times.Full screen display. Try using a big monitor, or a 10'' tablet, but keep your head closer to it.Dark room.If you use glasses wear them while watching this.",
            link: "https://www.youtube.com/embed/iJeY3XOZlBs?si=MMB7UleVYnqsCQl1" // Replace with your YouTube embed link
        }
        
    ];

    return (
        <div className="video-gallery">
            <h2>Explore Eye Trainin Videos</h2>
            <div className="videos-container">
                {videos.map((video, index) => (
                    <div className="video-card" key={index}>
                        <iframe
                            width="100%"
                            height="200"
                            src={video.link}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <h3>{video.title}</h3>
                        <p>{video.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoGallery;

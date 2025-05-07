// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import MainFrame from './Pages/MainFrame';
import './css/PagesCss/App.css';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/>} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<MainFrame />} />
            </Routes>
        </Router>
    );
};
//  cursor: url('/public/images/cursor.svg'), auto;

export default App;

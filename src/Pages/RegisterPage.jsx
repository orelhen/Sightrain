import React, { useState } from 'react';
import '../css/PagesCss/Register.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [receiveNews, setReceiveNews] = useState(false);
    const [fullName, setFullName] = useState('');
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateFullName = (name) => {
        const nameRegex = /^[A-Za-z\s]{1,20}$/;
        return nameRegex.test(name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!validateFullName(fullName)) {
            newErrors.fullName = 'Full name must be between 1 and 20 characters and contain only letters and spaces.';
        }

        if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format.';
        }

        if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, and one number.';
        }

        if (dateOfBirth) {
            const today = new Date();
            const dob = new Date(dateOfBirth);
            if (dob >= today) {
                newErrors.dateOfBirth = 'Date of Birth must be in the past.';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullName,
                dateOfBirth,
                gender,
                email,
                password,
                receiveNews
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setServerMessage('Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = '/login';  // Redirects without `react-router-dom`
                    }, 2000);
                } else {
                    setServerMessage(data.message || 'Registration failed.');
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                setServerMessage('An error occurred. Please try again.');
            });
    };

    return (
        <section className="registration-section">
            <div className="registration-container">
                <div className="registration-form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="reg_main">
                            <h2>Register</h2>
                            <label htmlFor="fullName">Full Name
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                                {errors.fullName && <p className="error-message">{errors.fullName}</p>}
                            </label>

                            <label htmlFor="email">Email
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {errors.email && <p className="error-message">{errors.email}</p>}
                            </label>

                            <label htmlFor="password">Password
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {errors.password && <p className="error-message">{errors.password}</p>}
                            </label>

                            <label htmlFor="dateOfBirth">Date of Birth (optional)
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                />
                                {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth}</p>}
                            </label>

                            <label htmlFor="gender">Gender
                                <select
                                    id="gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="else">Else</option>
                                </select>
                            </label>


                            <div className="receive-emails">
                                <label htmlFor="receiveNews">
                                    <input
                                        type="checkbox"
                                        id="receiveNews"
                                        checked={receiveNews}
                                        onChange={(e) => setReceiveNews(e.target.checked)}
                                    />
                                    Interested in receiving news?
                                </label>
                            </div>
                        </div>

                        <div className="reg_btn_container">
                            <button type="submit">Register</button>
                            {serverMessage && <p className="server-message">{serverMessage}</p>}
                            <p>
                                Have an account?
                                <a href="/home" className="register-link"> Login</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default RegisterPage;

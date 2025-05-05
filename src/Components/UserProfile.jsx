import '../css/ComponentsCss/UserProfile.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut ,firestore,doc, getDoc,setDoc} from "../firebase.js";
import PatientManagement from './PatientManagment.jsx';
import MyStats from './MyStats.jsx';

const UserProfile = ({Loggedinuserdata}) => {
  //**********add dinamic user db 
  const [user, setUser] = useState(Loggedinuserdata);

  const navigate = useNavigate();
  const auth = getAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <h2>משתמש לא מחובר</h2>
        <button onClick={() => navigate('/login')}>התחבר</button>
      </div>
    );
  }

 
  //***********add dinamic user information
  return (
    <div className="profile-container">
      <h2>הפרופיל שלי</h2>

      {user?.photo && (
        <img
          src={user.photo}
          alt="User Profile"
          className="profile-image"
        />
      )}

      <p className="profile-info">
        <strong>תעודת זהות:</strong> {user?.id}
      </p>
      <p className="profile-info">
        <strong>שם מלא:</strong> {user?.name}
      </p>
      <p className="profile-info">
        <strong>כתובת מייל:</strong> {user?.email}
      </p>
      <p className="profile-info">
        <strong>גיל:</strong> {user?.age}
      </p>
      {user?.role === "caregiver" && (
        <>
          <p className="profile-info">
            <strong>בה"ח:</strong> {user?.hospital}
          </p>
          <p className="profile-info">
            <strong>תפקיד:</strong> {user?.role}
          </p>
        </>
      )}
      <button onClick={handleLogout}>התנתק</button>

    
    </div>
  );
};

export default UserProfile;

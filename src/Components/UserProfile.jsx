import '../css/ComponentsCss/UserProfile.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut ,firestore,doc, getDoc} from "../firebase.js";
const UserProfile = () => {

  //**********add dinamic user db 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();


  //fetch logged in user data
  useEffect(() => {
    const fetchUserData = async (userId) => {
      const userDoc = doc(firestore, "users", userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUser({
          id: userData.ID,
          age: userData.age,
          createdAt: userData.createdAt,
          email: userData.email,
          hospital: userData.hospital,
          name: userData.name,
          role: userData.role,
        });
      } else {
        console.error("No such user document!");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);


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
      <p className="profile-info">
        <strong>בה"ח:</strong> {user?.hospital}
      </p>
      <p className="profile-info">
        <strong>תפקיד:</strong> {user?.role}
      </p>
      <button onClick={handleLogout}>התנתק</button>
      <button>הדפס סיכום</button>
      </div>
    );
  };

export default UserProfile;

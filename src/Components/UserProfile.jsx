import '../css/ComponentsCss/UserProfile.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getAuth, onAuthStateChanged, signOut ,firestore,doc, getDoc,setDoc} from "../firebase.js";

const UserProfile = () => {

  //**********add dinamic user db 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientLastLogin, setNewPatientLastLogin] = useState('');

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
          patients: userData.patients || [],
          hospital: userData.hospital,
          name: userData.name,
          role: userData.role,
          gameResults: userData.gameResults || null, // Ensure gameResults is included
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

    // Handlers for adding and removing patients
    const handleAddPatient = async () => {
      try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
        const userDoc = doc(firestore, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const updatedPatients = {
          ...userData.patients,
          [newPatientId]: {
            id: newPatientId,
            name: newPatientName
                    },
          };

          await setDoc(userDoc, { patients: updatedPatients }, { merge: true });
          console.log("Patient added successfully!");
          setNewPatientId('');
          setNewPatientName('');
          setNewPatientLastLogin('');
          setShowAddPatientForm(false);
        } else {
          console.error("No such user document!");
        }
        } else {
        alert("אנא התחבר למשתמש על מנת להוסיף מטופל.");
        console.error("No user is logged in!");
        }
      });

      return () => unsubscribe();
      } catch (error) {
      console.error("Error adding patient:", error);
      }
    };
    
    const handleRemovePatient = async (patientId) => {
      try {
        
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = doc(firestore, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedPatients = { ...userData.patients };
        
        // Ensure the patient exists before attempting to delete
        if (updatedPatients[patientId]) {
          delete updatedPatients[patientId];

          // Update the database
          await setDoc(userDoc, { patients: updatedPatients }, { merge: true });
          console.log(`Patient with ID: ${patientId} removed successfully from Firebase!`);
          
          // Update the local state
          setUser((prevUser) => ({
          ...prevUser,
          patients: updatedPatients,
          }));
        } else {
          console.error(`Patient with ID: ${patientId} does not exist in Firebase.`);
        }
        } else {
        console.error("No such user document in Firebase!");
        }
      } else {
        alert("אנא התחבר למשתמש על מנת להסיר מטופל.");
        console.error("No user is logged in!");
      }
      } catch (error) {
      console.error(`Error removing patient with ID: ${patientId} from Firebase`, error);
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

 

};

export default UserProfile;

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
      {user?.role === "caregiver" && (
        <div>
          <button onClick={() => setShowSummary((prev) => !prev)}>
            {showSummary ? "סגור ניהול מטופלים" : "ניהול מטופלים"}
          </button>
          {showSummary && (
            <div className="summary-table">
              <h3>רשימת מטופלים</h3>
              <table>
                <thead>
                  <tr>
                    <th>תעודת זהות</th>
                    <th>שם</th>
                    <th>כניסה אחרונה</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(user.patients || {}).map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.lastLogin}</td>
                      <td>
                      <button>
                        התחבר למטופל
                      </button>
                      <button onClick={() => handleRemovePatient(patient.id)}>
                        הסר מטופל
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setShowAddPatientForm((prev) => !prev)}>
                {showAddPatientForm ? "בטל הוספת מטופל" : "הוסף מטופל חדש"}
              </button>
              {showAddPatientForm && (
                <div className="add-patient-form">
                  <h4>הוסף מטופל חדש</h4>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <label>
                      תעודת זהות:
                      <input
                        type="text"
                        value={newPatientId}
                        onChange={(e) => setNewPatientId(e.target.value)}
                      />
                    </label>
                    <label>
                      שם:
                      <input
                        type="text"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                      />
                    </label>
                 
                    <button type="button" onClick={() => handleAddPatient()}>
                      שמור מטופל
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {user?.role !== "caregiver" && (
        <button onClick={() => setShowSummary((prev) => !prev)}>
          {showSummary ? "סגור סיכום" : "הצג סיכום"}
        </button>
      )}
      {showSummary && user?.role !== "caregiver" && (
        <div className="summary-table">
          <h3>סיכום תוצאות משחקים</h3>
          {user?.gameResults ? (
            <div>
              <h4>בחר תאריך:</h4>
              <ul className="session-list">
                {Object.keys(user.gameResults).map((session) => (
                  <li key={session}>
                    <button
                      onClick={() =>
                        setSelectedSession((prevSession) =>
                          prevSession === session ? null : session
                        )
                      }
                    >
                      {session}
                    </button>
                  </li>
                ))}
              </ul>

              {selectedSession && (
                <div>
                  <h4>תוצאות עבור תאריך: {selectedSession}</h4>
                  {user.gameResults[selectedSession].QuickMemoryGame && (
                    <div>
                      <h5>תוצאות משחק זיכרון מהיר:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>סיבוב</th>
                            <th>מספר</th>
                            <th>קלט</th>
                            <th>נכון</th>
                            <th>רמת קושי</th>
                            <th>גודל גופן</th>
                            <th>ריווח</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].QuickMemoryGame.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.round}</td>
                                <td>{game.number}</td>
                                <td>{game.input}</td>
                                <td>{game.isCorrect ? "✔️" : "❌"}</td>
                                <td>{game.difficulty || "N/A"}</td>
                                <td>{game.fontSize || "N/A"}</td>
                                <td>{game.spacing || "N/A"}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {user.gameResults[selectedSession].Catch5Game && (
                    <div>
                      <h5>תוצאות משחק Catch5:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>זמן תגובה ממוצע</th>
                            <th>מיקום תיבה</th>
                            <th>גודל תיבה</th>
                            <th>לחיצות נכונות</th>
                            <th>רמת קושי</th>
                            <th>לחיצות שגויות</th>
                            <th>מספר הופעות של חמש</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].Catch5Game.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.averageReactionTime}</td>
                                <td>{game.boxPosition}</td>
                                <td>{game.boxSize}</td>
                                <td>{game.correctClicks}</td>
                                <td>{game.difficulty}</td>
                                <td>{game.missClicks}</td>
                                <td>{game.timesFiveShown}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {user.gameResults[selectedSession].ColorShadeGame && (
                    <div>
                      <h5>תוצאות משחק ColorShade:</h5>
                      <table>
                        <thead>
                          <tr>
                            <th>מספר כדורים</th>
                            <th>גודל כדור</th>
                            <th>תשובות נכונות</th>
                            <th>תשובות שגויות</th>
                            <th>רמת קושי</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.gameResults[selectedSession].ColorShadeGame.map(
                            (game, index) => (
                              <tr key={index}>
                                <td>{game.ballCount}</td>
                                <td>{game.ballSize}</td>
                                <td>{game.correctAnswers}</td>
                                <td>{game.incorrectAnswers}</td>
                                <td>{game.difficulty}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>אין תוצאות משחק להצגה</p>
          )}
        </div>
      )}
    </div>
  );


};

export default UserProfile;

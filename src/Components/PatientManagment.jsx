import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore, doc, getDoc, setDoc,updateDoc,deleteField,collection,getDocs,deleteDoc } from '../firebase.js';
import MyStats from './MyStats.jsx';
import { useNavigate } from 'react-router-dom'; 
import ConfirmDialog from './ConfirmDialog.jsx';
import AlertDialog from './Alert.jsx';   


const PatientManagement = ({setActiveUser,ComponentClick,Loggedinuserdata}) => {
    const [user, setUser] = useState(Loggedinuserdata);
    const [activeUser, setActiveUserState] = useState('');
    const [showAddPatientForm, setShowAddPatientForm] = useState(false);
    const [newPatientId, setNewPatientId] = useState('');
    const [newPatientName, setNewPatientName] = useState('');
    const auth = getAuth();
    const [dispplayStats, setDisplayStats] = useState(false);
    const [showInactiveUsers, setShowInactiveUsers] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();



    const fetchPatientsData = async () => {
        // Get all patients documents from the patients collection
        const patientsCollection = collection(firestore, 'patients');
        const patientsSnapshot = await getDocs(patientsCollection);
        if (!patientsSnapshot.empty) {
            const patientsData = {};
            patientsSnapshot.forEach(doc => {
                const patientData = doc.data();
                patientsData[doc.id] = patientData;
            });
            setUser({
                patients: patientsData
            });
        } else {
            setUser({ patients: {} });
            console.log('No patients found');
        }
        };;


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                fetchPatientsData();
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, [auth]);



    const handleAddPatient = async () => {
        try {

            const patientDoc = doc(firestore, "patients", newPatientId);
                  
                  const patientSnapshot = await getDoc(patientDoc);
                  const NewPatient = {
                        id: newPatientId,
                        name: newPatientName,
                        dateAdded: new Date().toISOString(),
                        isActive: "true",
                        department: Loggedinuserdata.department,
                    };
                
                  if (!patientSnapshot.exists()) {
                    await setDoc(patientDoc, NewPatient);
                    console.log("Patient document created successfully!");
                  } else {
                    setShowAlert(true);
                    // Reset the form fields after showing the alert
                    setNewPatientId('');
                    setNewPatientName('');
                  }
                 
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    };


    const loginToPatient = async (patientId) => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDoc = doc(firestore, 'patients',patientId);
                const currentDate = new Date().toISOString();
                
                // Update the lastLoggedin field for the specific patient
                await updateDoc(userDoc, {
                    lastLoggedin: currentDate
                });
                console.log(`Updated last login for patient ${patientId} to ${currentDate}`);
               
            }
        } catch (error) {
            console.error('Error updating patient login time:', error);
        }
    };


    const handleDeactivate = async (patientId) => {
        try {
            const patientDoc = doc(firestore, 'patients', patientId);
            // Update the patient document to set isActive to "false"
            await updateDoc(patientDoc, {
                isActive: "false"
            });
            
            console.log(`Patient with ID: ${patientId} marked as inactive`);
            // Update the UI by refreshing the user state
            setUser((prevUser) => {
                const updatedPatients = { ...prevUser.patients };
                if (updatedPatients[patientId]) {
                    updatedPatients[patientId] = {
                        ...updatedPatients[patientId],
                        isActive: "false"
                    };
                }
                return {
                    ...prevUser,
                    patients: updatedPatients
                };
            });
        } catch (error) {
            console.error(`Error deactivating patient: ${patientId}`, error);
        }
    }

    const handleActivate = async (patientId) => {
        try {
            const patientDoc = doc(firestore, 'patients', patientId);
            // Update the patient document to set isActive to "true"
            await updateDoc(patientDoc, {
                isActive: "true"
            });
            console.log(`Patient with ID: ${patientId} marked as active`);
            // Update the UI by refreshing the user state
            setUser((prevUser) => {
                const updatedPatients = { ...prevUser.patients };
                if (updatedPatients[patientId]) {
                    updatedPatients[patientId] = {
                        ...updatedPatients[patientId],
                        isActive: "true"
                    };
                }
                return {
                    ...prevUser,
                    patients: updatedPatients
                };
            });
        } catch (error) {
            console.error(`Error activating patient: ${patientId}`, error);
        }
    };

    const handleRemovePatient = async (patientId) => {
        // Ask for user confirmation before proceeding
        try {
            // Get reference to the patient document in the patients collection
            const patientDoc = doc(firestore, 'patients', patientId);
            
            // Delete the patient document
            await deleteDoc(patientDoc);
            console.log(`Patient with ID: ${patientId} removed successfully!`);
            
            // Update the UI by removing the patient from the state
            setUser((prevUser) => {
                const updatedPatients = { ...prevUser.patients };
                delete updatedPatients[patientId];
                return {
                    ...prevUser,
                    patients: updatedPatients
                };
            });
        } catch (error) {
            console.error(`Error removing patient: ${patientId}`, error);
        }
    };


    // Add useEffect to respond to activeUser changes
    useEffect(() => {
        if (dispplayStats && activeUser) {
            // Force refresh of stats display when activeUser changes
            setDisplayStats(false);
            setTimeout(() => setDisplayStats(true), 0);
        }
    }, [activeUser]);

    
    return (
        <div style={{ maxWidth: '80%',textAlign: 'center', margin: '0 auto', padding: '20px' }} >
            <h2>ניהול מטופלים</h2>
                <div>
                   
                        <div className="summary-table">
                            <h3>רשימת מטופלים-{Loggedinuserdata.department} </h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>מספר זיהוי</th>
                                        <th>שם</th>
                                        <th>תאריך כניסה אחרון</th>
                                        <th>פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user && user.patients && Object.values(user.patients)
                                        .filter(patient => patient.isActive === "true"&& patient.department === Loggedinuserdata.department)
                                        .map((patient) => (
                                        <tr key={patient.id}>
                                            <td>{patient.id}</td>
                                            <td>{patient.name}</td>
                                            <td>{patient.lastLoggedin ? new Date(patient.lastLoggedin).toLocaleDateString() : ''}</td>
                                            <td>
                                                <button onClick={() => {
                                                    setActiveUserState(patient.id);
                                                    setDisplayStats(true);
                                                }}>נתונים</button>
                                                <button onClick={() => { 
                                                    setActiveUserState(patient.id);
                                                    setActiveUser(patient.id);
                                                    loginToPatient(patient.id);
                                                    navigate('/home', { state: { patientId: patient.id } }); 
                                                    ComponentClick('HomePage')
                                                }}>התחבר</button>
                                                <button onClick={() => handleDeactivate(patient.id)}>הפוך ללא זמין</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <button onClick={() => setShowInactiveUsers(!showInactiveUsers)}>
                                {showInactiveUsers ? 'הסתר מטופלים לא פעילים' : 'הצג מטופלים לא פעילים'}
                            </button>
                            
                            {showInactiveUsers && (
                              <>
                                <h3>מטופלים לא פעילים</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>מספר זיהוי</th>
                                            <th>שם</th>
                                            <th>תאריך כניסה אחרון</th>
                                            <th>פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user && user.patients && Object.values(user.patients)
                                            .filter(patient => patient.isActive === "false" && patient.department === Loggedinuserdata.department)
                                            .map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{patient.id}</td>
                                                <td>{patient.name}</td>
                                                <td>{patient.lastLoggedin ? new Date(patient.lastLoggedin).toLocaleDateString() : ''}</td>
                                                <td>
                                                    <button onClick={() => {
                                                        setActiveUserState(patient.id);
                                                        setDisplayStats(true);
                                                    }}>נתונים</button>
                                                    <button onClick={() => handleActivate(patient.id)} >הפעל מחדש</button>
                                                    <button onClick={() => {setShowConfirmReset(true); }}>הסר לצמיתות</button>
                                                                {showConfirmReset && (
                                                                <ConfirmDialog 
                                                                message="האם אתה בטוח שברצונך למחוק מטופל זה לצמיתות? פעולה זו אינה ניתנת לביטול."
                                                                onConfirm={() => {handleRemovePatient(patient.id);
                                                                setShowConfirmReset(false);
                                                                }}
                                                                onCancel={() => setShowConfirmReset(false)}
                                                                />
                                                                )}
                                                    
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                              </>
                            )}
                              {!showAddPatientForm && (
                            <button onClick={() => setShowAddPatientForm((prev) => !prev)}>
                                {showAddPatientForm ? 'בטל הוספת מטופל' : 'הוסף מטופל חדש'}
                            </button>)}
                            {showAddPatientForm && (
                                
                                <div className="form-content" style={{ 
                                    maxWidth: '500px', 
                                    margin: '0 auto', 
                                    alignContent: 'center',
                                    width: '100%',
                                    border: '10px solid black',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    position: 'relative'
                                }}>
                                     <button 
                                        onClick={() => setShowAddPatientForm(false)} 
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',        
                                            color: 'white',        
                                            border: 'none',        
                                            width: '30px',        
                                            height: '70px',        
                                            fontSize: '35px',        
                                            cursor: 'pointer',        
                                            display: 'flex',        
                                            alignItems: 'center',        
                                            justifyContent: 'center', 
                                        
                                        }}
                                     >
                                       <i className="fa-solid fa-xmark"></i>
                                     </button>
                                    <h2>הוסף מטופל חדש</h2>
                                        <h3>
                                            מספר זיהוי:
                                            <input
                                                type="text"
                                                value={newPatientId}
                                                onChange={(e) => setNewPatientId(e.target.value)}
                                            />
                                        </h3>
                                        <h3>
                                            שם המטופל:
                                            <input
                                                type="text"
                                                value={newPatientName}
                                                onChange={(e) => setNewPatientName(e.target.value)}
                                            />
                                        </h3>
                                        {showAlert && (
                                            <AlertDialog
                                                message="מטופל עם מספר זיהוי זה כבר קיים במערכת"
                                                onClose={() => setShowAlert(false)}
                                            />
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={handleAddPatient}
                                        >שמור מטופל</button>
                                </div>
                               
                            )}
                            {dispplayStats && (
                                <div className="patient-stats">
                                    <h4>נתוני מטופל</h4>
                                    <MyStats key={activeUser} activeUser={activeUser} />
                                    <button onClick={() => setDisplayStats(false)}>סגור</button>
                                </div>
                            )}
                        
                        </div>
                    
                </div>
            
        </div>
    );
};

export default PatientManagement;
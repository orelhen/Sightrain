import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore, doc, getDoc, setDoc,updateDoc,deleteField } from '../firebase.js';


const PatientManagement = () => {
    const [user, setUser] = useState(null);
    const [showAddPatientForm, setShowAddPatientForm] = useState(false);
    const [newPatientId, setNewPatientId] = useState('');
    const [newPatientName, setNewPatientName] = useState('');
    const auth = getAuth();

    useEffect(() => {
        const fetchUserData = async (userId) => {
            const userDoc = doc(firestore, 'users', userId);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUser({
                    patients: userData.patients,
                });
            } else {
                console.error('No such user document!');
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



    const handleAddPatient = async () => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDoc = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    const updatedPatients = {
                        ...userData.patients,
                        [newPatientId]: {
                            id: newPatientId,
                            name: newPatientName,
                            dateAdded: new Date().toISOString()
                        },
                    };

                    await setDoc(userDoc, { patients: updatedPatients }, { merge: true });
                    console.log('Patient added successfully!');
                    setNewPatientId('');
                    setNewPatientName('');
                    setShowAddPatientForm(false);

                    // Refresh the user data to update the table
                    const updatedUserSnapshot = await getDoc(userDoc);
                    if (updatedUserSnapshot.exists()) {
                        const updatedUserData = updatedUserSnapshot.data();
                        setUser((prevUser) => ({
                            ...prevUser,
                            patients: updatedUserData.patients || {},
                        }));
                    }
                } else {
                    console.error('No such user document!');
                }
            } else {
                alert('אנא התחבר למשתמש על מנת להוסיף מטופל.');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
        }
    };

    const handleRemovePatient = async (patientId) => {
        try {
            const currentUser = auth.currentUser;
            const userDoc = doc(firestore, 'users', currentUser.uid);
            await updateDoc(userDoc, { [`patients.${patientId}`]: deleteField() });
            console.log(`Patient with ID: ${patientId} removed successfully!`);

            // Refresh the user data to update the table
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUser((prevUser) => ({
                    ...prevUser,
                    patients: userData.patients || {},
                }));
            }
        } catch (error) {
            console.error(`Error removing patient: ${patientId}`, error);
        }
    };



    return (
        <div >
            <h2>ניהול מטופלים</h2>
                <div>
                   
                        <div className="summary-table">
                            <h3>רשימת מטופלים</h3>
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
                                    {user && user.patients && Object.values(user.patients).map((patient) => (
                                        <tr key={patient.id}>
                                            <td>{patient.id}</td>
                                            <td>{patient.name}</td>
                                            <td>{patient.lastLoggedin}</td>
                                            <td>
                                                <button >נתונים</button>
                                                <button>התחבר</button>
                                                <button onClick={() => handleRemovePatient(patient.id)}>הסר מטופל</button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={() => setShowAddPatientForm((prev) => !prev)}>
                                {showAddPatientForm ? 'בטל הוספת מטופל' : 'הוסף מטופל חדש'}
                            </button>
                            {showAddPatientForm && (
                                <div className="add-patient-form">
                                    <h4>הוסף מטופל חדש</h4>
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <label>
                                            מספר זיהוי:
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
                                        <button type="button" onClick={handleAddPatient}>שמור מטופל</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    
                </div>
            
        </div>
    );
};

export default PatientManagement;
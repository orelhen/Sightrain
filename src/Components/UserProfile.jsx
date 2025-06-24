import "../css/ComponentsCss/UserProfile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  firestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "../firebase.js";

const UserProfile = ({ Loggedinuserdata }) => {
  const [user, setUser] = useState(Loggedinuserdata);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editNoteId, setEditNoteId] = useState(null);
  const [editContent, setEditContent] = useState({ title: "", content: "" });
  const [showNoteInput, setShowNoteInput] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (!currentUser?.uid) return;
      const notesRef = collection(firestore, "users", currentUser.uid, "notes");
      const notesSnapshot = await getDocs(notesRef);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList);
    };

    fetchNotes();
  }, [currentUser]);

  const handleAddNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    const notesRef = collection(firestore, "users", currentUser.uid, "notes");
    const timestamp = new Date().toISOString();
    try {
      const docRef = await addDoc(notesRef, {
        title: newNote.title,
        content: newNote.content,
        timestamp,
      });
      setNotes([...notes, { id: docRef.id, ...newNote, timestamp }]);
      setNewNote({ title: "", content: "" });
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    await deleteDoc(doc(firestore, "users", currentUser.uid, "notes", noteId));
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  const handleEditNote = async (noteId, updatedContent) => {
    await updateDoc(doc(firestore, "users", currentUser.uid, "notes", noteId), {
      title: updatedContent.title,
      content: updatedContent.content,
    });
    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, ...updatedContent } : note
      )
    );
    setEditNoteId(null);
  };

  const startEditingNote = (note) => {
    setEditNoteId(note.id);
    setEditContent({ title: note.title, content: note.content });
  };

  const cancelEdit = () => {
    setEditNoteId(null);
  };
  if (!user) {
    return (
      <div className="profile-container">
        <h2>משתמש לא מחובר</h2>
        <button onClick={() => navigate("/login")}>התחבר</button>
      </div>
    );
  }

  return (
    <section className="form-container main_section_prop profile-page">
      <div className="profile-container">
        <h2>הפרופיל שלי</h2>

        <img src="../images/user_profile.jpg" className="profile-image" />

        <p className="profile-info">
          <strong>שם מלא:</strong> {user?.name}
        </p>
        <p className="profile-info">
          <strong>כתובת מייל:</strong> {user?.email}
        </p>
        <p className="profile-info">
          <strong>תאריך לידה:</strong> {user?.age}
        </p>

        {user?.role === "caregiver" && (
          <p className="profile-info">
            <strong>מחלקה:</strong> {user?.department}
          </p>
        )}

        <button style={{ backgroundColor: "#d56666" }} onClick={handleLogout}>
          התנתק <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      {/* Notes Section */}
      <div className="notes-section">
        <button
          className="new-note-btn"
          onClick={() => setShowNoteInput(!showNoteInput)}
        >
          {showNoteInput ? (
            ""
          ) : (
            <div>
              <i className="fa-regular fa-note-sticky"></i> פתק חדש
            </div>
          )}
        </button>

        {showNoteInput && (
          <div className="note-input-overlay">
            <div className="note-input">
              <input
                placeholder="כתוב כותרת..."
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
              />
              <textarea
                placeholder="כתוב לעצמך תזכורת או הערה..."
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={3}
              />

              <div className="notes-btn-wrapper">
                <button
                  onClick={() => {
                    handleAddNote();
                    setShowNoteInput(false);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk"></i> שמור הערה
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i> ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-center" style={{ color: "black" }}>
          פתקים
        </h2>

        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              {editNoteId === note.id ? (
                <>
                  <input
                    value={editContent.title}
                    onChange={(e) =>
                      setEditContent({ ...editContent, title: e.target.value })
                    }
                  />
                  <textarea
                    value={editContent.content}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        content: e.target.value,
                      })
                    }
                    rows={3}
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={() => handleEditNote(note.id, editContent)}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> שמור
                    </button>
                    <button onClick={cancelEdit}>
                      <i className="fa-solid fa-xmark"></i> בטל
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="note-title">{note.title}</div>

                  <div className="note-content">{note.content}</div>
                  <div className="note-footer">
                    <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                    <div>
                      <button onClick={() => startEditingNote(note)}>
                        <i className="fa-solid fa-pen"></i> ערוך
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)}>
                        <i className="fa-solid fa-trash"></i> מחק
                      </button>
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UserProfile;

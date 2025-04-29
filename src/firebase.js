
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword ,signInWithEmailAndPassword,onAuthStateChanged,signOut} from "firebase/auth";
import {addDoc, doc, setDoc, getDocs, query, collection, where ,getDoc,updateDoc,deleteField} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDh4YJIN9Zq4SOLf-snk6QYxahOf1pp9FI",
  authDomain: "sightrain-c8391.firebaseapp.com",
  projectId: "sightrain-c8391",
  storageBucket: "sightrain-c8391.firebasestorage.app",
  messagingSenderId: "877401921907",
  appId: "1:877401921907:web:685c0387e901175a064d06",
  measurementId: "G-VK8089L06L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { app, analytics, firestore, getAuth, createUserWithEmailAndPassword, doc, setDoc, signInWithEmailAndPassword,
   onAuthStateChanged, signOut, getDocs, query, collection, where, getDoc,updateDoc,deleteField,addDoc };

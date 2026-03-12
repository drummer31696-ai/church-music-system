// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyA1aE8IKYznCjm9fn_pRGivxOk6rQ6OWCE",
  authDomain: "church-music-system.firebaseapp.com",
  projectId: "church-music-system",
  storageBucket: "church-music-system.firebasestorage.app",
  messagingSenderId: "592678785266",
  appId: "1:592678785266:web:b3f47c4016baf1e830806b",
  measurementId: "G-HSVHQG5XZ3"
};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

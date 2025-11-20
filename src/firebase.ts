// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database"; // <-- Import getDatabase
// NOTE: getAnalytics is typically used for tracking but not needed for basic data access

// Your web app's Firebase configuration (using the details you provided)
const firebaseConfig = {
  apiKey: "AIzaSyDHsn9n-tZUZQ_ksu7JW0UFHCmEL_6GTNA",
  authDomain: "countdown1-73932.firebaseapp.com",
  databaseURL: "https://countdown1-73932-default-rtdb.firebaseio.com",
  projectId: "countdown1-73932",
  storageBucket: "countdown1-73932.firebasestorage.app",
  messagingSenderId: "913943646076",
  appId: "1:913943646076:web:94bdaaa73964cee2c89ef9",
  measurementId: "G-98S26PBQBL"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT the Realtime Database instance
export const database: Database = getDatabase(app);
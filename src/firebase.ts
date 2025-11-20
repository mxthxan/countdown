// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
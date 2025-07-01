// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDD3yJAsH0CJEeKXYGTExS5zXyucEGv27o",
  authDomain: "circula-4cd88.firebaseapp.com",
  projectId: "circula-4cd88",
  storageBucket: "circula-4cd88.firebasestorage.app",
  messagingSenderId: "952928794233",
  appId: "1:952928794233:web:6720cca6163cd4786dc6a8",
  measurementId: "G-7D15WZSEFX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging, getToken, onMessage };

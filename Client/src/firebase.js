// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDD3yJAsH0CJEeKXYGTExS5zXyucEGv27o",
  authDomain: "circula-4cd88.firebaseapp.com",
  projectId: "circula-4cd88",
  storageBucket: "circula-4cd88.firebasestorage.app",
  messagingSenderId: "952928794233",
  appId: "1:952928794233:web:f6e74d53823176e96dc6a8",
  measurementId: "G-DPSBHFGL63"
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { app, messaging, getToken, onMessage };

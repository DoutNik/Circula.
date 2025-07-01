// Import scripts de Firebase (la versión debe coincidir con la que usas)
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Configura Firebase (igual que en tu app)
firebase.initializeApp({
  apiKey: "AIzaSyDD3yJAsH0CJEeKXYGTExS5zXyucEGv27o",
  authDomain: "circula-4cd88.firebaseapp.com",
  projectId: "circula-4cd88",
  storageBucket: "circula-4cd88.firebasestorage.app",
  messagingSenderId: "952928794233",
  appId: "1:952928794233:web:6720cca6163cd4786dc6a8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/android-chrome-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

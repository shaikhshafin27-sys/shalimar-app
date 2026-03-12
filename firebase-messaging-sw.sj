importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDWbBAnhcxaKVf4ACIQ1lGweR-fugOIFRY",
    projectId: "shalimar-3188d",
    messagingSenderId: "353343078082",
    appId: "1:353343078082:web:0aa0842ade9d2e758a455b"
});

const messaging = firebase.messaging();

// Jab app background mein ho tab notification handle karne ke liye
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/5900/5900595.png' // Paan logo
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
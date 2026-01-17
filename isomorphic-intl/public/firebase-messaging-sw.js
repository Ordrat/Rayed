/* eslint-env serviceworker */
/* global firebase */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBA2UFrZ1mrsuH-lYPO2YUuuupMtLkWLaY",
  authDomain: "rayed-586e3.firebaseapp.com",
  databaseURL: "https://rayed-586e3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rayed-586e3",
  storageBucket: "rayed-586e3.firebasestorage.app",
  messagingSenderId: "716889335600",
  appId: "1:716889335600:web:0ebd920e7a446d072ccaf5",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo/R.png',
    badge: '/logo/R.png',
    tag: 'support-notification',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  // Send message to all clients to update their notification state
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'FCM_NOTIFICATION_RECEIVED',
        notification: {
          title: notificationTitle,
          body: notificationOptions.body,
          data: payload.data,
        },
      });
    });
  });

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Focus on existing window or open new one
  const urlToOpen = data?.ticketId
    ? `/en/support-dashboard/chat/${data.ticketId}`
    : '/en/support-dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('/support-dashboard') && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
            });
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

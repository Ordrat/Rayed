/**
 * Firebase Configuration
 * Centralized Firebase initialization for the application
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase configuration - Client-side Web SDK
const firebaseConfig = {
  apiKey: "AIzaSyBA2UFrZ1mrsuH-lYPO2YUuuupMtLkWLaY",
  authDomain: "rayed-586e3.firebaseapp.com",
  databaseURL: "https://rayed-586e3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rayed-586e3",
  storageBucket: "rayed-586e3.firebasestorage.app",
  messagingSenderId: "716889335600",
  appId: "1:716889335600:web:e180a50322962a3d2ccaf5",
  measurementId: "G-Z3MS2LQEKK"
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase App
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

/**
 * Get Firebase Realtime Database
 */
export function getFirebaseDatabase(): Database {
  if (!database) {
    database = getDatabase(getFirebaseApp());
  }
  return database;
}

/**
 * Get Firebase Cloud Messaging - only available in browser
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });
        console.log('[Firebase] Service worker registered:', registration.scope);
      } catch (err) {
        console.warn('[Firebase] Service worker registration failed:', err);
      }
    }

    messaging = getMessaging(getFirebaseApp());
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
}

export { firebaseConfig };

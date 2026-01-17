/**
 * Firebase Configuration
 * Centralized Firebase initialization for the application
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Firebase configuration - Client-side Web SDK
const firebaseConfig = {
  apiKey: "AIzaSyBA2UFrZ1mrsuH-lYPO2YUuuupMtLkWLaY",
  authDomain: "rayed-586e3.firebaseapp.com",
  databaseURL: "https://rayed-586e3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rayed-586e3",
  storageBucket: "rayed-586e3.firebasestorage.app",
  messagingSenderId: "716889335600",
  appId: "1:716889335600:web:0ebd920e7a446d072ccaf5",
  measurementId: "G-807PP7F0VM"
};

let app: FirebaseApp | null = null;
let database: Database | null = null;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

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
      return null;
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        await navigator.serviceWorker.ready;
      } catch (err) {
        // Service worker registration failed
      }
    }

    messaging = getMessaging(getFirebaseApp());
    return messaging;
  } catch (error) {
    return null;
  }
}

/**
 * Get Firebase Analytics - only available in browser
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (analytics) {
    return analytics;
  }

  try {
    const supported = await isAnalyticsSupported();
    if (!supported) {
      return null;
    }

    analytics = getAnalytics(getFirebaseApp());
    return analytics;
  } catch (error) {
    return null;
  }
}

export { firebaseConfig };

import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './service-account.json';

// Check if app has been initialized
function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Initialize with service account from JSON file
      admin.initializeApp({
        credential: cert(serviceAccount as admin.ServiceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      // Fallback for development if needed
      admin.initializeApp({
        projectId: 'ridepals-9490b'
      });
      console.warn('Firebase Admin SDK initialized with fallback (no credentials)');
    }
  }

  return admin;
}

// Get a Firestore instance
export const adminDb = getFirestore(getFirebaseAdmin().app());

// Get an Auth instance
export const auth = getAuth(getFirebaseAdmin().app());

export default getFirebaseAdmin(); 
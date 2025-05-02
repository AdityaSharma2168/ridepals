import * as admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { join } from 'path';

// Check if app has been initialized
function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Initialize with service account from environment variables
      admin.initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'ridepalsai',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@ridepalsai.iam.gserviceaccount.com',
          // If FIREBASE_PRIVATE_KEY is set, use it, otherwise use the service account file
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      // Fallback for development if needed
      admin.initializeApp({
        projectId: 'ridepalsai'
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
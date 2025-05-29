import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Hard-coded Firebase configuration for reliability
const firebaseConfig = {
  apiKey: "AIzaSyA_g-njVOHXxvDzGDujqZGadrOsQqe87cQ",
  authDomain: "ridepals-9490b.firebaseapp.com",
  projectId: "ridepals-9490b",
  storageBucket: "ridepals-9490b.appspot.com",
  messagingSenderId: "41516656059",
  appId: "1:41516656059:web:9f907c8227e591d903909e",
  measurementId: "G-J5S7YKGYPN"
};

// Only initialize Firebase in the browser
const isBrowser = typeof window !== 'undefined';

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

if (isBrowser) {
  try {
    console.log("Firebase config:", {
      apiKey: firebaseConfig.apiKey ? 'DEFINED' : 'UNDEFINED',
      authDomain: firebaseConfig.authDomain ? 'DEFINED' : 'UNDEFINED',
      projectId: firebaseConfig.projectId ? 'DEFINED' : 'UNDEFINED',
      appId: firebaseConfig.appId ? 'DEFINED' : 'UNDEFINED'
    });
    console.log("Initializing Firebase app with config...");
    
    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    
    // Configure Google Auth Provider
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("Firebase auth initialized successfully with app:", firebaseAuth?.app.name);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

// Create a function to persist the session cookie
export const persistSession = async (idToken: string): Promise<boolean> => {
  if (!isBrowser) return false;
  
  try {
    console.log("Persisting session with backend...");
    
    // Call our backend API to create a session
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to persist session:', errorData.error);
      throw new Error(errorData.error || 'Failed to persist session');
    }
    
    const data = await response.json();
    console.log("Session persisted successfully:", data.success);
    
    // Verify the cookie was set
    setTimeout(() => {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('__session='));
      console.log("Session cookie present:", !!sessionCookie);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error persisting session:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};

// Export the Firebase auth instance and a function to check if it's available
export const auth = (isBrowser && firebaseAuth) ? firebaseAuth : null;
export const isAuthAvailable = () => isBrowser && !!firebaseApp && !!firebaseAuth;
export { GoogleAuthProvider }; 
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Hard-coded Firebase configuration for reliability
const firebaseConfig = {
  apiKey: "AIzaSyDc_xS5Hm1jHgypnq303qb-LPa9ocYb09E",
  authDomain: "ridepalsai.firebaseapp.com",
  projectId: "ridepalsai",
  storageBucket: "ridepalsai.appspot.com",
  messagingSenderId: "171518559632",
  appId: "1:171518559632:web:5e17d9a8d0b53e2a91eae7"
};

// Only initialize Firebase in the browser
const isBrowser = typeof window !== 'undefined';

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let isDemoMode = false; // Track if we're in demo mode

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
    console.log("Firebase auth initialized successfully with app:", firebaseAuth?.app.name);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    console.log("Falling back to demo mode");
    isDemoMode = true;
  }
}

// Create a function to persist the session cookie
export const persistSession = async (idToken: string): Promise<boolean> => {
  if (!isBrowser) return false;
  
  try {
    console.log("Persisting session with backend...");
    
    // If in demo mode, use a demo token
    const tokenToUse = isDemoMode ? "demo-token" : idToken;
    
    // Call our backend API to create a session
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenToUse}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to persist session:', errorData);
      return false;
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
    return false;
  }
};

// Export the Firebase auth instance and a function to check if it's available
export const auth = (isBrowser && firebaseAuth) ? firebaseAuth : null;
export const isAuthAvailable = () => isBrowser && (!!firebaseApp && !!firebaseAuth || isDemoMode);
export const isInDemoMode = () => isDemoMode;
export { GoogleAuthProvider }; 
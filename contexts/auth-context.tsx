"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import { auth, isAuthAvailable, persistSession } from "@/lib/firebase/client";
import { useCollege } from "./college-context";
import { useRouter } from "next/navigation";

// Define the shape of our user context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential | null>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential | null>;
  signUpWithEmailAndPassword: (
    email: string, 
    password: string, 
    collegeId: string, 
    firstName: string, 
    lastName: string
  ) => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
  isEduEmail: (email: string) => boolean;
  firebaseAvailable: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => null,
  signInWithEmailAndPassword: async () => null,
  signUpWithEmailAndPassword: async () => null,
  signOut: async () => {},
  isEduEmail: () => false,
  firebaseAvailable: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const { collegeByDomain } = useCollege();
  const router = useRouter();

  // Initialize Firebase auth
  useEffect(() => {
    const authAvailable = isAuthAvailable();
    setFirebaseAvailable(authAvailable);
    console.log(`Firebase auth availability: ${authAvailable ? 'YES' : 'NO'}`);

    if (!authAvailable || !auth) {
      console.error("Firebase auth not initialized");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Auth state changed:", user ? `User ${user.email} logged in` : "User logged out");
        
        if (user) {
          try {
            // Get a fresh ID token
            const idToken = await user.getIdToken(true);
            
            // Persist the session with our backend
            await persistSession(idToken);
          } catch (error) {
            console.error("Error persisting session:", error);
          }
        }
        
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Check if an email is a valid .edu email
  const isEduEmail = (email: string): boolean => {
    return email.endsWith(".edu");
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    if (!isAuthAvailable() || !auth) {
      console.error("Firebase auth not initialized - cannot sign in with Google");
      setError("Authentication service is not available. Please try again later.");
      return null;
    }

    try {
      console.log("Starting Google sign-in flow with Firebase...");
      const provider = new GoogleAuthProvider();
      
      // Add a timeout to the sign-in attempt
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Sign-in request timed out. Please check your internet connection.")), 30000);
      });
      
      const result = await Promise.race([
        signInWithPopup(auth, provider),
        timeoutPromise
      ]) as UserCredential;
      
      console.log("Google sign-in successful, checking email domain");
      
      // Check if it's a .edu email
      if (!isEduEmail(result.user.email || "")) {
        await signOut(auth);
        setError("Only .edu email addresses are allowed.");
        return null;
      }
      
      try {
        // Get a fresh ID token
        const idToken = await result.user.getIdToken(true);
            
        // Persist the session with our backend
        await persistSession(idToken);
        console.log("Session persisted successfully");
        
        console.log("Email domain verified, user authenticated");
        router.refresh(); // Force a refresh of the page to update auth state
        
        return result;
      } catch (sessionError: any) {
        console.error("Session persistence error:", sessionError);
        await signOut(auth);
        setError(sessionError.message || "Failed to create session. Please try again.");
        return null;
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Handle specific error types
      if (error.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Pop-up was blocked. Please allow pop-ups for this site and try again.");
      } else {
        setError(error.message || "An error occurred during Google sign in. Please try again.");
      }
      
      return null;
    }
  };

  // Sign in with email and password
  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<UserCredential | null> => {
    if (!isAuthAvailable() || !auth) {
      console.error("Firebase auth not initialized - cannot sign in with email/password");
      return null;
    }

    try {
      // Check if it's a .edu email
      if (!isEduEmail(email)) {
        throw new Error("Only .edu email addresses are allowed.");
      }
      
      const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
      
      // Get a fresh ID token
      const idToken = await result.user.getIdToken(true);
            
      // Persist the session with our backend
      await persistSession(idToken);
      console.log("Session persisted successfully");
      
      router.refresh(); // Force a refresh of the page to update auth state
      
      return result;
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      setError(error.message);
      return null;
    }
  };

  // Sign up with email and password
  const signUpWithEmailAndPassword = async (
    email: string,
    password: string,
    collegeId: string,
    firstName: string,
    lastName: string
  ): Promise<UserCredential | null> => {
    if (!isAuthAvailable() || !auth) {
      console.error("Firebase auth not initialized - cannot sign up with email/password");
      return null;
    }

    try {
      // Check if it's a .edu email
      if (!isEduEmail(email)) {
        throw new Error("Only .edu email addresses are allowed.");
      }
      
      // Validate that the email domain matches the college
      const domain = email.split("@")[1];
      const college = collegeByDomain(domain);
      
      if (!college) {
        throw new Error("Your email domain does not match any supported college.");
      }
      
      if (college.id !== collegeId) {
        throw new Error("Your email domain does not match the selected college.");
      }
      
      console.log("Creating user in Firebase with email:", email);
      // Create the user in Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      if (result.user) {
        await sendEmailVerification(result.user);
      }
      
      // Register the user in our backend
      try {
        const token = await result.user.getIdToken();
        console.log("Registering user with backend:", email, collegeId, firstName, lastName);
        
        const response = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid: result.user.uid,
            email: email,
            college_id: collegeId,
            first_name: firstName,
            last_name: lastName,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend registration failed:", errorData);
          throw new Error(`Backend registration failed: ${errorData.detail || response.statusText}`);
        }
        
        console.log("User registered successfully with backend");
      } catch (apiError) {
        console.error("Error registering user with backend:", apiError);
        // We continue anyway to not block the signup
      }
      
      return result;
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message);
      return null;
    }
  };

  // Sign out
  const handleSignOut = async (): Promise<void> => {
    if (!isAuthAvailable() || !auth) {
      console.error("Firebase auth not initialized - cannot sign out");
      setUser(null);
      return;
    }

    try {
      console.log("Signing out user from Firebase...");
      await signOut(auth);
      console.log("User signed out from Firebase");
      
      // Clear session cookie on the server
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        console.log("User signed out from backend");
      } catch (apiError) {
        console.error("Error logging out on server:", apiError);
      }
      
      router.refresh(); // Force a refresh of the page to update auth state
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmailAndPassword,
        signUpWithEmailAndPassword,
        signOut: handleSignOut,
        isEduEmail,
        firebaseAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 
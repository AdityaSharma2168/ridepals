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

// Create a mock user for development
const createMockUser = (): User => {
  return {
    uid: 'mock-user-123',
    email: 'student@stanford.edu',
    displayName: 'Demo User',
    emailVerified: true,
    photoURL: null,
    isAnonymous: false,
    tenantId: null,
    providerData: [],
    metadata: { creationTime: '', lastSignInTime: '' },
    phoneNumber: null,
    // Methods
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, expirationTime: '', issuedAtTime: '', authTime: '', signInProvider: null, signInSecondFactor: null }),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as User;
};

// Create a mock credential for development
const createMockCredential = (): UserCredential => {
  return {
    user: createMockUser(),
    providerId: 'mock-provider',
    operationType: 'signIn'
  } as unknown as UserCredential;
};

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
      console.warn("Firebase auth not initialized - running in demo mode");
      setUser(createMockUser());
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
        setUser(createMockUser());
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
      console.warn("Firebase auth not initialized - cannot sign in with Google");
      return createMockCredential();
    }

    try {
      console.log("Starting Google sign-in flow with Firebase...");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful, checking email domain");
      
      // Check if it's a .edu email
      if (!isEduEmail(result.user.email || "")) {
        await signOut(auth);
        throw new Error("Only .edu email addresses are allowed.");
      }
      
      // Get a fresh ID token
      const idToken = await result.user.getIdToken(true);
            
      // Persist the session with our backend
      const sessionPersisted = await persistSession(idToken);
      console.log("Session persisted:", sessionPersisted);
      
      if (!sessionPersisted) {
        console.error("Failed to persist session with backend");
      }
      
      console.log("Email domain verified, user authenticated");
      router.refresh(); // Force a refresh of the page to update auth state
      
      return result;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(error.message);
      return null;
    }
  };

  // Sign in with email and password
  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<UserCredential | null> => {
    if (!isAuthAvailable() || !auth) {
      console.warn("Firebase auth not initialized - cannot sign in with email/password");
      return createMockCredential();
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
      const sessionPersisted = await persistSession(idToken);
      console.log("Session persisted:", sessionPersisted);
      
      if (!sessionPersisted) {
        console.error("Failed to persist session with backend");
      }
      
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
      console.warn("Firebase auth not initialized - cannot sign up with email/password");
      return createMockCredential();
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
      console.warn("Firebase auth not initialized - cannot sign out");
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
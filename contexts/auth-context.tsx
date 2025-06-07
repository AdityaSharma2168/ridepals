"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useCollege } from "./college-context";
import { useRouter } from "next/navigation";

// Define the shape of our user context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<any>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  signUpWithEmailAndPassword: (
    email: string, 
    password: string, 
    collegeId: string, 
    firstName: string, 
    lastName: string
  ) => Promise<any>;
  signOut: () => Promise<void>;
  isEduEmail: (email: string) => boolean;
  resetPassword: (email: string) => Promise<any>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => null,
  signInWithEmailAndPassword: async () => null,
  signUpWithEmailAndPassword: async () => null,
  signOut: async () => {},
  isEduEmail: () => false,
  resetPassword: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { collegeByDomain } = useCollege();
  const router = useRouter();

  // Initialize Supabase auth
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // If user signs in, create/update their profile
      if (event === 'SIGNED_IN' && session?.user) {
        await createOrUpdateUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, []);

  const createOrUpdateUserProfile = async (user: User) => {
    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // Create new user profile
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            college_email: user.email || '',
            is_driver: false,
            is_verified: false,
          })

        if (error) {
          console.error('Error creating user profile:', error)
        } else {
          console.log('User profile created successfully')
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error)
    }
  }

  // Check if an email is a valid .edu email
  const isEduEmail = (email: string): boolean => {
    return email.endsWith(".edu");
  };

  // Sign in with Google (using Supabase OAuth)
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign-in flow with Supabase...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error("Google sign-in error:", error);
        setError(error.message || "An error occurred during Google sign in. Please try again.");
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(error.message || "An error occurred during Google sign in. Please try again.");
      return null;
    }
  };

  // Sign in with email and password
  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      setError(null);
      
      // Check if it's a .edu email
      if (!isEduEmail(email)) {
        throw new Error("Only .edu email addresses are allowed.");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error;
      }
      
      console.log("Email sign-in successful");
      return data;
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      setError(error.message || "Invalid email or password. Please try again.");
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
  ) => {
    try {
      setError(null);
      
      // Check if it's a .edu email
      if (!isEduEmail(email)) {
        throw new Error("Only .edu email addresses are allowed.");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
            college_id: collegeId,
          }
        }
      })
      
      if (error) {
        throw error;
      }
      
      console.log("Email sign-up successful - check email for verification");
      return data;
    } catch (error: any) {
      console.error("Email sign-up error:", error);
      setError(error.message || "An error occurred during sign up. Please try again.");
      return null;
    }
  };

  // Sign out
  const handleSignOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error);
        setError("Error signing out. Please try again.");
      } else {
        console.log("User signed out successfully");
        router.push('/');
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError("Error signing out. Please try again.");
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Error sending reset email. Please try again.");
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signOut: handleSignOut,
    isEduEmail,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext); 
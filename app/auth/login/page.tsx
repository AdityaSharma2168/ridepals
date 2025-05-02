"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthAvailable } from "@/lib/firebase/client";

export default function LoginPage() {
  const { signInWithEmailAndPassword, signInWithGoogle, isEduEmail, firebaseAvailable, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authDebug, setAuthDebug] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      console.log("User already logged in, redirecting to:", callbackUrl);
      router.push(callbackUrl);
    }
    
    // Add debug information
    setAuthDebug(`Firebase auth available from raw check: ${isAuthAvailable() ? "Yes" : "No"}
Firebase auth available from context: ${firebaseAvailable ? "Yes" : "No"}
Callback URL: ${callbackUrl}`);
  }, [user, firebaseAvailable, router, callbackUrl]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if email is a valid .edu email
      if (!isEduEmail(email)) {
        setError("Please use a .edu email address to sign in");
        setLoading(false);
        return;
      }

      const result = await signInWithEmailAndPassword(email, password);
      console.log("Email login successful, redirecting to:", callbackUrl);
      
      // Show a loading message
      setAuthDebug("Login successful! Redirecting...");
      
      // Add a small delay to ensure cookies are set
      setTimeout(() => {
        router.push(callbackUrl);
      }, 1000);
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log("Starting Google sign in...");
      const result = await signInWithGoogle();
      console.log("Google sign in successful:", result);
      
      // Show a loading message
      setAuthDebug("Login successful! Redirecting...");
      
      // Add a small delay to ensure cookies are set
      setTimeout(() => {
        router.push(callbackUrl);
      }, 1000);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setError(error.message || "An error occurred during Google sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign in to RidePals</CardTitle>
          <CardDescription className="text-center">
            Enter your .edu email to sign in to your account
          </CardDescription>
          
          {authDebug && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              {authDebug}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in with Email"}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-rose-600 hover:text-rose-500">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 
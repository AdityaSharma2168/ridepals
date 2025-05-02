"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useCollege } from "@/contexts/college-context"
import { Loader2 } from "lucide-react"
import { isAuthAvailable } from "@/lib/firebase/client"

export default function AuthTestPage() {
  const { user, loading, error, signInWithGoogle, signInWithEmailAndPassword, signUpWithEmailAndPassword, signOut, firebaseAvailable } = useAuth()
  const { selectedCollege } = useCollege()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [userFirebaseToken, setUserFirebaseToken] = useState("")
  const [status, setStatus] = useState<{type: "success" | "error" | "info", message: string} | null>(null)
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState("")
  const [cookieStatus, setCookieStatus] = useState<any>(null)
  
  // Check if Firebase auth is available
  useEffect(() => {
    setAuthStatus(`Firebase auth available: ${isAuthAvailable() ? "Yes" : "No"}`)
    
    // Check the session cookie status
    checkSessionCookie()
  }, [])
  
  // Check session cookie from our API
  const checkSessionCookie = async () => {
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      setCookieStatus(data)
    } catch (error) {
      console.error("Error checking session cookie:", error)
      setCookieStatus({ error: "Failed to check session cookie" })
    }
  }
  
  // Get the user's Firebase token when they log in
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken()
          setUserFirebaseToken(token.substring(0, 50) + "...")
        } catch (error) {
          console.error("Error getting token:", error)
          setUserFirebaseToken("Error getting token")
        }
      } else {
        setUserFirebaseToken("")
      }
    }
    
    getToken()
  }, [user])
  
  const handleCheckSession = async () => {
    try {
      setStatus({type: "info", message: "Checking session with backend..."})
      
      // Check cookie status first
      await checkSessionCookie()
      
      const token = user ? await user.getIdToken() : null
      
      if (!token) {
        setStatus({type: "error", message: "No user token available"})
        return
      }
      
      const response = await fetch("http://localhost:8000/auth/session", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      setBackendStatus(data)
      
      setStatus({
        type: "success", 
        message: `Session check complete. Status: ${data.authenticated ? "Authenticated" : "Not authenticated"}`
      })
    } catch (error) {
      console.error("Error checking session:", error)
      setStatus({type: "error", message: `Error checking session: ${error}`})
    }
  }
  
  const handleGoogleSignIn = async () => {
    try {
      setStatus({type: "info", message: "Signing in with Google..."})
      const result = await signInWithGoogle()
      checkSessionCookie() // Check cookie after login
      setStatus({type: "success", message: "Signed in with Google"})
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setStatus({type: "error", message: `Google sign in error: ${error.message}`})
    }
  }
  
  const handleEmailSignIn = async () => {
    try {
      setStatus({type: "info", message: "Signing in with email..."})
      await signInWithEmailAndPassword(email, password)
      checkSessionCookie() // Check cookie after login
      setStatus({type: "success", message: "Signed in with email"})
    } catch (error: any) {
      console.error("Email sign in error:", error)
      setStatus({type: "error", message: `Email sign in error: ${error.message}`})
    }
  }
  
  const handleSignUp = async () => {
    try {
      if (!selectedCollege) {
        setStatus({type: "error", message: "Please select a college first"})
        return
      }
      
      setStatus({type: "info", message: "Registering..."})
      await signUpWithEmailAndPassword(email, password, selectedCollege.id, firstName, lastName)
      checkSessionCookie() // Check cookie after signup
      setStatus({type: "success", message: "Registered successfully! Check your email for verification."})
    } catch (error: any) {
      console.error("Sign up error:", error)
      setStatus({type: "error", message: `Sign up error: ${error.message}`})
    }
  }
  
  const handleSignOut = async () => {
    try {
      setStatus({type: "info", message: "Signing out..."})
      await signOut()
      checkSessionCookie() // Check cookie after logout
      setStatus({type: "success", message: "Signed out successfully"})
    } catch (error: any) {
      console.error("Sign out error:", error)
      setStatus({type: "error", message: `Sign out error: ${error.message}`})
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-yellow-100 p-4 mb-6 rounded-md">
        <p className="font-semibold">Firebase Auth Status:</p>
        <p>Raw check: Firebase auth available: {isAuthAvailable() ? "Yes" : "No"}</p>
        <p>Context check: Firebase auth available: {firebaseAvailable ? "Yes" : "No"}</p>
        <p className="mt-2 text-xs text-gray-700">
          If these values don't match, there may be an issue with how Firebase auth is being initialized or detected.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">User Status:</p>
                  <p className={`mt-1 ${user ? "text-green-600" : "text-red-600"}`}>
                    {user ? "Logged In" : "Logged Out"}
                  </p>
                </div>
                
                {user && (
                  <div className="space-y-2">
                    <p className="font-medium">User Info:</p>
                    <p><span className="text-gray-600">Email:</span> {user.email}</p>
                    <p><span className="text-gray-600">UID:</span> {user.uid}</p>
                    <p><span className="text-gray-600">Email Verified:</span> {user.emailVerified ? "Yes" : "No"}</p>
                    <p className="text-sm text-gray-600">Firebase Token:</p>
                    <p className="text-xs overflow-auto break-all p-2 bg-gray-100 rounded">{userFirebaseToken}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="font-medium">Session Cookie Status:</p>
                  {cookieStatus ? (
                    <div className={`p-2 rounded text-sm ${cookieStatus.authenticated ? "bg-green-100" : "bg-red-100"}`}>
                      <p><span className="font-medium">Authenticated:</span> {cookieStatus.authenticated ? "Yes" : "No"}</p>
                      {cookieStatus.reason && <p><span className="font-medium">Reason:</span> {cookieStatus.reason}</p>}
                      {cookieStatus.user && (
                        <div className="mt-1">
                          <p className="font-medium">Cookie User Data:</p>
                          <pre className="text-xs bg-white p-1 mt-1 rounded overflow-auto">
                            {JSON.stringify(cookieStatus.user, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Checking session cookie...</p>
                  )}
                  <Button size="sm" onClick={checkSessionCookie} variant="outline">
                    Refresh Cookie Status
                  </Button>
                </div>
                
                {error && (
                  <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}
                
                {status && (
                  <div className={`mt-4 p-2 rounded ${
                    status.type === "success" ? "bg-green-100 text-green-800" : 
                    status.type === "error" ? "bg-red-100 text-red-800" : 
                    "bg-blue-100 text-blue-800"
                  }`}>
                    <p>{status.message}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  {user ? (
                    <div className="space-y-2">
                      <Button onClick={handleCheckSession} className="w-full">
                        Check Backend Session
                      </Button>
                      <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={handleGoogleSignIn} className="w-full">
                        Sign In with Google
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{isRegistering ? "Register" : "Login"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="youremail@college.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="********"
                />
              </div>
              
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      placeholder="Doe"
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4">
                {isRegistering ? (
                  <div className="space-y-2">
                    <Button onClick={handleSignUp} className="w-full">
                      Register
                    </Button>
                    <p className="text-center text-sm">
                      Already have an account?{" "}
                      <button 
                        className="text-rose-600 hover:underline" 
                        onClick={() => setIsRegistering(false)}
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={handleEmailSignIn} className="w-full">
                      Sign In
                    </Button>
                    <p className="text-center text-sm">
                      Don't have an account?{" "}
                      <button 
                        className="text-rose-600 hover:underline" 
                        onClick={() => setIsRegistering(true)}
                      >
                        Register
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {backendStatus && (
        <Card className="mt-8 shadow-md">
          <CardHeader>
            <CardTitle>Backend Session Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(backendStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
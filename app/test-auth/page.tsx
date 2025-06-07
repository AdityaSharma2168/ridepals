'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('🔄 Testing Supabase auth...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      addLog(`📊 Initial session check: ${session ? 'Found' : 'None'}, Error: ${error?.message || 'None'}`)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      addLog(`🔄 Auth state changed: ${event}`)
      if (session?.user) {
        addLog(`👤 User: ${session.user.email}`)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    addLog('🚀 Starting Google OAuth...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      addLog(`❌ OAuth error: ${error.message}`)
    } else {
      addLog(`✅ OAuth initiated`)
    }
  }

  const handleSignOut = async () => {
    addLog('🚪 Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`❌ Sign out error: ${error.message}`)
    } else {
      addLog(`✅ Signed out`)
    }
  }

  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim())
    addLog(`🍪 Cookies: ${cookies.join(', ')}`)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Auth Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {user ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Session:</strong> {session ? '✅ Active' : '❌ None'}</p>
            </div>
            
            <div className="mt-6 space-x-4">
              {!user ? (
                <button 
                  onClick={handleGoogleSignIn}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign In with Google
                </button>
              ) : (
                <button 
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              )}
              
              <button 
                onClick={checkCookies}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Check Cookies
              </button>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm mb-1 font-mono">
                  {log}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setLogs([])}
              className="mt-4 bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Raw Data */}
        {user && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Raw User Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 
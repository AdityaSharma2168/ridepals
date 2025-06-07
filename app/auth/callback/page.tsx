'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Auth callback started')
        console.log('📄 URL search params:', window.location.search)
        
        // Get the code from URL params (this is crucial for OAuth)
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (error) {
          console.error('❌ OAuth error:', error, errorDescription)
          setIsProcessing(false)
          router.push('/auth/login?error=oauth_failed')
          return
        }
        
        if (code) {
          console.log('✅ Authorization code found:', code.substring(0, 10) + '...')
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('❌ Code exchange error:', error)
            setIsProcessing(false)
            router.push('/auth/login?error=auth_failed')
            return
          }

          console.log('✅ Code exchange successful')
          console.log('👤 User email:', data.user?.email)

          if (data.session?.user) {
            // Check if it's a .edu email
            const email = data.session.user.email
            console.log('📧 Checking email:', email)
            
            if (email && !email.endsWith('.edu')) {
              console.log('❌ Non-.edu email detected, signing out')
              await supabase.auth.signOut()
              setIsProcessing(false)
              router.push('/auth/login?error=invalid_email')
              return
            }

            console.log('✅ .edu email verified, redirecting to home')
            setIsProcessing(false)
            
            // Force redirect after a small delay
            setTimeout(() => {
              router.push('/')
            }, 500)
            return
          } else {
            console.log('❌ No session after code exchange')
            setIsProcessing(false)
            router.push('/auth/login')
          }
        } else {
          console.log('⚠️ No code parameter, checking existing session')
          
          // No code parameter, check if there's already a session
          const { data, error } = await supabase.auth.getSession()
          
          console.log('🔍 Existing session check:', !!data.session, error?.message)
          
          if (error || !data.session) {
            console.log('❌ No existing session, redirecting to login')
            setIsProcessing(false)
            router.push('/auth/login')
            return
          }

          console.log('✅ Existing session found, redirecting to home')
          setIsProcessing(false)
          // Force redirect after a small delay
          setTimeout(() => {
            router.push('/')
          }, 500)
        }
      } catch (error) {
        console.error('💥 Unexpected error in auth callback:', error)
        setIsProcessing(false)
        router.push('/auth/login?error=unexpected')
      }
    }

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(handleAuthCallback, 100)
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      if (isProcessing) {
        console.log('⚠️ Callback timeout reached, forcing redirect')
        setIsProcessing(false)
        router.push('/')
      }
    }, 10000) // 10 second timeout
    
    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [router, searchParams, isProcessing])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Please wait while we verify your credentials
        </p>
      </div>
    </div>
  )
} 
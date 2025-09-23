'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import zkLoginManager from '@/lib/auth/zklogin'

export default function AuthCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state')
        }

        // Handle the OAuth callback
        await zkLoginManager.handleOAuthCallback(code, state)
        
        setStatus('success')
        
        // Redirect to dashboard after success
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error) {
        console.error('Auth callback error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setStatus('error')
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center space-y-6 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white">Authenticating...</h2>
            <p className="text-purple-200">Setting up your zkLogin wallet</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Successful!</h2>
            <p className="text-green-200">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Failed</h2>
            <p className="text-red-200">{error}</p>
            <p className="text-purple-200 text-sm">Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  )
}
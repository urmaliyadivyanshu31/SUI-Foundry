'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useZkLogin()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to main page which contains the dashboard
        router.push('/')
      } else {
        // Redirect to home page for login
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return null
}
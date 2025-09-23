'use client'

import { EnokiClient } from '@mysten/enoki'

// Enoki configuration
const ENOKI_API_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY || ''

// Initialize Enoki client
export const enokiClient = ENOKI_API_KEY ? new EnokiClient({
  apiKey: ENOKI_API_KEY,
}) : null

// Google OAuth config for Enoki
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

// User profile data extraction from Enoki account
export function extractUserDataFromAccount(account: any) {
  return {
    address: account?.address || '',
    email: account?.userInfo?.email || account?.email || '',
    name: account?.userInfo?.name || account?.name || '',
    picture: account?.userInfo?.picture || account?.picture || '',
    provider: 'google',
    sub: account?.userInfo?.sub || account?.sub || account?.userInfo?.email || account?.email || '',
  }
}

// Validate Enoki configuration
export function validateEnokiConfig(): boolean {
  if (!ENOKI_API_KEY) {
    console.error('❌ NEXT_PUBLIC_ENOKI_API_KEY is not configured')
    return false
  }
  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured')
    return false
  }
  return true
}

// Check if we have a valid Enoki setup
export const isEnokiConfigured = (): boolean => {
  return !!ENOKI_API_KEY && !!GOOGLE_CLIENT_ID
}

export default {
  enokiClient,
  extractUserDataFromAccount,
  validateEnokiConfig,
  isEnokiConfigured,
}
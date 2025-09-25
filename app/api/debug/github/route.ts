import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ? 'SET' : 'MISSING',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING',
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
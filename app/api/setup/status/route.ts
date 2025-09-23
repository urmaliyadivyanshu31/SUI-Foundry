import { NextResponse } from 'next/server'
import { checkDatabaseStatus, getDatabaseStatusMessage } from '@/lib/database-status'

export async function GET() {
  try {
    const status = await checkDatabaseStatus()
    const message = getDatabaseStatusMessage(status)

    return NextResponse.json({
      status,
      message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
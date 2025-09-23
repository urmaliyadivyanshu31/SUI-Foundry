import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/core/supabase'
import { SuiClient } from '@mysten/sui/client'

const suiClient = new SuiClient({
  url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' 
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443'
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const check = searchParams.get('check') || 'all'

  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>
  }

  try {
    // Basic application health
    if (check === 'all' || check === 'app') {
      healthStatus.checks.application = {
        status: 'healthy',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet'
      }
    }

    // Database connectivity
    if (check === 'all' || check === 'database') {
      try {
        if (!isSupabaseConfigured()) {
          healthStatus.checks.database = {
            status: 'warning',
            message: 'Supabase not configured - check environment variables',
            configured: false
          }
        } else {
          // Test database connection
          const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)

          if (error) {
            healthStatus.checks.database = {
              status: 'unhealthy',
              message: `Database error: ${error.message}`,
              error: error.code
            }
          } else {
            healthStatus.checks.database = {
              status: 'healthy',
              message: 'Database connection successful',
              configured: true
            }
          }
        }
      } catch (dbError: any) {
        healthStatus.checks.database = {
          status: 'unhealthy',
          message: `Database connection failed: ${dbError.message}`,
          error: 'CONNECTION_FAILED'
        }
      }
    }

    // Sui blockchain connectivity
    if (check === 'all' || check === 'blockchain') {
      try {
        const startTime = Date.now()
        const systemState = await suiClient.getLatestSuiSystemState()
        const responseTime = Date.now() - startTime

        healthStatus.checks.blockchain = {
          status: 'healthy',
          message: 'Sui network connection successful',
          network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
          epoch: systemState.epoch,
          responseTime: `${responseTime}ms`
        }
      } catch (blockchainError: any) {
        healthStatus.checks.blockchain = {
          status: 'unhealthy',
          message: `Sui network error: ${blockchainError.message}`,
          network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
          error: 'NETWORK_ERROR'
        }
      }
    }

    // OpenAI connectivity
    if (check === 'all' || check === 'openai') {
      try {
        if (!process.env.OPENAI_API_KEY) {
          healthStatus.checks.openai = {
            status: 'warning',
            message: 'OpenAI API key not configured',
            configured: false
          }
        } else {
          // Test OpenAI connectivity with a simple request
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            healthStatus.checks.openai = {
              status: 'healthy',
              message: 'OpenAI API connection successful',
              configured: true
            }
          } else {
            healthStatus.checks.openai = {
              status: 'unhealthy',
              message: `OpenAI API error: ${response.statusText}`,
              statusCode: response.status
            }
          }
        }
      } catch (openaiError: any) {
        healthStatus.checks.openai = {
          status: 'unhealthy',
          message: `OpenAI connection failed: ${openaiError.message}`,
          error: 'CONNECTION_FAILED'
        }
      }
    }

    // Environment variables check
    if (check === 'all' || check === 'environment') {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET'
      ]

      const optionalEnvVars = [
        'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'NEXT_PUBLIC_GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
        'NEXT_PUBLIC_TWITTER_CLIENT_ID',
        'TWITTER_CLIENT_SECRET',
        'OPENAI_API_KEY'
      ]

      const missingRequired = requiredEnvVars.filter(env => !process.env[env])
      const missingOptional = optionalEnvVars.filter(env => !process.env[env])

      healthStatus.checks.environment = {
        status: missingRequired.length > 0 ? 'unhealthy' : 'healthy',
        message: missingRequired.length > 0 
          ? `Missing required environment variables: ${missingRequired.join(', ')}`
          : 'All required environment variables configured',
        required: {
          configured: requiredEnvVars.length - missingRequired.length,
          total: requiredEnvVars.length,
          missing: missingRequired
        },
        optional: {
          configured: optionalEnvVars.length - missingOptional.length,
          total: optionalEnvVars.length,
          missing: missingOptional
        }
      }
    }

    // OAuth providers check
    if (check === 'all' || check === 'oauth') {
      const providers = [
        { name: 'google', clientId: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', secret: 'GOOGLE_CLIENT_SECRET' },
        { name: 'github', clientId: 'NEXT_PUBLIC_GITHUB_CLIENT_ID', secret: 'GITHUB_CLIENT_SECRET' },
        { name: 'twitter', clientId: 'NEXT_PUBLIC_TWITTER_CLIENT_ID', secret: 'TWITTER_CLIENT_SECRET' }
      ]

      const providerStatus = providers.map(provider => ({
        name: provider.name,
        configured: !!(process.env[provider.clientId] && process.env[provider.secret]),
        clientIdConfigured: !!process.env[provider.clientId],
        secretConfigured: !!process.env[provider.secret]
      }))

      const configuredProviders = providerStatus.filter(p => p.configured).length

      healthStatus.checks.oauth = {
        status: configuredProviders > 0 ? 'healthy' : 'warning',
        message: configuredProviders > 0 
          ? `${configuredProviders} OAuth provider(s) configured`
          : 'No OAuth providers configured',
        providers: providerStatus,
        configuredCount: configuredProviders,
        totalCount: providers.length
      }
    }

    // Determine overall health status
    const allChecks = Object.values(healthStatus.checks)
    const hasUnhealthy = allChecks.some((check: any) => check.status === 'unhealthy')
    const hasWarnings = allChecks.some((check: any) => check.status === 'warning')

    if (hasUnhealthy) {
      healthStatus.status = 'unhealthy'
    } else if (hasWarnings) {
      healthStatus.status = 'warning'
    }

    const statusCode = healthStatus.status === 'unhealthy' ? 503 : 200

    return NextResponse.json(healthStatus, { status: statusCode })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: `Health check failed: ${error.message}`,
      error: error.name || 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
}
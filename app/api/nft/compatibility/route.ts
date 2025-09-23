import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/error-handler'
import { createNFTAdapter, checkBackendCompatibility } from '@/lib/nft-backend-adapter'

// GET /api/nft/compatibility - Check backend compatibility and setup status
export const GET = withErrorHandler(async () => {
  try {
    // Check backend compatibility
    const compatibility = await checkBackendCompatibility()
    
    // Get configuration status
    const configStatus = getConfigurationStatus()
    
    // Test backend connectivity if configured
    let backendHealth = null
    if (compatibility.isCompatible) {
      try {
        const adapter = await createNFTAdapter()
        backendHealth = await adapter.healthCheck()
      } catch (error) {
        backendHealth = false
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        compatibility,
        configuration: configStatus,
        backend_health: backendHealth,
        integration_mode: determineIntegrationMode(configStatus),
        recommendations: generateRecommendations(configStatus, compatibility)
      }
    })
  } catch (error) {
    throw error
  }
})

// Helper function to check configuration status
function getConfigurationStatus() {
  const config = {
    // Core requirements
    supabase_configured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    privy_configured: !!(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID && 
      process.env.PRIVY_APP_SECRET
    ),
    
    // Blockchain configuration
    sui_network_configured: !!process.env.NEXT_PUBLIC_SUI_NETWORK,
    local_contracts_configured: !!process.env.NEXT_PUBLIC_PACKAGE_ID,
    
    // Existing backend integration
    existing_backend_configured: !!(
      process.env.NEXT_PUBLIC_NFT_BACKEND_URL
    ),
    existing_backend_authenticated: !!(
      process.env.NEXT_PUBLIC_NFT_BACKEND_URL && 
      process.env.NFT_BACKEND_API_KEY
    ),
    existing_contracts_configured: !!process.env.NEXT_PUBLIC_EXISTING_PACKAGE_ID,
    
    // Optional services
    openai_configured: !!process.env.OPENAI_API_KEY,
    github_configured: !!(
      process.env.GITHUB_CLIENT_ID && 
      process.env.GITHUB_CLIENT_SECRET
    ),
    twitter_configured: !!(
      process.env.TWITTER_CLIENT_ID && 
      process.env.TWITTER_CLIENT_SECRET
    )
  }

  const core_ready = config.supabase_configured && config.privy_configured
  const blockchain_ready = config.sui_network_configured && (
    config.local_contracts_configured || config.existing_contracts_configured
  )
  const integration_ready = config.existing_backend_configured
  const fully_configured = core_ready && blockchain_ready

  return {
    ...config,
    core_ready,
    blockchain_ready,
    integration_ready,
    fully_configured
  }
}

// Determine integration mode based on configuration
function determineIntegrationMode(config: any): string {
  if (config.existing_backend_configured && config.existing_backend_authenticated) {
    return 'hybrid' // Using both existing backend and local features
  } else if (config.existing_backend_configured) {
    return 'external_readonly' // Can read from existing backend but not write
  } else if (config.local_contracts_configured) {
    return 'local_only' // Using only local contracts
  } else {
    return 'unconfigured' // Not properly set up yet
  }
}

// Generate setup recommendations
function generateRecommendations(config: any, compatibility: any): string[] {
  const recommendations: string[] = []

  // Core configuration checks
  if (!config.supabase_configured) {
    recommendations.push('Configure Supabase for user data and caching (REQUIRED)')
  }
  
  if (!config.privy_configured) {
    recommendations.push('Configure Privy for authentication (REQUIRED)')
  }

  // Blockchain configuration
  if (!config.blockchain_ready) {
    if (config.existing_contracts_configured) {
      recommendations.push('Local contracts not configured, will use existing backend contracts')
    } else {
      recommendations.push('Configure either local contracts or existing backend contracts')
    }
  }

  // Backend integration recommendations
  if (!config.existing_backend_configured) {
    recommendations.push('Consider configuring your existing NFT backend URL for enhanced functionality')
  } else if (!config.existing_backend_authenticated) {
    recommendations.push('Add API key for your existing backend to enable write operations')
  }

  // Backend compatibility issues
  if (config.existing_backend_configured && !compatibility.isCompatible) {
    recommendations.push('Existing backend is not responding - check URL and connectivity')
    recommendations.push(...compatibility.recommendations)
  }

  // Optional but recommended
  if (!config.openai_configured) {
    recommendations.push('Configure OpenAI API for AI-powered reputation analysis (OPTIONAL)')
  }

  if (!config.github_configured && !config.twitter_configured) {
    recommendations.push('Configure social platform APIs for enhanced verification (OPTIONAL)')
  }

  // Success state
  if (recommendations.length === 0) {
    recommendations.push('✅ All configurations look good! Your setup is ready.')
  }

  return recommendations
}

// POST /api/nft/compatibility/test - Test specific backend endpoint
export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const { endpoint, method = 'GET' } = await req.json()
    
    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Endpoint is required'
      }, { status: 400 })
    }

    // Create adapter and test specific endpoint
    const adapter = await createNFTAdapter()
    
    let result
    try {
      // This is a simplified test - in a real implementation, you'd have more specific test methods
      switch (endpoint) {
        case 'health':
          result = await adapter.healthCheck()
          break
        case 'stats':
          result = await adapter.getPlatformStats()
          break
        default:
          result = { tested: true, endpoint }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          endpoint,
          method,
          result,
          status: 'reachable'
        }
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: {
          endpoint,
          method,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'unreachable'
        }
      })
    }
  } catch (error) {
    throw error
  }
})
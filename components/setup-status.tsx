'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  ExternalLink,
  Database,
  Shield,
  Zap,
  Workflow,
  Server,
  GitBranch
} from 'lucide-react'

interface SetupStatus {
  compatibility: {
    isCompatible: boolean
    version?: string
    features: string[]
    recommendations: string[]
  }
  configuration: {
    core_ready: boolean
    blockchain_ready: boolean
    integration_ready: boolean
    fully_configured: boolean
    supabase_configured: boolean
    privy_configured: boolean
    existing_backend_configured: boolean
    existing_backend_authenticated: boolean
    [key: string]: boolean
  }
  backend_health: boolean | null
  integration_mode: string
  recommendations: string[]
}

export function SetupStatus() {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/nft/compatibility')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch status')
      }
      
      setStatus(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (isReady: boolean, isOptional: boolean = false) => {
    if (isReady) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (isOptional) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getIntegrationModeInfo = (mode: string) => {
    switch (mode) {
      case 'hybrid':
        return {
          label: 'Hybrid Mode',
          description: 'Using both existing backend and local features',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20',
          icon: <Workflow className="w-4 h-4" />
        }
      case 'external_readonly':
        return {
          label: 'External Read-Only',
          description: 'Reading from existing backend, local features available',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20',
          icon: <ExternalLink className="w-4 h-4" />
        }
      case 'local_only':
        return {
          label: 'Local Only',
          description: 'Using local contracts and features only',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20',
          icon: <Server className="w-4 h-4" />
        }
      default:
        return {
          label: 'Unconfigured',
          description: 'Setup required to enable functionality',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20',
          icon: <Settings className="w-4 h-4" />
        }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Setup Status
          </CardTitle>
          <CardDescription>Checking integration status...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Setup Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchStatus} 
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const modeInfo = getIntegrationModeInfo(status.integration_mode)

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Status
              </CardTitle>
              <CardDescription>
                Integration status for your NFT backend
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {status.configuration.fully_configured ? '✅' : '⚠️'}
              </div>
              <div className="text-sm font-medium">Setup Status</div>
              <div className="text-xs text-muted-foreground">
                {status.configuration.fully_configured ? 'Ready' : 'Needs Config'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Badge className={modeInfo.color}>
                {modeInfo.icon}
                <span className="ml-1">{modeInfo.label}</span>
              </Badge>
              <div className="text-xs text-muted-foreground mt-2">
                {modeInfo.description}
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {status.backend_health === true ? '🟢' : 
                 status.backend_health === false ? '🔴' : '⚫'}
              </div>
              <div className="text-sm font-medium">Backend Health</div>
              <div className="text-xs text-muted-foreground">
                {status.backend_health === true ? 'Online' : 
                 status.backend_health === false ? 'Offline' : 'Not Configured'}
              </div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {status.compatibility.features.length}
              </div>
              <div className="text-sm font-medium">Features</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuration Details
          </CardTitle>
          <CardDescription>
            Detailed status of all configuration components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Services */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Core Services (Required)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Supabase Database</span>
                {getStatusIcon(status.configuration.supabase_configured)}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Privy Authentication</span>
                {getStatusIcon(status.configuration.privy_configured)}
              </div>
            </div>
          </div>

          {/* Blockchain Configuration */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Blockchain Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Sui Network</span>
                {getStatusIcon(status.configuration.blockchain_ready)}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Smart Contracts</span>
                {getStatusIcon(status.configuration.blockchain_ready)}
              </div>
            </div>
          </div>

          {/* Backend Integration */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Existing Backend Integration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Backend URL Configured</span>
                {getStatusIcon(status.configuration.existing_backend_configured, true)}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">API Authentication</span>
                {getStatusIcon(status.configuration.existing_backend_authenticated, true)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {status.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Setup Recommendations
            </CardTitle>
            <CardDescription>
              Steps to improve your integration setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.recommendations.map((recommendation, index) => (
                <Alert key={index} variant={recommendation.includes('✅') ? 'default' : 'destructive'}>
                  <AlertDescription>
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Features */}
      {status.compatibility.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Available Features
            </CardTitle>
            <CardDescription>
              Features available with your current configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {status.compatibility.features.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
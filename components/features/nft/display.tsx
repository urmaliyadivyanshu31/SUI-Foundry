'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { suiDentityContracts, type IdentityNFTData } from '@/lib/blockchain/smart-contracts'
import { UserService } from '@/lib/db/db-functions'
import { 
  Trophy, 
  ExternalLink, 
  Star,
  Users,
  Code,
  DollarSign,
  Calendar,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface NFTDisplayProps {
  className?: string
}

export function NFTDisplay({ className = '' }: NFTDisplayProps) {
  const [nfts, setNfts] = useState<IdentityNFTData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { profile } = useUserProfile()
  const { address, explorerUrl } = useSuiWallet()

  const loadNFTs = async () => {
    if (!address || !profile || !suiDentityContracts.isConfigured()) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get NFTs from smart contract
      const userNFTs = await suiDentityContracts.getUserIdentityNFTs(address)
      setNfts(userNFTs)

    } catch (err) {
      console.error('Error loading NFTs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load NFTs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNFTs()
  }, [address, profile])

  if (!suiDentityContracts.isConfigured()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Smart contracts not configured. Please deploy contracts to use NFT features.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Identity NFTs</h3>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadNFTs}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Identity NFTs Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first Identity NFT to showcase your Web3 reputation
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-600" />
          Identity NFTs
          <Badge variant="secondary">{nfts.length}</Badge>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadNFTs}
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <NFTCard key={nft.id} nft={nft} explorerUrl={explorerUrl} />
        ))}
      </div>
    </div>
  )
}

interface NFTCardProps {
  nft: IdentityNFTData
  explorerUrl: string
}

function NFTCard({ nft, explorerUrl }: NFTCardProps) {
  const getReputationColor = (score: number) => {
    if (score >= 750) return 'text-purple-600'
    if (score >= 600) return 'text-blue-600'
    if (score >= 450) return 'text-green-600'
    if (score >= 350) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getReputationLabel = (score: number) => {
    if (score >= 750) return 'Expert'
    if (score >= 600) return 'Advanced'
    if (score >= 450) return 'Intermediate'
    if (score >= 350) return 'Beginner'
    return 'New'
  }

  return (
    <Card className="relative overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              {nft.name}
            </CardTitle>
            <CardDescription className="text-sm">
              Level {nft.level} • {getReputationLabel(nft.reputationScore)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={getReputationColor(nft.reputationScore)}>
            {nft.reputationScore}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Reputation Visualization */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className={`text-3xl font-bold ${getReputationColor(nft.reputationScore)} mb-2`}>
            {nft.reputationScore}
          </div>
          <div className="text-xs text-muted-foreground mb-3">Reputation Score</div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <Users className="w-3 h-3 text-blue-500 mx-auto mb-1" />
              <div className="font-medium">{nft.socialScore}</div>
              <div className="text-muted-foreground">Social</div>
            </div>
            <div className="text-center">
              <Code className="w-3 h-3 text-green-500 mx-auto mb-1" />
              <div className="font-medium">{nft.developerScore}</div>
              <div className="text-muted-foreground">Dev</div>
            </div>
            <div className="text-center">
              <DollarSign className="w-3 h-3 text-yellow-500 mx-auto mb-1" />
              <div className="font-medium">{nft.defiScore}</div>
              <div className="text-muted-foreground">DeFi</div>
            </div>
          </div>
        </div>

        {/* NFT Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Award className="w-3 h-3" />
              Badges
            </span>
            <span className="font-medium">{nft.badgeCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-3 h-3" />
              Level
            </span>
            <span className="font-medium">{nft.level}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Minted
            </span>
            <span className="font-medium">
              {new Date(nft.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(`${explorerUrl}/object/${nft.id}`, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            View on Explorer
          </Button>
          
          {nft.metadataUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => window.open(nft.metadataUrl, '_blank')}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              View Metadata
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact NFT summary component
export function NFTSummary({ className = '' }: { className?: string }) {
  const [nftCount, setNftCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const { profile } = useUserProfile()
  const { address } = useSuiWallet()

  useEffect(() => {
    const loadNFTCount = async () => {
      if (!address || !profile) {
        setIsLoading(false)
        return
      }

      try {
        const dbNFTs = await UserService.getUserIdentityNFTs(profile.id)
        setNftCount(dbNFTs.length)
      } catch (error) {
        console.error('Error loading NFT count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTCount()
  }, [address, profile])

  if (isLoading) {
    return <Skeleton className={`h-6 w-20 ${className}`} />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Trophy className="w-4 h-4 text-purple-600" />
      <span className="font-medium">{nftCount}</span>
      <span className="text-sm text-muted-foreground">NFT{nftCount !== 1 ? 's' : ''}</span>
    </div>
  )
}
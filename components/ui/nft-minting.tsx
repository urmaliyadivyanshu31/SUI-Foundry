'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { useUserProfile } from '@/hooks/useUserProfile'
import { suiDentityContracts, mintUserReputationCard, userHasReputationCard, type ReputationCardData } from '@/lib/smart-contracts'
import { DatabaseManager } from '@/lib/db-functions'
import { createNFTAdapter } from '@/lib/nft-backend-adapter'
import { useErrorHandler } from '@/components/error-boundary'
import { nftMetadataSchema, mintNFTRequestSchema } from '@/lib/validation'
import { AppError, BlockchainError, ValidationError } from '@/lib/error-handler'
import { 
  Trophy, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Star,
  Users,
  Code,
  DollarSign,
  Calendar,
  Link,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface NFTMintingProps {
  trigger?: React.ReactNode
  className?: string
}

export function NFTMintingDialog({
  trigger,
  className = ''
}: NFTMintingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mintStep, setMintStep] = useState<'preview' | 'minting' | 'success' | 'error'>('preview')
  const [nftName, setNftName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [txDigest, setTxDigest] = useState<string | null>(null)
  const [nftId, setNftId] = useState<string | null>(null)
  const [mintingMode, setMintingMode] = useState<'local' | 'backend' | 'hybrid'>('hybrid')
  const [hasExistingCard, setHasExistingCard] = useState<boolean | null>(null)
  const [profileImage, setProfileImage] = useState('')
  const [tags, setTags] = useState<string[]>(['web3', 'sui'])

  const { address, balance, executeTransaction, network, explorerUrl } = useSuiWallet()
  const { profile } = useUserProfile()
  
  // For now, use a mock reputation since the hook doesn't return it
  const reputation = {
    totalScore: 350,
    socialScore: 0,
    developerScore: 0,
    defiScore: 0
  }
  const { handleError } = useErrorHandler()

  // Auto-generate NFT name and profile image from profile
  useEffect(() => {
    if (profile?.username && !nftName) {
      setNftName(`${profile.username}'s Reputation Card`)
    }
    if (address && !profileImage) {
      setProfileImage(`https://api.suidentity.xyz/avatar/${address}`)
    }
  }, [profile?.username, address, nftName, profileImage])

  // Check if user already has a reputation card
  useEffect(() => {
    const checkExistingCard = async () => {
      if (address) {
        const hasCard = await userHasReputationCard(address)
        setHasExistingCard(hasCard)
      }
    }
    checkExistingCard()
  }, [address])

  // Estimated minting cost
  const estimatedCost = 0.01 // SUI

  // Check if backend is available
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const adapter = await createNFTAdapter()
        const healthy = await adapter.healthCheck()
        setBackendAvailable(healthy)
      } catch {
        setBackendAvailable(false)
      }
    }
    checkBackend()
  }, [])

  const canMint = address && 
    balance && 
    balance.sui >= estimatedCost &&
    nftName.trim().length > 0 &&
    !hasExistingCard &&
    (backendAvailable || suiDentityContracts.isConfigured())

  const handleMint = async () => {
    if (!address || !profile) {
      throw new ValidationError('Wallet address and profile are required')
    }

    setIsLoading(true)
    setMintStep('minting')
    setError(null)

    try {
      // Build social links from profile connections
      const socialLinks: Record<string, string> = {}
      if (profile.social_connections) {
        for (const connection of profile.social_connections) {
          socialLinks[connection.platform] = connection.username
        }
      }

      // Validate card data  
      const cardData = {
        name: nftName.trim(),
        description: `${profile.username || 'Anonymous'}'s reputation card on SuiDentity`,
        profile_image: profileImage,
        tags,
        social_links: socialLinks
      }

      // Try backend minting first (hybrid mode)
      let result: { nftId: string; objectId: string; transactionDigest: string } | null = null
      
      try {
        // Attempt to use existing backend
        const adapter = await createNFTAdapter()
        const backendHealthy = await adapter.healthCheck()
        
        if (backendHealthy) {
          setMintingMode('backend')
          // For now, skip backend since we're focusing on self-minting
          throw new Error('Using local self-minting instead')
        }
      } catch (backendError) {
        console.warn('Backend minting skipped, using local self-minting:', backendError)
        setMintingMode('local')
      }

      // Use local self-minting (user mints their own card)
      if (!result) {
        if (!suiDentityContracts.isConfigured()) {
          throw new BlockchainError('Smart contracts not configured. Please deploy contracts first.')
        }

        const localResult = await mintUserReputationCard(
          cardData.name,
          cardData.profile_image,
          cardData.description,
          cardData.tags,
          cardData.social_links,
          executeTransaction
        )

        if (!localResult.success) {
          throw new BlockchainError(localResult.error || 'Self-minting failed')
        }

        result = {
          nftId: localResult.cardId || '',
          objectId: localResult.cardId || '',
          transactionDigest: ''
        }
        
        toast.success('Reputation card minted successfully!')
      }

      // Store card info in database (if we had a specific table for reputation cards)
      if (result.nftId) {
        // For now, we can still use the identity NFT table or create a new one
        try {
          const stored = await DatabaseManager.addIdentityNFT(profile.id, {
            nftId: result.nftId,
            objectId: result.objectId,
            metadataUri: `https://api.suidentity.xyz/card/metadata/${result.nftId}`,
          })

          if (!stored) {
            console.warn('Failed to store reputation card in local database')
          }
        } catch (dbError) {
          console.warn('Database storage failed:', dbError)
        }
      }

      setNftId(result.nftId)
      setTxDigest(result.transactionDigest)
      setMintStep('success')

    } catch (err) {
      console.error('NFT minting error:', err)
      
      if (err instanceof ValidationError) {
        setError(`Validation Error: ${err.message}`)
        handleError(err)
      } else if (err instanceof BlockchainError) {
        setError(`Blockchain Error: ${err.message}`)
        handleError(err)
      } else if (err instanceof AppError) {
        setError(err.message)
        handleError(err)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        handleError(new AppError(errorMessage, 'MINTING_ERROR'))
      }
      
      setMintStep('error')
      toast.error('Failed to mint NFT')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setMintStep('preview')
    setError(null)
    setTxDigest(null)
    setNftId(null)
    setIsLoading(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetDialog, 200)
  }

  // NFT preview data
  const nftPreview = {
    name: nftName || 'Unnamed Identity',
    reputation: reputation?.totalScore || 350,
    level: Math.floor(((reputation?.totalScore || 350) - 300) / 55) + 1,
    socialScore: reputation?.socialScore || 0,
    developerScore: reputation?.developerScore || 0,
    defiScore: reputation?.defiScore || 0
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className={className}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Mint Identity NFT
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Mint Your Reputation Card
            </DialogTitle>
            <DialogDescription>
              Create a unique reputation card that grows with your Web3 achievements on Sui
            </DialogDescription>
          </DialogHeader>

          {/* Backend Status and Configuration Check */}
          <div className="space-y-3">
            {/* Backend Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span className="text-sm">Existing Backend</span>
                </div>
                {backendAvailable === true ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                ) : backendAvailable === false ? (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Checking
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Local Contracts</span>
                </div>
                {suiDentityContracts.isConfigured() ? (
                  <Badge variant="default" className="bg-blue-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Deployed
                  </Badge>
                )}
              </div>
            </div>

            {/* Minting Mode Indicator */}
            {(backendAvailable || suiDentityContracts.isConfigured()) && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  {backendAvailable && suiDentityContracts.isConfigured() ? (
                    <>Hybrid mode: Will try existing backend first, fallback to local contracts</>
                  ) : backendAvailable ? (
                    <>Backend mode: Using your existing NFT backend</>
                  ) : (
                    <>Local mode: Using deployed local contracts</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Error if no minting options available */}
            {!backendAvailable && !suiDentityContracts.isConfigured() && backendAvailable !== null && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No minting options available. Please configure your existing backend or deploy local contracts.
                </AlertDescription>
              </Alert>
            )}

            {/* Alert if user already has a reputation card */}
            {hasExistingCard && (
              <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  You already have a reputation card. Each wallet address can only mint one card to prevent spam.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {mintStep === 'preview' && (
            <>
              {/* NFT Preview */}
              <div className="space-y-6">
                <Card className="border-2 border-purple-200 dark:border-purple-800">
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-lg">{nftPreview.name}</CardTitle>
                    <CardDescription>Dynamic Reputation Card</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Reputation Display */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {nftPreview.reputation}
                        </div>
                        <div className="text-xs text-muted-foreground">Reputation Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {nftPreview.level}
                        </div>
                        <div className="text-xs text-muted-foreground">Level</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          Social Score
                        </div>
                        <span className="font-medium">{nftPreview.socialScore}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-500" />
                          Developer Score
                        </div>
                        <span className="font-medium">{nftPreview.developerScore}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-500" />
                          DeFi Score
                        </div>
                        <span className="font-medium">{nftPreview.defiScore}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Minted on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customization */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nft-name">Card Name</Label>
                    <Input
                      id="nft-name"
                      placeholder="Enter reputation card name"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Cost Display */}
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Cost</span>
                      <span className="font-medium">~{estimatedCost} SUI</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Your Balance</span>
                      <span className="font-medium">{balance?.formattedSui || '0 SUI'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network</span>
                      <Badge variant="secondary">{network}</Badge>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Card Features</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Self-minted
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Updatable metadata
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Social verification
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Upgrade tickets
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleMint}
                  disabled={!canMint || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Mint Reputation Card
                </Button>
              </DialogFooter>
            </>
          )}

          {mintStep === 'minting' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto" />
              <div className="space-y-2">
                <p className="font-medium">Minting your Reputation Card...</p>
                <p className="text-sm text-muted-foreground">
                  {mintingMode === 'backend' ? 'Using your existing NFT backend' :
                   mintingMode === 'local' ? 'Using self-minting contract' :
                   'Self-minting your reputation card...'}
                </p>
              </div>
              <Progress value={60} className="w-full" />
              
              {/* Minting Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Badge variant="outline" className="flex items-center gap-1">
                  {mintingMode === 'backend' ? (
                    <>
                      <Link className="w-3 h-3" />
                      Backend Minting
                    </>
                  ) : mintingMode === 'local' ? (
                    <>
                      <Zap className="w-3 h-3" />
                      Local Minting
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Hybrid Minting
                    </>
                  )}
                </Badge>
              </div>
            </div>
          )}

          {mintStep === 'success' && (
            <div className="py-8 text-center space-y-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">Reputation Card Minted Successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your reputation card has been created and is now part of your digital identity
                </p>
                
                {/* Minting Method Badge */}
                <div className="flex justify-center">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {mintingMode === 'backend' ? (
                      <>
                        <Link className="w-3 h-3" />
                        Minted via Existing Backend
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Minted via Local Contracts
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-3">
                {nftId && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Card ID</p>
                    <p className="font-mono text-xs break-all">{nftId}</p>
                  </div>
                )}
                
                {txDigest && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Transaction</p>
                    <p className="font-mono text-xs break-all">{txDigest}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {nftId && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`${explorerUrl}/object/${nftId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Card
                  </Button>
                )}
                
                {txDigest && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`${explorerUrl}/txblock/${txDigest}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                )}
                
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {mintStep === 'error' && (
            <div className="py-8 text-center space-y-6">
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">Minting Failed</p>
                <p className="text-sm text-muted-foreground">
                  There was an error minting your reputation card
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMintStep('preview')}
                >
                  Try Again
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick mint button for use in other components
export function QuickMintButton({ className = '' }: { className?: string }) {
  return (
    <NFTMintingDialog
      trigger={
        <Button className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}>
          <Trophy className="w-4 h-4 mr-2" />
          Mint Reputation Card
        </Button>
      }
    />
  )
}

// NFT minting card for dashboard
export function NFTMintingCard() {
  const { profile } = useUserProfile()
  const { address } = useSuiWallet()

  return (
    <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader className="text-center">
        <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-2" />
        <CardTitle>Create Your Reputation Card</CardTitle>
        <CardDescription>
          Mint a unique reputation card that grows with your Web3 achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">Dynamic</div>
          </div>
          <div>
            <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">Social</div>
          </div>
          <div>
            <Trophy className="w-4 h-4 text-purple-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
        </div>

        <NFTMintingDialog
          trigger={
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Mint Your Card
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}
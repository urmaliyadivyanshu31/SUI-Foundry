'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { suiDentityContracts } from '@/lib/smart-contracts'
import { useErrorHandler } from '@/components/error-boundary'
import { AppError, BlockchainError, ValidationError } from '@/lib/error-handler'
import { 
  Shield, 
  Gift, 
  Plus, 
  User, 
  Clock, 
  Star, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  Crown,
  Zap,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminPanelProps {
  className?: string
}

// Check if current user is admin
const isAdminWallet = (address: string | null): boolean => {
  if (!address) return false
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
  return adminWallet && address.toLowerCase() === adminWallet.toLowerCase()
}

export function AdminPanel({ className = '' }: AdminPanelProps) {
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Form state
  const [recipientAddress, setRecipientAddress] = useState('')
  const [ticketType, setTicketType] = useState('')
  const [benefits, setBenefits] = useState([''])
  const [expiresIn, setExpiresIn] = useState<string>('')
  const [description, setDescription] = useState('')

  const { address, executeTransaction } = useSuiWallet()
  const { handleError } = useErrorHandler()

  // Admin check
  const isAdmin = isAdminWallet(address)

  // Predefined ticket types
  const ticketTypes = [
    { value: 'premium_boost', label: 'Premium Boost', description: 'Enhances reputation score calculation' },
    { value: 'social_verification', label: 'Social Verification', description: 'Instant social media verification' },
    { value: 'exclusive_badge', label: 'Exclusive Badge', description: 'Special commemorative badge' },
    { value: 'reputation_multiplier', label: 'Reputation Multiplier', description: 'Temporary reputation score multiplier' },
    { value: 'early_adopter', label: 'Early Adopter', description: 'Special early adopter privileges' },
    { value: 'community_champion', label: 'Community Champion', description: 'Recognition for community contributions' }
  ]

  const addBenefit = () => {
    setBenefits([...benefits, ''])
  }

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index))
    }
  }

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
  }

  const resetForm = () => {
    setRecipientAddress('')
    setTicketType('')
    setBenefits([''])
    setExpiresIn('')
    setDescription('')
  }

  const validateForm = () => {
    if (!recipientAddress.trim()) {
      throw new ValidationError('Recipient address is required')
    }
    
    if (!ticketType) {
      throw new ValidationError('Ticket type is required')
    }
    
    const validBenefits = benefits.filter(b => b.trim().length > 0)
    if (validBenefits.length === 0) {
      throw new ValidationError('At least one benefit is required')
    }

    // Basic address validation (should start with 0x and be proper length)
    if (!recipientAddress.startsWith('0x') || recipientAddress.length < 42) {
      throw new ValidationError('Invalid Sui address format')
    }

    return validBenefits
  }

  const handleCreateTicket = async () => {
    setIsCreatingTicket(true)
    
    try {
      const validBenefits = validateForm()
      
      // Calculate expiration timestamp
      let expiresAt: number | undefined
      if (expiresIn) {
        const daysFromNow = parseInt(expiresIn)
        if (isNaN(daysFromNow) || daysFromNow <= 0) {
          throw new ValidationError('Expiration days must be a positive number')
        }
        expiresAt = Date.now() + (daysFromNow * 24 * 60 * 60 * 1000)
      }

      // Create transaction
      const tx = suiDentityContracts.createUpgradeTicket(
        recipientAddress.trim(),
        ticketType,
        validBenefits,
        expiresAt
      )

      // Execute transaction
      const result = await executeTransaction(tx)
      
      if (result.effects?.status?.status === 'success') {
        toast.success('Upgrade ticket created successfully!')
        
        // Reset form and close dialog
        resetForm()
        setShowCreateDialog(false)
        
        // Log for debugging
        console.log('Ticket created:', {
          recipient: recipientAddress,
          type: ticketType,
          benefits: validBenefits,
          expiresAt
        })
      } else {
        throw new BlockchainError('Transaction failed')
      }
    } catch (error) {
      console.error('Error creating upgrade ticket:', error)
      
      if (error instanceof ValidationError || error instanceof BlockchainError) {
        toast.error(error.message)
        handleError(error)
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        toast.error('Failed to create upgrade ticket')
        handleError(new AppError(errorMessage, 'ADMIN_TICKET_CREATE_ERROR'))
      }
    } finally {
      setIsCreatingTicket(false)
    }
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground mb-4">
            This panel is restricted to authorized administrators only.
          </p>
          <Badge variant="outline" className="text-muted-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Access Denied
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Admin Status */}
      <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
        <Crown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Admin Access Granted</strong> - You have administrative privileges to create upgrade tickets and special rewards.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Admin Actions
            </CardTitle>
            <CardDescription>
              Manage special rewards and upgrade tickets for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Gift className="w-4 h-4 mr-2" />
                  Create Upgrade Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    Create Upgrade Ticket
                  </DialogTitle>
                  <DialogDescription>
                    Create a special upgrade ticket for a user. These tickets provide exclusive benefits and rewards.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>

                  {/* Ticket Type */}
                  <div className="space-y-2">
                    <Label htmlFor="ticket-type">Ticket Type</Label>
                    <Select value={ticketType} onValueChange={setTicketType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span>{type.label}</span>
                              <span className="text-xs text-muted-foreground">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    <div className="space-y-2">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Benefit ${index + 1}`}
                            value={benefit}
                            onChange={(e) => updateBenefit(index, e.target.value)}
                          />
                          {benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBenefit(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBenefit}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="space-y-2">
                    <Label htmlFor="expires">Expires In (Days)</Label>
                    <Input
                      id="expires"
                      type="number"
                      placeholder="Leave empty for no expiration"
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                    />
                  </div>

                  {/* Description/Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional notes about this ticket..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Preview */}
                  {ticketType && (
                    <Alert>
                      <Star className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Preview:</strong> {ticketTypes.find(t => t.value === ticketType)?.label} ticket
                        {expiresIn && ` (expires in ${expiresIn} days)`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTicket}
                    disabled={isCreatingTicket}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isCreatingTicket ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Create rewards
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Manage tickets
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Special benefits
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Admin controls
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Types Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              Available Ticket Types
            </CardTitle>
            <CardDescription>
              Reference guide for different upgrade ticket types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketTypes.map((type) => (
              <div key={type.value} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{type.label}</h4>
                  <Badge variant="outline" className="text-xs">
                    {type.value}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Admin Guidelines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Verify recipient addresses before creating tickets</li>
                <li>• Use clear, descriptive benefit descriptions</li>
                <li>• Set appropriate expiration dates for time-sensitive rewards</li>
                <li>• Monitor ticket usage and user feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security Notes:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Admin capabilities are restricted to authorized wallets</li>
                <li>• All ticket creation is recorded on-chain</li>
                <li>• Tickets cannot be modified after creation</li>
                <li>• Users must apply tickets to their own cards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Admin status indicator component
export function AdminStatusIndicator({ className = '' }: { className?: string }) {
  const { address } = useSuiWallet()
  const isAdmin = isAdminWallet(address)

  if (!isAdmin) return null

  return (
    <Badge variant="default" className={`bg-purple-100 text-purple-800 ${className}`}>
      <Crown className="w-3 h-3 mr-1" />
      Admin
    </Badge>
  )
}
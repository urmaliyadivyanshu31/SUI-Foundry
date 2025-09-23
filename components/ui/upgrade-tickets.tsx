'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dialog'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { useUserProfile } from '@/hooks/useUserProfile'
import { suiDentityContracts, type UpgradeTicketData, type ReputationCardData } from '@/lib/smart-contracts'
import { useErrorHandler } from '@/components/error-boundary'
import { AppError, BlockchainError } from '@/lib/error-handler'
import { 
  Ticket, 
  Gift, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface UpgradeTicketsProps {
  className?: string
}

export function UpgradeTicketsPanel({ className = '' }: UpgradeTicketsProps) {
  const [tickets, setTickets] = useState<UpgradeTicketData[]>([])
  const [userCards, setUserCards] = useState<ReputationCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<UpgradeTicketData | null>(null)
  const [selectedCard, setSelectedCard] = useState<string>('')
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyDialog, setShowApplyDialog] = useState(false)

  const { address, executeTransaction, explorerUrl } = useSuiWallet()
  const { profile } = useUserProfile()
  const { handleError } = useErrorHandler()

  // Load user's upgrade tickets and reputation cards
  useEffect(() => {
    const loadData = async () => {
      if (!address) return

      setIsLoading(true)
      try {
        const [ticketsData, cardsData] = await Promise.all([
          suiDentityContracts.getUserUpgradeTickets(address),
          suiDentityContracts.getUserReputationCards(address)
        ])
        
        setTickets(ticketsData)
        setUserCards(cardsData)
        
        // Auto-select first card if user has one
        if (cardsData.length > 0 && !selectedCard) {
          setSelectedCard(cardsData[0].id)
        }
      } catch (error) {
        console.error('Error loading tickets and cards:', error)
        handleError(new AppError('Failed to load upgrade tickets', 'TICKETS_LOAD_ERROR'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [address, handleError, selectedCard])

  const handleApplyTicket = async () => {
    if (!selectedTicket || !selectedCard || !address) return

    setIsApplying(true)
    try {
      const tx = suiDentityContracts.applyUpgradeTicket(selectedCard, selectedTicket.id)
      
      const result = await executeTransaction(tx)
      
      if (result.effects?.status?.status === 'success') {
        toast.success('Upgrade ticket applied successfully!')
        
        // Refresh data
        const [updatedTickets, updatedCards] = await Promise.all([
          suiDentityContracts.getUserUpgradeTickets(address),
          suiDentityContracts.getUserReputationCards(address)
        ])
        
        setTickets(updatedTickets)
        setUserCards(updatedCards)
        setShowApplyDialog(false)
        setSelectedTicket(null)
      } else {
        throw new BlockchainError('Transaction failed')
      }
    } catch (error) {
      console.error('Error applying upgrade ticket:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to apply upgrade ticket')
      handleError(new AppError(errorMessage, 'TICKET_APPLY_ERROR'))
    } finally {
      setIsApplying(false)
    }
  }

  const openApplyDialog = (ticket: UpgradeTicketData) => {
    setSelectedTicket(ticket)
    setShowApplyDialog(true)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const isTicketExpired = (ticket: UpgradeTicketData) => {
    if (!ticket.expires_at) return false
    return Date.now() > ticket.expires_at
  }

  const canApplyTicket = (ticket: UpgradeTicketData) => {
    return !ticket.used && !isTicketExpired(ticket) && userCards.length > 0
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-2">Loading upgrade tickets...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" />
            Upgrade Tickets
          </CardTitle>
          <CardDescription>
            Apply special reward tickets to enhance your reputation card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* No cards warning */}
          {userCards.length === 0 && (
            <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                You need a reputation card to apply upgrade tickets. Mint one first!
              </AlertDescription>
            </Alert>
          )}

          {/* Tickets list */}
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No Upgrade Tickets</p>
              <p className="text-sm text-muted-foreground">
                You don't have any upgrade tickets yet. Complete quests or receive rewards from admins to get tickets.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className={`relative transition-all ${
                    ticket.used 
                      ? 'opacity-60 bg-muted/50' 
                      : isTicketExpired(ticket)
                      ? 'opacity-75 border-amber-300'
                      : 'border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <CardTitle className="text-base capitalize">
                          {ticket.ticket_type.replace('_', ' ')} Ticket
                        </CardTitle>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {ticket.used ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Used
                          </Badge>
                        ) : isTicketExpired(ticket) ? (
                          <Badge variant="destructive">
                            <Clock className="w-3 h-3 mr-1" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Benefits */}
                    <div>
                      <p className="text-sm font-medium mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {ticket.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatTimestamp(ticket.created_at)}</span>
                      </div>
                      {ticket.expires_at && (
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className={isTicketExpired(ticket) ? 'text-destructive' : ''}>
                            {formatTimestamp(ticket.expires_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Apply button */}
                    {canApplyTicket(ticket) && (
                      <Button
                        onClick={() => openApplyDialog(ticket)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="sm"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Apply to Card
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Ticket Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              Apply Upgrade Ticket
            </DialogTitle>
            <DialogDescription>
              Select which reputation card to apply this ticket to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTicket && (
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedTicket.ticket_type.replace('_', ' ')} Ticket</strong>
                  <ul className="mt-2 space-y-1">
                    {selectedTicket.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Card selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Reputation Card:</label>
              <div className="space-y-2">
                {userCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCard === card.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        : 'border-border hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedCard(card.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{card.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {card.reputation_score}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {card.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyTicket}
              disabled={!selectedCard || isApplying}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Apply Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick stats component
export function UpgradeTicketsStats({ className = '' }: { className?: string }) {
  const [ticketCount, setTicketCount] = useState<{ total: number; available: number; used: number }>({
    total: 0,
    available: 0,
    used: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const { address } = useSuiWallet()

  useEffect(() => {
    const loadStats = async () => {
      if (!address) return

      try {
        const tickets = await suiDentityContracts.getUserUpgradeTickets(address)
        
        const stats = {
          total: tickets.length,
          available: tickets.filter(t => !t.used && (!t.expires_at || Date.now() < t.expires_at)).length,
          used: tickets.filter(t => t.used).length
        }
        
        setTicketCount(stats)
      } catch (error) {
        console.error('Error loading ticket stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [address])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="w-4 h-4 text-purple-600" />
          Upgrade Tickets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{ticketCount.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{ticketCount.available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">{ticketCount.used}</div>
            <div className="text-xs text-muted-foreground">Used</div>
          </div>
        </div>
        
        {ticketCount.available > 0 && (
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
            <Gift className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              You have {ticketCount.available} upgrade ticket{ticketCount.available === 1 ? '' : 's'} ready to apply!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
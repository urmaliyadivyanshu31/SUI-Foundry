'use client'

import { useState } from 'react'
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
import { useSuiWallet, useTransactionStatus } from '@/hooks/useSuiWallet'
import { suiFormat } from '@/lib/core/sui-enhanced'
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ExternalLink,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'

interface TransactionButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function TransactionButton({
  variant = 'default',
  size = 'default',
  className = ''
}: TransactionButtonProps) {
  const { 
    address, 
    balance, 
    sendSui, 
    isTransacting,
    canAfford,
    network,
    explorerUrl
  } = useSuiWallet()

  const [isOpen, setIsOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txDigest, setTxDigest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const txStatus = useTransactionStatus(txDigest)

  // Validate recipient address
  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{64}$/.test(addr)
  }

  // Validate amount
  const isValidAmount = (amt: string) => {
    const num = parseFloat(amt)
    return !isNaN(num) && num > 0
  }

  // Calculate fees
  const estimatedFee = 0.01 // Estimated gas fee in SUI
  const totalAmount = parseFloat(amount || '0') + estimatedFee

  // Handle send transaction
  const handleSend = async () => {
    setError(null)
    setTxDigest(null)

    // Validate inputs
    if (!isValidAddress(recipient)) {
      setError('Invalid recipient address')
      return
    }

    if (!isValidAmount(amount)) {
      setError('Invalid amount')
      return
    }

    const amountNum = parseFloat(amount)
    if (!canAfford(amountNum)) {
      setError(`Insufficient balance. You need ${suiFormat.formatSuiAmount(totalAmount)} SUI`)
      return
    }

    // Send transaction
    const digest = await sendSui(recipient, amountNum, {
      showToast: false,
      onSuccess: (digest) => {
        setTxDigest(digest)
        toast.success('Transaction submitted!')
      },
      onError: (error) => {
        setError(error.message)
        toast.error('Transaction failed')
      }
    })

    if (digest) {
      // Keep dialog open to show status
      // User can close manually or view in explorer
    }
  }

  // Reset form
  const resetForm = () => {
    setRecipient('')
    setAmount('')
    setError(null)
    setTxDigest(null)
  }

  // Close dialog
  const handleClose = () => {
    setIsOpen(false)
    // Reset after animation
    setTimeout(resetForm, 200)
  }

  if (!address) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet First
      </Button>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Send className="w-4 h-4 mr-2" />
        Send SUI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send SUI</DialogTitle>
            <DialogDescription>
              Transfer SUI tokens to another address on {network}
            </DialogDescription>
          </DialogHeader>

          {!txDigest ? (
            <>
              <div className="grid gap-4 py-4">
                {/* Balance Display */}
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Your Balance</div>
                  <div className="text-lg font-semibold">
                    {balance?.formattedSui || '0 SUI'}
                  </div>
                </div>

                {/* Recipient Input */}
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="font-mono text-sm"
                  />
                  {recipient && !isValidAddress(recipient) && (
                    <p className="text-xs text-destructive">
                      Invalid Sui address format
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (SUI)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {amount && isValidAmount(amount) && (
                    <div className="text-xs text-muted-foreground">
                      + ~{estimatedFee} SUI gas fee = {suiFormat.formatSuiAmount(totalAmount)} total
                    </div>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={
                    isTransacting || 
                    !recipient || 
                    !amount ||
                    !isValidAddress(recipient) ||
                    !isValidAmount(amount)
                  }
                >
                  {isTransacting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            // Transaction Status View
            <div className="py-4">
              <div className="flex flex-col items-center space-y-4">
                {txStatus === 'pending' && (
                  <>
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-center">Transaction pending...</p>
                  </>
                )}
                
                {txStatus === 'success' && (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <p className="text-center font-semibold">Transaction successful!</p>
                  </>
                )}
                
                {txStatus === 'failed' && (
                  <>
                    <XCircle className="w-12 h-12 text-destructive" />
                    <p className="text-center font-semibold">Transaction failed</p>
                  </>
                )}

                <div className="w-full p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs break-all">
                    {suiFormat.formatDigest(txDigest)}
                  </p>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(`${explorerUrl}/tx/${txDigest}`, '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Explorer
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick send button for predefined amounts
export function QuickSendButton({
  recipient,
  amount,
  label,
  className = ''
}: {
  recipient: string
  amount: number
  label?: string
  className?: string
}) {
  const { sendSui, isTransacting, canAfford } = useSuiWallet()
  const [isSending, setIsSending] = useState(false)

  const handleQuickSend = async () => {
    if (!canAfford(amount)) {
      toast.error('Insufficient balance')
      return
    }

    setIsSending(true)
    await sendSui(recipient, amount)
    setIsSending(false)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      onClick={handleQuickSend}
      disabled={isTransacting || isSending || !canAfford(amount)}
    >
      {isSending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <>
          <Send className="w-3 h-3 mr-1" />
          {label || `Send ${amount} SUI`}
        </>
      )}
    </Button>
  )
}
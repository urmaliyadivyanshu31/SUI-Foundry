'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Heart, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TipButtonProps {
  username: string
  walletAddress: string | null
  onTipSent?: () => void
}

type TipStep = 'amount' | 'message' | 'sending' | 'success' | 'error'

const SUGGESTED_AMOUNTS = [1, 5, 10, 25, 50, 100]

export function TipButton({ username, walletAddress, onTipSent }: TipButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<TipStep>('amount')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const resetModal = () => {
    setStep('amount')
    setAmount('')
    setMessage('')
    setError('')
    setIsLoading(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetModal, 300) // Reset after close animation
  }

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString())
  }

  const handleNext = () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (numAmount > 1000) {
      setError('Maximum tip amount is 1000 SUI')
      return
    }
    setError('')
    setStep('message')
  }

  const handleSendTip = async () => {
    if (!walletAddress) {
      toast.error('No wallet address found for this user')
      return
    }

    setStep('sending')
    setIsLoading(true)

    try {
      // In a real implementation, you would:
      // 1. Connect to user's wallet
      // 2. Create and sign a Sui transaction
      // 3. Submit the transaction
      // 4. Get the transaction hash

      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate transaction hash
      const mockTransactionHash = `0x${Math.random().toString(16).slice(2, 66)}`

      // Send tip to backend
      const response = await fetch(`/api/portfolio/${username}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          message: message.trim() || undefined,
          transaction_hash: mockTransactionHash
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send tip')
      }

      setStep('success')
      onTipSent?.()
    } catch (error: any) {
      console.error('Tip error:', error)
      setError(error.message || 'Failed to send tip')
      setStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'amount':
        return (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="amount" className="text-white mb-3 block">
                Tip Amount (SUI)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white text-lg h-12"
                min="0.01"
                max="1000"
                step="0.01"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <div>
              <Label className="text-white mb-3 block">Suggested Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {SUGGESTED_AMOUNTS.map((suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    onClick={() => handleAmountSelect(suggestedAmount)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      amount === suggestedAmount.toString()
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-purple-500/50 hover:text-white'
                    }`}
                  >
                    {suggestedAmount} SUI
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-600/50 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Next
              </Button>
            </div>
          </motion.div>
        )

      case 'message':
        return (
          <motion.div
            key="message"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="message" className="text-white mb-3 block">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-800/50 border-gray-600/50 text-white resize-none"
                rows={4}
                maxLength={200}
              />
              <p className="text-sm text-gray-400 mt-2">
                {message.length}/200 characters
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Tip Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-mono">{amount} SUI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white">@{username}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('amount')}
                className="flex-1 border-gray-600/50 text-gray-300"
              >
                Back
              </Button>
              <Button
                onClick={handleSendTip}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                Send Tip
              </Button>
            </div>
          </motion.div>
        )

      case 'sending':
        return (
          <motion.div
            key="sending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <h4 className="text-xl font-semibold text-white mb-2">Sending Tip...</h4>
            <p className="text-gray-400">
              Processing your transaction on the Sui network
            </p>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Tip Sent!</h4>
            <p className="text-gray-400 mb-6">
              Your {amount} SUI tip has been sent to @{username}
            </p>
            <Button
              onClick={handleClose}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Close
            </Button>
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Failed to Send Tip</h4>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-600/50 text-gray-300"
              >
                Close
              </Button>
              <Button
                onClick={() => setStep('amount')}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 flex items-center gap-2"
      >
        <Heart className="w-4 h-4" />
        Tip Me
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900/95 border-purple-500/30 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-400" />
              Send a Tip to @{username}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-[300px] flex flex-col">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
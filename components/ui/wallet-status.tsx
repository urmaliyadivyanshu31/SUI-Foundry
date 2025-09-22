'use client'

import { useState } from 'react'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Send,
  ChevronDown,
  Coins,
  History,
  Image
} from 'lucide-react'
import { toast } from 'sonner'

interface WalletStatusProps {
  compact?: boolean
  showBalance?: boolean
  showNetwork?: boolean
  className?: string
}

export function WalletStatus({ 
  compact = false, 
  showBalance = true,
  showNetwork = true,
  className = ''
}: WalletStatusProps) {
  const {
    address,
    formattedAddress,
    isConnected,
    balance,
    isLoadingBalance,
    refreshBalance,
    network,
    explorerUrl
  } = useSuiWallet()

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }
  }

  // Refresh balance with animation
  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // View in explorer
  const viewInExplorer = () => {
    if (address) {
      window.open(`${explorerUrl}/address/${address}`, '_blank')
    }
  }

  if (!isConnected) {
    return compact ? null : (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Wallet className="w-4 h-4 mr-2" />
            <span>No wallet connected</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact view for header/navbar
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Wallet className="w-4 h-4 mr-2" />
            <span className="font-mono text-xs">{formattedAddress}</span>
            {showBalance && !isLoadingBalance && (
              <span className="ml-2 text-xs text-muted-foreground">
                {balance?.formattedSui || '0 SUI'}
              </span>
            )}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>Sui Wallet</span>
              {showNetwork && (
                <Badge variant="secondary" className="text-xs">
                  {network}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="px-2 py-2">
            <div className="text-xs text-muted-foreground mb-1">Address</div>
            <div className="font-mono text-xs break-all">{address}</div>
          </div>
          
          {showBalance && (
            <div className="px-2 py-2">
              <div className="text-xs text-muted-foreground mb-1">Balance</div>
              <div className="font-semibold">
                {isLoadingBalance ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  balance?.formattedSui || '0 SUI'
                )}
              </div>
            </div>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={viewInExplorer}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View in Explorer
          </DropdownMenuItem>
          
          {showBalance && (
            <DropdownMenuItem onClick={handleRefreshBalance}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Balance
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Full card view
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sui Wallet</CardTitle>
          {showNetwork && (
            <Badge variant="outline">
              {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage your Sui blockchain assets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Section */}
        <div>
          <div className="text-sm font-medium mb-2">Wallet Address</div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <code className="text-xs font-mono">{formattedAddress}</code>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyAddress}
                className="h-7 w-7 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={viewInExplorer}
                className="h-7 w-7 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        {showBalance && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Balance</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefreshBalance}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
              {isLoadingBalance ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <div className="text-2xl font-bold">
                    {balance?.sui?.toFixed(4) || '0.0000'}
                    <span className="text-sm font-normal ml-1 text-muted-foreground">SUI</span>
                  </div>
                  {balance && balance.allBalances.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      + {balance.allBalances.length - 1} other tokens
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Network: {network}</span>
            <span>Powered by Privy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mini wallet badge for inline display
export function WalletBadge({ className = '' }: { className?: string }) {
  const { formattedAddress, isConnected, balance, isLoadingBalance } = useSuiWallet()

  if (!isConnected) return null

  return (
    <Badge variant="secondary" className={`font-mono ${className}`}>
      <Wallet className="w-3 h-3 mr-1" />
      {formattedAddress}
      {!isLoadingBalance && balance && (
        <span className="ml-2 text-muted-foreground">
          {balance.sui.toFixed(2)} SUI
        </span>
      )}
    </Badge>
  )
}
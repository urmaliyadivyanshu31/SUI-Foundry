'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

interface PortfolioUser {
  username: string
  profile_picture: string | null
  wallet_address: string | null
  created_at: string
}

interface SocialConnection {
  platform: string
  username: string
  verified: boolean
  profile_data: any
}

interface PortfolioHeaderProps {
  user: PortfolioUser
  socialConnections: SocialConnection[]
  onTipClick: () => void
}

export function PortfolioHeader({ user, socialConnections, onTipClick }: PortfolioHeaderProps) {
  const [addressCopied, setAddressCopied] = useState(false)

  const formatAddress = (address: string | null) => {
    if (!address) return 'No address'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (!user.wallet_address) return
    
    try {
      await navigator.clipboard.writeText(user.wallet_address)
      setAddressCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setAddressCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const githubConnection = socialConnections.find(conn => conn.platform === 'github')
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20 rounded-2xl" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative bg-gray-900/40 backdrop-blur border border-purple-500/20 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-purple-500/30">
              <AvatarImage src={user.profile_picture || undefined} alt={user.username} />
              <AvatarFallback className="text-2xl font-bold bg-purple-900/50">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                @{user.username}
              </h1>
              
              {/* Wallet Address */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-400">Wallet:</span>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
                  disabled={!user.wallet_address}
                >
                  <span className="font-mono">
                    {formatAddress(user.wallet_address)}
                  </span>
                  {addressCopied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-400">
                Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Social Connections */}
          <div className="flex items-center gap-3 lg:ml-auto">
            {githubConnection && (
              <Badge 
                variant="secondary" 
                className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
              >
                <Github className="w-3 h-3 mr-1" />
                {githubConnection.username}
                {githubConnection.verified && (
                  <span className="ml-1 text-green-400">✓</span>
                )}
              </Badge>
            )}

            {socialConnections
              .filter(conn => conn.platform !== 'github')
              .map((connection) => (
                <Badge 
                  key={connection.platform}
                  variant="secondary"
                  className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
                >
                  {connection.platform}
                  {connection.verified && (
                    <span className="ml-1 text-green-400">✓</span>
                  )}
                </Badge>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {githubConnection?.profile_data?.html_url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gray-600/50 text-gray-300 hover:text-white hover:border-purple-500/50"
              >
                <a 
                  href={githubConnection.profile_data.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
            )}

            <Button
              onClick={onTipClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              size="sm"
            >
              💎 Tip Me
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
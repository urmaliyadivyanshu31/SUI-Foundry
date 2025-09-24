'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { 
  LogOut, 
  Github, 
  Linkedin, 
  Instagram,
  Users,
  Trophy,
  Star,
  Target,
  Zap,
  Copy
} from 'lucide-react'
import { motion } from 'framer-motion'

// AI Chat Modal Component
const AiChatModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai'}>>([
    { id: 1, text: "Hello! I'm your AI career coach. How can I help you today?", sender: 'ai' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user' as const
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "Thanks for your question! I'm here to help with career guidance, skill development, and professional growth. What specific area would you like to focus on?",
        sender: 'ai' as const
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          width: '90%',
          maxWidth: '500px',
          height: '600px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <CornerBrackets size={20} opacity={0.4} />
        
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
            opacity: 0.8
          }}>
            AI CAREER COACH
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                background: message.sender === 'user' 
                  ? 'rgba(147, 51, 234, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${message.sender === 'user' 
                  ? 'rgba(147, 51, 234, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '0px',
                fontSize: '13px',
                color: 'white',
                lineHeight: '1.5'
              }}>
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
                fontSize: '13px',
                color: '#9ca3af'
              }}>
                AI is typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your career..."
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0px',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'white',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            style={{
              background: inputMessage.trim() 
                ? 'rgba(147, 51, 234, 0.2)' 
                : 'rgba(100, 100, 100, 0.1)',
              border: `1px solid ${inputMessage.trim() 
                ? 'rgba(147, 51, 234, 0.3)' 
                : 'rgba(100, 100, 100, 0.2)'}`,
              borderRadius: '0px',
              padding: '12px 20px',
              fontSize: '11px',
              fontWeight: '600',
              color: inputMessage.trim() ? '#c084fc' : '#666666',
              cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
              opacity: inputMessage.trim() ? 1 : 0.5
            }}
          >
            SEND
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// NFT Mini Cards Component
const NFTMiniCards = ({ nfts }: { nfts: any[] }) => {
  if (!nfts || nfts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '10px',
        padding: '20px'
      }}>
        NO NFTS FOUND
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '8px'
    }}>
      {nfts.map((nft, index) => (
        <div key={nft.id || index} style={{
          minWidth: '80px',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.2)'
          e.currentTarget.style.cursor = 'pointer'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        title={`${nft.nft_name || 'Unknown NFT'} (${nft.network?.toUpperCase() || 'UNKNOWN'}) - Click to view in explorer`}
        onClick={() => {
          const explorerUrl = nft.network === 'mainnet' 
            ? `https://suiscan.xyz/mainnet/object/${nft.object_id}`
            : `https://suiscan.xyz/testnet/object/${nft.object_id}`
          window.open(explorerUrl, '_blank', 'noopener,noreferrer')
        }}
        >
          {/* Network Indicator */}
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: nft.network === 'mainnet' ? '#10b981' : '#f59e0b'
          }} />
          
          {/* NFT Image or Placeholder */}
          {nft.image_url ? (
            <img 
              src={nft.image_url} 
              alt={nft.nft_name || 'NFT'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '0px'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Fallback Placeholder */}
          <div style={{
            display: nft.image_url ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.4)'
          }}>
            🖼️
          </div>
          
          {/* NFT Name Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '4px',
            fontSize: '8px',
            color: 'white',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {nft.nft_name || 'UNKNOWN'}
          </div>
        </div>
      ))}
    </div>
  )
}

// OnChainData Component
const OnChainData = ({ walletAddress }: { walletAddress?: string }) => {
  const [onChainData, setOnChainData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOnChainData = async () => {
      if (!walletAddress) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/blockchain/address/${walletAddress}?t=${Date.now()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch on-chain data')
        }
        const data = await response.json()
        console.log('🔍 OnChainData received:', data)
        setOnChainData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        console.error('Error fetching on-chain data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnChainData()
  }, [walletAddress])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: '#9ca3af'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(147, 51, 234, 0.3)',
            borderTop: '2px solid #9333ea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            LOADING ON-CHAIN DATA...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#ef4444',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}>
          ERROR LOADING DATA
        </div>
        <div style={{
          fontSize: '10px',
          color: '#9ca3af'
        }}>
          {error}
        </div>
      </div>
    )
  }

  if (!onChainData) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0px',
        padding: '20px',
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <div style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          NO ON-CHAIN DATA AVAILABLE
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    }}>
      {/* Balance Info */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0px',
        padding: '20px',
        position: 'relative'
      }}>
        <CornerBrackets size={12} opacity={0.2} />
        <div style={{
          fontSize: '11px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          SUI BALANCE
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#06b6d4',
          marginBottom: '4px'
        }}>
          {onChainData.balance || '0'} SUI
        </div>
        <div style={{
          fontSize: '9px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div>${onChainData.balanceUsd || 'N/A'} USD</div>
          {onChainData.networks && (
            <div style={{ fontSize: '8px', opacity: 0.7 }}>
              <span style={{ color: '#10b981' }}>M: {onChainData.networks.mainnet.balance}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span style={{ color: '#f59e0b' }}>T: {onChainData.networks.testnet.balance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Count */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0px',
        padding: '20px',
        position: 'relative'
      }}>
        <CornerBrackets size={12} opacity={0.2} />
        <div style={{
          fontSize: '11px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          TRANSACTIONS
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#22c55e',
          marginBottom: '4px'
        }}>
          {onChainData.transactionCount || 0}
        </div>
        <div style={{
          fontSize: '9px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          TOTAL TX COUNT
        </div>
      </div>

      {/* NFTs Owned */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0px',
        padding: '20px',
        position: 'relative'
      }}>
        <CornerBrackets size={12} opacity={0.2} />
        <div style={{
          fontSize: '11px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          NFTs OWNED
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#c084fc',
          marginBottom: '4px'
        }}>
          {onChainData.nftCount || 0}
        </div>
        <div style={{
          fontSize: '9px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div>DIGITAL ASSETS</div>
          {onChainData.networks && (
            <div style={{ fontSize: '8px', opacity: 0.7 }}>
              <span style={{ color: '#10b981' }}>M: {onChainData.networks.mainnet.nftCount || 0}</span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span style={{ color: '#f59e0b' }}>T: {onChainData.networks.testnet.nftCount || 0}</span>
            </div>
          )}
        </div>
        
        {/* NFT Cards within the same section */}
        {onChainData && onChainData.nfts && onChainData.nfts.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              marginBottom: '12px'
            }} />
            
            <NFTMiniCards nfts={onChainData.nfts} />
          </div>
        )}
      </div>

      {/* Last Activity */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0px',
        padding: '20px',
        position: 'relative'
      }}>
        <CornerBrackets size={12} opacity={0.2} />
        <div style={{
          fontSize: '11px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          LAST ACTIVITY
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '4px'
        }}>
          {onChainData.lastActivity ? new Date(onChainData.lastActivity).toLocaleDateString() : 'N/A'}
        </div>
        <div style={{
          fontSize: '9px',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          RECENT TRANSACTION
        </div>
      </div>
    </div>
  )
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  header: {
    position: 'fixed' as const,
    top: '30px',
    left: '60px',
    right: '60px',
    zIndex: 50,
  },
  
  headerContainer: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  
  navLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '0px',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  
  navLinkActive: {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  
  userInfo: {
    textAlign: 'right' as const
  },
  
  username: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  },
  
  address: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '120px 60px 60px 60px'
  },
  
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  pageSubtitle: {
    fontSize: '16px',
    color: '#9ca3af',
    marginBottom: '40px'
  },

  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '40px'
  },

  section: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  profileContent: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },

  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },

  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '0px',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0
  },

  profileInfo: {
    flex: 1
  },

  profileDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },

  profileField: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '16px',
    textAlign: 'center' as const
  },

  fieldLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },

  fieldValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white'
  },

  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },

  socialCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '20px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    position: 'relative' as const
  },

  socialIcon: {
    marginBottom: '12px',
    color: 'rgba(255, 255, 255, 0.8)'
  },

  socialName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  socialStatus: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '16px',
    textTransform: 'uppercase' as const
  },

  connectButton: {
    background: 'rgba(147, 51, 234, 0.2)',
    border: '1px solid rgba(147, 51, 234, 0.4)',
    borderRadius: '0px',
    padding: '8px 16px',
    color: '#c084fc',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    width: '100%'
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px'
  },

  metricCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    textAlign: 'center' as const,
    position: 'relative' as const
  },

  metricValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px'
  },

  metricLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  cornerBrackets: {
    position: 'absolute' as const,
    inset: '-2px',
    pointerEvents: 'none' as const
  }
}

// Abstract Geometric Logo Component
const LogoIcon = () => (
  <div style={{
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }}>
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%'
    }}>
      {/* Main cube shape */}
      <div style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        top: '8px',
        left: '8px',
        background: 'transparent',
        border: '2px solid #c084fc',
        transform: 'rotate(45deg)'
      }} />
      
      {/* Overlapping second shape */}
      <div style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        top: '4px',
        left: '12px',
        background: 'rgba(147, 51, 234, 0.3)',
        border: '1px solid rgba(147, 51, 234, 0.6)',
        transform: 'rotate(45deg)',
        backdropFilter: 'blur(4px)'
      }} />
      
      {/* Third accent shape */}
      <div style={{
        position: 'absolute',
        width: '16px',
        height: '16px',
        top: '6px',
        left: '10px',
        background: 'rgba(192, 132, 252, 0.2)',
        border: '1px solid rgba(192, 132, 252, 0.4)',
        transform: 'rotate(45deg)',
        backdropFilter: 'blur(2px)'
      }} />
    </div>
  </div>
)

// X (Twitter) Logo Component
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const CornerBrackets = ({ size = 20, opacity = 0.3 }: { size?: number, opacity?: number }) => (
  <div style={styles.cornerBrackets}>
    <div style={{
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      width: `${size}px`,
      height: `${size}px`,
      borderTop: `1px solid rgba(255, 255, 255, ${opacity})`,
      borderLeft: `1px solid rgba(255, 255, 255, ${opacity})`,
    }} />
    <div style={{
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: `${size}px`,
      height: `${size}px`,
      borderTop: `1px solid rgba(255, 255, 255, ${opacity})`,
      borderRight: `1px solid rgba(255, 255, 255, ${opacity})`,
    }} />
    <div style={{
      position: 'absolute',
      bottom: '-2px',
      left: '-2px',
      width: `${size}px`,
      height: `${size}px`,
      borderBottom: `1px solid rgba(255, 255, 255, ${opacity})`,
      borderLeft: `1px solid rgba(255, 255, 255, ${opacity})`,
    }} />
    <div style={{
      position: 'absolute',
      bottom: '-2px',
      right: '-2px',
      width: `${size}px`,
      height: `${size}px`,
      borderBottom: `1px solid rgba(255, 255, 255, ${opacity})`,
      borderRight: `1px solid rgba(255, 255, 255, ${opacity})`,
    }} />
  </div>
)

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, socialConnections, isLoading: isProfileLoading } = useUserProfile()
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // Redirect to setup if not authenticated or no username
  useEffect(() => {
    if (!isLoading && !isProfileLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (!profile?.username) {
        router.push('/profile/setup')
      }
    }
  }, [isAuthenticated, profile, isLoading, isProfileLoading, router])

  if (isLoading || isProfileLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address
  const reputationScore = profile.reputation_scores?.[0]?.total_score || 300

  const socialPlatforms = [
    { 
      name: 'GitHub', 
      icon: Github, 
      connected: socialConnections?.some(sc => sc.platform === 'github') 
    },
    { 
      name: 'X', 
      icon: XIcon, 
      connected: socialConnections?.some(sc => sc.platform === 'twitter') 
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      connected: false 
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      connected: false 
    }
  ]

  return (
    <div style={styles.pageContainer}>
      {/* Header with Corner Brackets */}
      <div style={styles.header}>
        <div style={styles.headerContainer}>
          <CornerBrackets />
          
          {/* Logo */}
          <Link href="/" style={styles.logo}>
            <LogoIcon />
          </Link>

          {/* Navigation Menu */}
          <nav style={styles.navigation}>
            <Link 
              href="/dashboard" 
              style={{...styles.navLink, ...styles.navLinkActive}}
            >
              DASHBOARD
            </Link>
            
            <Link 
              href="/dashboard/quests" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              QUESTS
            </Link>
            
            <Link 
              href="/dashboard/leaderboard" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              LEADERBOARD
            </Link>
            
            <Link 
              href="/dashboard/jobs" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              JOBS
            </Link>
          </nav>

          {/* User Menu */}
          <div style={styles.userMenu}>
            <div style={styles.userInfo}>
              <div style={styles.username}>@{profile.username}</div>
              <div style={styles.address}>
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '0px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        </motion.div>

        {/* Top Row - User Profile and Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* User Profile */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              ...styles.section,
              padding: '24px 32px'
            }}
          >
            <CornerBrackets size={16} opacity={0.3} />
            
            {/* Section Title */}
            <h2 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '20px',
              opacity: 0.8
            }}>
              USER PROFILE
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                position: 'relative',
                flexShrink: 0
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '0px',
                  background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      // Handle image upload here
                      console.log('Image selected:', file.name)
                    }
                  }
                  input.click()
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.filter = 'brightness(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.filter = 'brightness(1)'
                }}
                title="Click to upload profile image"
                >
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
                
                {/* Edit indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  background: '#9333ea',
                  border: '2px solid #0a0a0a',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  color: 'white'
                }}>
                  +
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  @{profile.username}
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span 
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onClick={() => navigator.clipboard.writeText(walletAddress || '')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#c084fc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                    }}
                    title="Click to copy address"
                  >
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                    <Copy size={12} style={{ opacity: 0.6 }} />
                  </span>
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#22c55e' }}>ACTIVE</span>
                  <span>•</span>
                  <span>MEMBER SINCE {new Date(profile.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Key Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              ...styles.section,
              padding: '24px 32px'
            }}
          >
            <CornerBrackets size={16} opacity={0.3} />
            
            {/* Section Title with Tier Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.8,
                margin: 0
              }}>
                KEY METRICS
              </h2>
              <div style={{
                background: 'rgba(147, 51, 234, 0.2)',
                border: '1px solid rgba(147, 51, 234, 0.4)',
                borderRadius: '0px',
                padding: '4px 8px',
                fontSize: '9px',
                fontWeight: '600',
                color: '#c084fc',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                TIER: {reputationScore >= 700 ? 'EXPERT' : reputationScore >= 500 ? 'ADVANCED' : reputationScore >= 300 ? 'INTERMEDIATE' : 'BEGINNER'}
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {/* Reputation Score Card */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
                padding: '24px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <CornerBrackets size={12} opacity={0.2} />
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  REPUTATION SCORE
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#c084fc',
                  lineHeight: '1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {reputationScore}
                </div>
              </div>
              
              {/* XP Earned Card */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
                padding: '24px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <CornerBrackets size={12} opacity={0.2} />
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  XP EARNED
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  lineHeight: '1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {Math.round(reputationScore * 2.5)}
                </div>
              </div>
              
              {/* Connections Card */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0px',
                padding: '24px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
              >
                <CornerBrackets size={12} opacity={0.2} />
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  CONNECTIONS
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'white',
                  lineHeight: '1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {socialConnections?.length || 0}
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* On-Chain Data */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            ...styles.section,
            padding: '24px 32px'
          }}
        >
          <CornerBrackets size={16} opacity={0.3} />
          
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '20px',
            opacity: 0.8
          }}>
            ON-CHAIN DATA
          </h2>
          
          {/* Network Legend */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: 0.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }} />
              <span>MAINNET</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#f59e0b',
                borderRadius: '50%'
              }} />
              <span>TESTNET</span>
            </div>
          </div>
          
          <OnChainData walletAddress={walletAddress} />
        </motion.section>

        {/* Social Connections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            ...styles.section,
            padding: '24px 32px'
          }}
        >
          <CornerBrackets size={16} opacity={0.3} />
          
          <h2 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '20px',
            opacity: 0.8
          }}>
            SOCIAL CONNECTIONS
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {socialPlatforms.map((platform, index) => {
              const IconComponent = platform.icon
              return (
                <div key={platform.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 0'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <IconComponent size={20} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '2px'
                    }}>
                      {platform.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: platform.connected ? '#22c55e' : '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {platform.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                    </div>
                  </div>
                  
                  <button style={{
                    background: 'transparent',
                    border: platform.connected ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '0px',
                    padding: '6px 12px',
                    color: platform.connected ? '#22c55e' : '#c084fc',
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {platform.connected ? 'MANAGE' : 'CONNECT'}
                  </button>
                </div>
              )
            })}
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => {
                console.log('Mint profile clicked')
              }}
              disabled={!socialConnections || socialConnections.length < 2}
              style={{
                background: socialConnections && socialConnections.length >= 2 
                  ? 'rgba(147, 51, 234, 0.2)' 
                  : 'rgba(100, 100, 100, 0.1)',
                border: socialConnections && socialConnections.length >= 2 
                  ? '1px solid rgba(147, 51, 234, 0.4)' 
                  : '1px solid rgba(100, 100, 100, 0.2)',
                borderRadius: '0px',
                padding: '12px 24px',
                color: socialConnections && socialConnections.length >= 2 
                  ? '#c084fc' 
                  : '#666666',
                fontSize: '11px',
                fontWeight: '600',
                cursor: socialConnections && socialConnections.length >= 2 ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
                opacity: socialConnections && socialConnections.length >= 2 ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (socialConnections && socialConnections.length >= 2) {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.6)'
                }
              }}
              onMouseLeave={(e) => {
                if (socialConnections && socialConnections.length >= 2) {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)'
                }
              }}
            >
              MINT YOUR PROFILE
            </button>
            
            <button
              onClick={() => {
                console.log('Preview portfolio clicked')
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0px',
                padding: '12px 24px',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              PREVIEW PORTFOLIO
            </button>
          </div>
        </motion.section>
      </div>

      {/* Floating AI Support Button */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setIsAiModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          title="AI Coach - Get personalized career guidance"
        >
          <CornerBrackets size={12} opacity={0.3} />
          
          {/* AI Text */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#c084fc',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            AI
          </div>
        </button>
      </div>

      {/* AI Chat Modal */}
      <AiChatModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      <style jsx>{`
        .social-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Coffee, 
  Heart, 
  Send, 
  Wallet, 
  TrendingUp, 
  Gift,
  Copy,
  ExternalLink,
  MessageSquare,
  Star,
  Users,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Share2
} from 'lucide-react'
import { Tip } from '@/types'

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #0a0a0a 0%, #000000 50%, #0a0a0a 100%)',
    color: 'white',
    fontFamily: '"Courier New", monospace',
    overflow: 'hidden',
    position: 'relative' as const
  },

  backgroundGrid: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    animation: 'grid-move 20s linear infinite',
    zIndex: 1
  },

  header: {
    position: 'fixed' as const,
    top: '20px',
    left: '20px',
    right: '20px',
    zIndex: 50,
  },

  headerContainer: {
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    borderRadius: '0px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    boxShadow: '0 0 30px rgba(0, 255, 0, 0.2)'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase' as const,
    letterSpacing: '3px',
    fontFamily: '"Courier New", monospace'
  },

  mainContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '100px 30px 60px 30px',
    position: 'relative',
    zIndex: 10
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
  },

  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  shareButton: {
    padding: '12px 20px',
    background: 'rgba(0, 153, 204, 0.1)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    color: '#0099cc',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },

  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },

  mainPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },

  statsPanel: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    padding: '25px',
    boxShadow: '0 0 30px rgba(0, 255, 0, 0.1)'
  },

  panelTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(0, 255, 0, 0.05)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    marginBottom: '10px'
  },

  statLabel: {
    fontSize: '11px',
    color: '#0099cc',
    textTransform: 'uppercase',
    fontWeight: '600'
  },

  statValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: 'bold'
  },

  sponsorCard: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(255, 165, 0, 0.4)',
    padding: '25px',
    boxShadow: '0 0 30px rgba(255, 165, 0, 0.1)',
    position: 'relative' as const
  },

  sponsorTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffa500',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '15px',
    textAlign: 'center' as const
  },

  addressDisplay: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    padding: '15px',
    marginBottom: '15px',
    fontSize: '11px',
    color: '#ffa500',
    fontFamily: '"Courier New", monospace',
    wordBreak: 'break-all' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  copyButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffa500',
    cursor: 'pointer',
    padding: '4px',
    transition: 'all 0.2s ease'
  },

  quickTipButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '15px'
  },

  quickTipButton: {
    padding: '12px',
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    color: '#ffa500',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },

  customTipForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },

  input: {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    color: '#ffa500',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  textarea: {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    color: '#ffa500',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '60px',
    transition: 'all 0.3s ease'
  },

  sendTipButton: {
    width: '100%',
    padding: '15px',
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    color: '#ffa500',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },

  recentTips: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    padding: '25px',
    boxShadow: '0 0 30px rgba(0, 153, 204, 0.1)'
  },

  tipItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(0, 153, 204, 0.05)',
    border: '1px solid rgba(0, 153, 204, 0.2)',
    marginBottom: '10px'
  },

  tipInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },

  tipDirection: {
    width: '24px',
    height: '24px',
    background: 'rgba(0, 153, 204, 0.2)',
    border: '1px solid rgba(0, 153, 204, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px'
  },

  tipDetails: {
    flex: 1
  },

  tipUser: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0099cc'
  },

  tipMessage: {
    fontSize: '10px',
    color: '#cccccc',
    marginTop: '2px'
  },

  tipAmount: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff'
  },

  tipTime: {
    fontSize: '9px',
    color: '#666666'
  },

  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#666666',
    fontSize: '12px'
  },

  qrSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    marginBottom: '15px'
  },

  qrPlaceholder: {
    width: '120px',
    height: '120px',
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#000000'
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
      <div style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        top: '8px',
        left: '8px',
        background: 'transparent',
        border: '2px solid #00ff00',
        transform: 'rotate(45deg)'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        top: '4px',
        left: '12px',
        background: 'rgba(0, 255, 0, 0.3)',
        border: '1px solid rgba(0, 255, 0, 0.6)',
        transform: 'rotate(45deg)',
        backdropFilter: 'blur(4px)'
      }} />
      
      <div style={{
        position: 'absolute',
        width: '16px',
        height: '16px',
        top: '6px',
        left: '10px',
        background: 'rgba(0, 255, 0, 0.2)',
        border: '1px solid rgba(0, 255, 0, 0.4)',
        transform: 'rotate(45deg)',
        backdropFilter: 'blur(2px)'
      }} />
    </div>
  </div>
)

export default function SponsorPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [tipStats, setTipStats] = useState({
    total_sent: 0,
    total_received: 0,
    tips_sent_count: 0,
    tips_received_count: 0
  })
  const [customAmount, setCustomAmount] = useState('')
  const [tipMessage, setTipMessage] = useState('')

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

  // Fetch tips and stats
  const fetchTips = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tips')
      const result = await response.json()
      
      if (result.success) {
        setTips(result.data.tips)
        setTipStats(result.data.totals)
      } else {
        console.error('Failed to fetch tips:', result.error)
      }
    } catch (error) {
      console.error('Error fetching tips:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchTips()
    }
  }, [isAuthenticated])

  const copyWalletAddress = async () => {
    if (user?.walletAddress) {
      try {
        await navigator.clipboard.writeText(user.walletAddress)
        alert('Wallet address copied!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const handleQuickTip = (amount: number) => {
    setCustomAmount(amount.toString())
  }

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${profile?.username}`
    
    if (navigator.share) {
      navigator.share({
        title: `Sponsor @${profile?.username} on SuiDentity`,
        text: `Support @${profile?.username}'s Web3 journey`,
        url: profileUrl
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(profileUrl)
      alert('Profile link copied to clipboard!')
    }
  }

  const formatAmount = (amount: number) => {
    return (amount / 1000000000).toFixed(2) // Convert MIST to SUI
  }

  if (isLoading || isProfileLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '14px',
          color: '#00ff00',
          fontFamily: '"Courier New", monospace'
        }}>
          LOADING_SPONSORSHIP_INTERFACE...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address

  return (
    <div style={styles.pageContainer}>
      {/* Animated background grid */}
      <div style={styles.backgroundGrid} />

      {/* Header */}
      <nav style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo */}
          <Link href="/" style={styles.logo}>
            <LogoIcon />
            <span style={styles.logoText}>SUIDENTITY</span>
          </Link>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              textAlign: 'right' as const,
              fontSize: '11px',
              fontFamily: '"Courier New", monospace'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#00ff00' }}>
                @{profile.username}
              </div>
              <div style={{ fontSize: '10px', color: '#0099cc', opacity: 0.8 }}>
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                color: '#ff4444',
                padding: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '12px',
                fontFamily: '"Courier New", monospace'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.3)'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.pageHeader}
        >
          <div>
            <h1 style={styles.pageTitle}>
              <Coffee size={24} />
              ║█║ SPONSOR_INTERFACE ║█║
            </h1>
            <div style={{
              fontSize: '11px',
              color: '#0099cc',
              marginTop: '5px',
              fontFamily: '"Courier New", monospace'
            }}>
              BUY_ME_COFFEE_PROTOCOL // SUI_POWERED_TIPS
            </div>
          </div>

          <button
            style={styles.shareButton}
            onClick={shareProfile}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.2)'
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 153, 204, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Share2 size={14} />
            SHARE_PROFILE
          </button>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.contentGrid}
        >
          {/* Main Panel */}
          <div style={styles.mainPanel}>
            {/* Sponsor Card */}
            <div style={styles.sponsorCard}>
              <div style={styles.sponsorTitle}>
                ◆ SPONSOR_@{profile.username.toUpperCase()} ◆
              </div>

              {/* QR Code Section */}
              <div style={styles.qrSection}>
                <div style={styles.qrPlaceholder}>
                  <QrCode size={40} />
                  <span style={{ marginLeft: '8px' }}>QR_CODE</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div style={styles.addressDisplay}>
                <span>{walletAddress}</span>
                <button
                  style={styles.copyButton}
                  onClick={copyWalletAddress}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ffa500'
                  }}
                >
                  <Copy size={12} />
                </button>
              </div>

              {/* Quick Tip Buttons */}
              <div style={styles.quickTipButtons}>
                {[1, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    style={styles.quickTipButton}
                    onClick={() => handleQuickTip(amount)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)'
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 165, 0, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 165, 0, 0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Coffee size={12} />
                    {amount} SUI
                  </button>
                ))}
              </div>

              {/* Custom Tip Form */}
              <div style={styles.customTipForm}>
                <input
                  type="number"
                  style={styles.input}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="CUSTOM_AMOUNT_IN_SUI"
                  step="0.1"
                  min="0"
                />
                <textarea
                  style={styles.textarea}
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  placeholder="OPTIONAL_MESSAGE..."
                />
                <button
                  style={styles.sendTipButton}
                  disabled={!customAmount || parseFloat(customAmount) <= 0}
                  onMouseEnter={(e) => {
                    if (customAmount && parseFloat(customAmount) > 0) {
                      e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)'
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 165, 0, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 165, 0, 0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => alert('Sui wallet integration coming soon!')}
                >
                  <Send size={14} />
                  SEND_TIP
                </button>
              </div>
            </div>

            {/* Recent Tips */}
            <div style={styles.recentTips}>
              <div style={{...styles.panelTitle, color: '#0099cc'}}>
                <MessageSquare size={16} />
                RECENT_ACTIVITY
              </div>
              
              {loading ? (
                <div style={styles.emptyState}>
                  LOADING_TIP_HISTORY...
                </div>
              ) : tips.length === 0 ? (
                <div style={styles.emptyState}>
                  NO_TIPS_YET // START_SUPPORTING_CREATORS
                </div>
              ) : (
                tips.map((tip) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={styles.tipItem}
                  >
                    <div style={styles.tipInfo}>
                      <div style={styles.tipDirection}>
                        {tip.from_user_id === user?.id ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownLeft size={12} />
                        )}
                      </div>
                      <div style={styles.tipDetails}>
                        <div style={styles.tipUser}>
                          {tip.from_user_id === user?.id 
                            ? `TO @${tip.to_user?.username}` 
                            : `FROM @${tip.from_user?.username}`
                          }
                        </div>
                        {tip.message && (
                          <div style={styles.tipMessage}>
                            "{tip.message}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={styles.tipAmount}>
                        {formatAmount(tip.amount)} {tip.token_type}
                      </div>
                      <div style={styles.tipTime}>
                        {new Date(tip.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div style={styles.statsPanel}>
            <div style={styles.panelTitle}>
              <TrendingUp size={16} />
              TIP_STATISTICS
            </div>

            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Received</span>
              <span style={styles.statValue}>
                {formatAmount(tipStats.total_received)} SUI
              </span>
            </div>

            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Sent</span>
              <span style={styles.statValue}>
                {formatAmount(tipStats.total_sent)} SUI
              </span>
            </div>

            <div style={styles.statItem}>
              <span style={styles.statLabel}>Tips Received</span>
              <span style={styles.statValue}>
                {tipStats.tips_received_count}
              </span>
            </div>

            <div style={styles.statItem}>
              <span style={styles.statLabel}>Tips Sent</span>
              <span style={styles.statValue}>
                {tipStats.tips_sent_count}
              </span>
            </div>

            <div style={{ 
              marginTop: '20px', 
              padding: '15px',
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              fontSize: '10px',
              color: '#ffa500',
              lineHeight: '1.4'
            }}>
              <Gift size={12} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
              SUPPORT_CREATORS: Tips help fund open-source development and innovation in the Sui ecosystem. Every contribution matters!
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        input:focus, textarea:focus {
          border-color: rgba(255, 165, 0, 0.6) !important;
          box-shadow: 0 0 15px rgba(255, 165, 0, 0.3) !important;
        }
        
        input::placeholder, textarea::placeholder {
          color: rgba(255, 165, 0, 0.4);
        }
        
        button:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  )
}
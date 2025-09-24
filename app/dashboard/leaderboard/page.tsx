'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut, CheckCircle, Copy, ExternalLink, Github, X, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'

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

const CornerBrackets = ({ size = 20, opacity = 0.3 }: { size?: number, opacity?: number }) => (
  <div style={{
    position: 'absolute',
    inset: '-2px',
    pointerEvents: 'none'
  }}>
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

  section: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    marginBottom: '40px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    opacity: 0.8
  },

  leaderboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  },

  userRow: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '0px',
    padding: '16px',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    display: 'grid',
    gridTemplateColumns: '60px 1fr 100px 120px 120px 120px 100px',
    alignItems: 'center',
    gap: '16px'
  },

  currentUserRow: {
    border: '1px solid rgba(147, 51, 234, 0.3)',
    background: 'rgba(147, 51, 234, 0.05)'
  },

  userInfo2: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  socialLink: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px'
  },

  addressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  copyButton: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#9ca3af',
    transition: 'all 0.2s ease',
    borderRadius: '0px'
  },

  userRank: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    minWidth: '40px'
  },

  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '0px',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  userDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1
  },

  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '2px'
  },

  userAddress: {
    fontSize: '12px',
    color: '#666666'
  },

  userScore: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    textAlign: 'right' as const,
    minWidth: '80px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px'
  },

  statCard: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '20px',
    textAlign: 'center' as const,
    position: 'relative' as const
  },

  statValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },

  statLabel: {
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666666'
  },

  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: 'white'
  },

  emptyDescription: {
    fontSize: '14px',
    lineHeight: '1.5'
  }
}

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
          >
            ✕
          </button>
        </div>

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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
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

export default function LeaderboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setIsLoadingLeaderboard(true)
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      
      if (data.success) {
        setLeaderboardData(data.leaderboard || [])
        setUserRank(data.currentUserRank || null)
        setTotalUsers(data.totalUsers || 0)
      } else {
        // If API fails, show current user in leaderboard
        const currentUserData = {
          rank: 1,
          username: profile?.username || 'You',
          score: profile?.reputation_scores?.[0]?.total_score || 300,
          address: user?.walletAddress || '0x1234...5678',
          xp: Math.round((profile?.reputation_scores?.[0]?.total_score || 300) * 2.5),
          github: profile?.social_connections?.find(s => s.platform === 'github')?.username || null,
          twitter: profile?.social_connections?.find(s => s.platform === 'twitter')?.username || null,
          linkedin: null
        }
        setLeaderboardData([currentUserData])
        setUserRank(1)
        setTotalUsers(1)
      }
    } catch (error) {
      // If API unavailable, show current user in leaderboard
      const currentUserData = {
        rank: 1,
        username: profile?.username || 'You',
        score: profile?.reputation_scores?.[0]?.total_score || 300,
        address: user?.walletAddress || '0x1234...5678',
        xp: Math.round((profile?.reputation_scores?.[0]?.total_score || 300) * 2.5),
        github: profile?.social_connections?.find(s => s.platform === 'github')?.username || null,
        twitter: profile?.social_connections?.find(s => s.platform === 'twitter')?.username || null,
        linkedin: null
      }
      setLeaderboardData([currentUserData])
      setUserRank(1)
      setTotalUsers(1)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

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

  // Fetch leaderboard when component mounts
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchLeaderboardData()
    }
  }, [isAuthenticated, profile])

  // Ensure we always have user data in leaderboard
  useEffect(() => {
    if (isAuthenticated && profile && leaderboardData.length === 0 && !isLoadingLeaderboard) {
      const currentUserData = {
        rank: 1,
        username: profile?.username || 'You',
        score: profile?.reputation_scores?.[0]?.total_score || 300,
        address: user?.walletAddress || '0x1234...5678',
        xp: Math.round((profile?.reputation_scores?.[0]?.total_score || 300) * 2.5),
        github: profile?.social_connections?.find(s => s.platform === 'github')?.username || null,
        twitter: profile?.social_connections?.find(s => s.platform === 'twitter')?.username || null,
        linkedin: null
      }
      setLeaderboardData([currentUserData])
      setUserRank(1)
      setTotalUsers(1)
    }
  }, [isAuthenticated, profile, user, leaderboardData.length, isLoadingLeaderboard])

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

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
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
              style={{...styles.navLink, ...styles.navLinkActive}}
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
              TALENT
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

        {/* User Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.section}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <CornerBrackets size={16} opacity={0.3} />
          
          <h2 style={styles.sectionTitle}>
            YOUR STATS
          </h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>#{userRank || 1}</div>
              <div style={styles.statLabel}>RANK</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{profile.reputation_scores?.[0]?.total_score || 300}</div>
              <div style={styles.statLabel}>SCORE</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{totalUsers || 1}</div>
              <div style={styles.statLabel}>TOTAL USERS</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>+0</div>
              <div style={styles.statLabel}>CHANGE</div>
            </div>
          </div>
        </motion.section>

        {/* Leaderboard Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.section}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <CornerBrackets size={16} opacity={0.3} />
          
          <h2 style={styles.sectionTitle}>
            GLOBAL LEADERBOARD
          </h2>
          
          {isLoadingLeaderboard ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyDescription}>
                Loading leaderboard...
              </div>
            </div>
          ) : (
            <div style={styles.leaderboardGrid}>
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  style={{
                    ...styles.userRow,
                    ...(user.username === profile?.username ? styles.currentUserRow : {})
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = user.username === profile?.username 
                      ? 'rgba(147, 51, 234, 0.3)' 
                      : 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <CornerBrackets size={10} opacity={0.2} />
                  
                  {/* Rank */}
                  <div style={styles.userRank}>
                    #{user.rank}
                  </div>
                  
                  {/* User Info */}
                  <div style={styles.userInfo2}>
                    <div style={styles.userAvatar}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userDetails}>
                      <div style={styles.userName}>
                        @{user.username}
                      </div>
                      <div style={styles.userAddress}>
                        XP: {user.xp || '—'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Score (main metric) */}
                  <div style={{ ...styles.userScore, textAlign: 'center', color: 'white', fontWeight: '600' }}>
                    {user.score}
                  </div>
                  
                  {/* GitHub */}
                  <div style={styles.socialLinks}>
                    {user.github ? (
                      <a 
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#c084fc'
                          e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <Github size={14} />
                      </a>
                    ) : (
                      <div style={{ ...styles.socialLink, opacity: 0.5, cursor: 'not-allowed' }}>
                        <Github size={14} />
                      </div>
                    )}
                  </div>
                  
                  {/* X (formerly Twitter) */}
                  <div style={styles.socialLinks}>
                    {user.twitter ? (
                      <a 
                        href={`https://x.com/${user.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#c084fc'
                          e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <X size={14} />
                      </a>
                    ) : (
                      <div style={{ ...styles.socialLink, opacity: 0.5, cursor: 'not-allowed' }}>
                        <X size={14} />
                      </div>
                    )}
                  </div>
                  
                  {/* LinkedIn */}
                  <div style={styles.socialLinks}>
                    {user.linkedin ? (
                      <a 
                        href={`https://linkedin.com/in/${user.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#c084fc'
                          e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <Linkedin size={14} />
                      </a>
                    ) : (
                      <div style={{ ...styles.socialLink, opacity: 0.5, cursor: 'not-allowed' }}>
                        <Linkedin size={14} />
                      </div>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div style={styles.addressContainer}>
                    <a 
                      href={`https://suiexplorer.com/address/${user.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialLink}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => copyToClipboard(user.address || '0x1234567890abcdef')}
                      style={{
                        ...styles.copyButton,
                        color: copiedAddress === user.address ? '#22c55e' : 'white',
                        marginLeft: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#22c55e'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = copiedAddress === user.address ? '#22c55e' : 'white'
                      }}
                      title={copiedAddress === user.address ? 'Copied!' : 'Copy address'}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
            textDecoration: 'none',
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
    </div>
  )
}
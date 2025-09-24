'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut, CheckCircle, Clock, Star, Target, TrendingUp, Users, Award, Zap, Link2 } from 'lucide-react'
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
    position: 'relative' as const
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

  questsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
    gridAutoRows: 'min-content'
  },

  questCard: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '0px',
    padding: '16px',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column'
  },

  questTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '6px',
    paddingRight: '90px',
    lineHeight: '1.2'
  },

  questDescription: {
    fontSize: '10px',
    color: '#666666',
    lineHeight: '1.3',
    marginBottom: '12px',
    paddingRight: '85px'
  },

  questStatus: {
    padding: '4px 8px',
    borderRadius: '0px',
    fontSize: '9px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  statusCompleted: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  },

  statusInProgress: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },

  statusLocked: {
    background: 'rgba(156, 163, 175, 0.2)',
    color: '#9ca3af',
    border: '1px solid rgba(156, 163, 175, 0.3)'
  },

  progressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    overflow: 'hidden',
    marginBottom: '8px'
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)',
    borderRadius: '0px',
    transition: 'width 0.3s ease'
  },

  progressText: {
    fontSize: '10px',
    color: '#9ca3af',
    display: 'flex',
    justifyContent: 'space-between',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  questFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 'auto'
  },

  questReward: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#fbbf24',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    zIndex: 10,
    whiteSpace: 'nowrap' as const
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
  }
}

// AI Chat Modal Component (same as dashboard)
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

export default function QuestsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
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

  const quests = [
    {
      id: 1,
      title: "Connect Social Media",
      description: "Link your GitHub and Twitter accounts to verify your online presence",
      progress: 67,
      maxProgress: 100,
      reward: 100,
      status: 'in_progress' as const,
      icon: null
    },
    {
      id: 2,
      title: "First Transaction",
      description: "Make your first transaction on the Sui blockchain",
      progress: 0,
      maxProgress: 1,
      reward: 50,
      status: 'locked' as const,
      icon: null
    },
    {
      id: 3,
      title: "Reputation Builder",
      description: "Achieve a reputation score above 500 points",
      progress: profile.reputation_scores?.[0]?.total_score || 0,
      maxProgress: 500,
      reward: 200,
      status: (profile.reputation_scores?.[0]?.total_score || 0) >= 500 ? 'completed' : 'in_progress',
      icon: null
    },
    {
      id: 4,
      title: "Community Member",
      description: "Join the SuiDentity Discord and introduce yourself",
      progress: 0,
      maxProgress: 1,
      reward: 75,
      status: 'locked' as const,
      icon: null
    },
    {
      id: 5,
      title: "NFT Collector",
      description: "Mint your first identity NFT",
      progress: 0,
      maxProgress: 1,
      reward: 150,
      status: 'locked' as const,
      icon: null
    },
    {
      id: 6,
      title: "Daily Check-in",
      description: "Log in to your dashboard 7 days in a row",
      progress: 3,
      maxProgress: 7,
      reward: 125,
      status: 'in_progress' as const,
      icon: null
    }
  ]

  const completedQuests = quests.filter(q => q.status === 'completed').length
  const totalXP = quests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.reward, 0)

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
              style={{...styles.navLink, ...styles.navLinkActive}}
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

        {/* Quest Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            ...styles.section,
            marginBottom: '40px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <CornerBrackets size={16} opacity={0.3} />
          
          <h2 style={styles.sectionTitle}>
            QUEST PROGRESS
          </h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{completedQuests}</div>
              <div style={styles.statLabel}>COMPLETED</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{quests.length - completedQuests}</div>
              <div style={styles.statLabel}>REMAINING</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{totalXP}</div>
              <div style={styles.statLabel}>TOTAL XP</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{Math.round((completedQuests / quests.length) * 100)}%</div>
              <div style={styles.statLabel}>PROGRESS</div>
            </div>
          </div>
        </motion.section>

        {/* Quests Section */}
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
            AVAILABLE QUESTS
          </h2>
          
          <div style={styles.questsGrid}>
            {quests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                style={styles.questCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <CornerBrackets size={12} opacity={0.2} />
                
                {/* XP Reward in top right */}
                <div style={styles.questReward}>
                  +{quest.reward} XP
                </div>

                {/* Main content */}
                <div style={{ flex: 1 }}>
                  <div style={styles.questTitle}>
                    {quest.title}
                  </div>
                  <div style={styles.questDescription}>
                    {quest.description}
                  </div>
                  <div style={{
                    ...styles.questStatus,
                    ...(quest.status === 'completed' ? styles.statusCompleted : 
                        quest.status === 'in_progress' ? styles.statusInProgress : 
                        styles.statusLocked),
                    marginBottom: '12px'
                  }}>
                    {quest.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                {/* Progress section */}
                {quest.status !== 'locked' && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(100, (quest.progress / quest.maxProgress) * 100)}%`
                        }}
                      />
                    </div>
                    <div style={styles.progressText}>
                      <span>{quest.progress} / {quest.maxProgress}</span>
                      <span>{Math.round((quest.progress / quest.maxProgress) * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Footer with completion indicator */}
                <div style={styles.questFooter}>
                  {quest.status === 'completed' && (
                    <CheckCircle size={16} color="#22c55e" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* AI Chat Modal */}
      <AiChatModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

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
    </div>
  )
}
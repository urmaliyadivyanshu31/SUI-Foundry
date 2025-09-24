'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram,
  Star,
  Users,
  Target,
  Trophy
} from 'lucide-react'
import { motion } from 'framer-motion'

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'auto',
    position: 'relative' as const
  },

  header: {
    position: 'fixed' as const,
    top: '30px',
    left: '60px',
    right: '60px',
    zIndex: 50,
  },

  cornerBrackets: {
    position: 'absolute' as const,
    width: '20px',
    height: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },

  headerContainer: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '12px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },

  logoContainer: {
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap' as const
  },

  navLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    transition: 'all 0.2s ease',
    padding: '8px 0'
  },

  navLinkActive: {
    color: 'white',
    position: 'relative' as const
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  userInfo: {
    textAlign: 'right' as const,
    fontSize: '12px'
  },

  username: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  },

  address: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '2px'
  },

  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '120px 60px 60px 60px'
  },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },

  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  profileSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    marginBottom: '30px'
  },

  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px',
    position: 'relative' as const,
    cursor: 'pointer'
  },

  editOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'all 0.3s ease'
  },

  profileInfo: {
    marginBottom: '20px'
  },

  editableField: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },

  fieldValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white'
  },

  fieldLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '4px'
  },

  editInput: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    padding: '8px 12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none'
  },

  editButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },

  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },

  socialCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease'
  },

  socialIcon: {
    width: '24px',
    height: '24px',
    color: 'rgba(255, 255, 255, 0.8)'
  },

  socialInfo: {
    flex: 1
  },

  socialName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '2px'
  },

  socialStatus: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)'
  },

  connectButton: {
    background: 'rgba(147, 51, 234, 0.2)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#c084fc',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },

  metricCard: {
    textAlign: 'center' as const
  },

  metricValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px'
  },

  metricLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
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
        border: '2px solid #c084fc',
        transform: 'rotate(45deg)'
      }} />
      
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, socialConnections, isLoading: isProfileLoading } = useUserProfile()
  // Edit state management
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  
  // Initialize edit username
  useEffect(() => {
    if (profile?.username) {
      setEditUsername(profile.username)
    }
  }, [profile?.username])

  const handleSaveUsername = async () => {
    // TODO: Implement username update API call
    console.log('Saving username:', editUsername)
    setIsEditingUsername(false)
  }

  const handleCancelEdit = () => {
    setEditUsername(profile?.username || '')
    setIsEditingUsername(false)
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
          LOADING_SYSTEM_INTERFACE...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address
  const reputationScore = profile.reputation_scores?.[0]?.total_score || 650

  return (
    <div style={styles.pageContainer}>

      {/* Header */}
      <nav style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo */}
          <Link href="/" style={styles.logo}>
            <LogoIcon />
            <span style={styles.logoText}>SUIDENTITY</span>
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
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              QUESTS
            </Link>
            
            <Link 
              href="/dashboard/leaderboard" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              LEADERBOARD
            </Link>
            
            <Link 
              href="/dashboard/jobs" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              JOBS
            </Link>
            
            <Link 
              href="/dashboard/hr" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              HR_PANEL
            </Link>

            <Link 
              href="/dashboard/ai-coach" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              AI_COACH
            </Link>

            <Link 
              href="/dashboard/sponsor" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              SPONSOR
            </Link>

            <Link 
              href="/dashboard/social" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              SOCIAL
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
        {/* System Interface Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.systemInterface}
        >
          {/* Control Panel */}
          <div style={styles.controlPanel}>
            <h2 style={styles.panelTitle}>
              ║█║ SYSTEM_CONTROL_INTERFACE ║█║
            </h2>
            
            {/* Metrics Grid */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricBox}>
                <div style={styles.metricValue}>{reputationScore}</div>
                <div style={styles.metricLabel}>REP_SCORE</div>
              </div>
              
              <div style={styles.metricBox}>
                <div style={styles.metricValue}>{socialConnections?.length || 0}/4</div>
                <div style={styles.metricLabel}>CONNECTIONS</div>
              </div>
              
              <div style={styles.metricBox}>
                <div style={styles.metricValue}>7</div>
                <div style={styles.metricLabel}>ACTIVE_QUESTS</div>
              </div>
              
              <div style={styles.metricBox}>
                <div style={styles.metricValue}>2.4K</div>
                <div style={styles.metricLabel}>XP_EARNED</div>
              </div>
            </div>
            
            {/* Terminal Output */}
            <div style={styles.terminalOutput}>
              {terminalLines.map((line, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
          
          {/* User Profile Panel */}
          <div style={styles.userProfilePanel}>
            <h2 style={{...styles.panelTitle, color: '#0099cc'}}>
              ║▓║ USER_PROFILE_DATA ║▓║
            </h2>
            
            <div style={styles.userAvatar}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>
            
            <div style={styles.userDetails}>
              <div style={styles.userName}>@{profile.username}</div>
              <div style={styles.userAddress}>
                {walletAddress?.slice(0, 16)}...{walletAddress?.slice(-8)}
              </div>
              
              <div style={styles.userStats}>
                <div>&gt; USER_ID: {profile.id?.slice(0, 8)}...</div>
                <div>&gt; JOINED: {new Date(profile.created_at).toLocaleDateString()}</div>
                <div>&gt; STATUS: VERIFIED_ACTIVE</div>
                <div>&gt; SECURITY_LVL: HIGH</div>
                <div>&gt; LAST_LOGIN: {new Date().toISOString().slice(11, 19)}</div>
                <div>&gt; ACCESS_LEVEL: STANDARD_USER</div>
              </div>
            </div>
            
            <button
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 153, 204, 0.3)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 153, 204, 0.2)'
                e.currentTarget.style.color = '#0099cc'
              }}
              onClick={() => alert('Profile modification interface coming soon!')}
            >
              ▼ MODIFY_PROFILE_DATA ▼
            </button>
          </div>
        </motion.div>

        {/* Advanced Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={styles.advancedMetrics}
        >
          {/* Performance Analytics */}
          <div style={styles.metricPanel}>
            <h3 style={{...styles.panelTitle, color: '#ffa500', fontSize: '14px'}}>
              ▲ PERFORMANCE_ANALYTICS ▲
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: '"Courier New", monospace'}}>94%</div>
                <div style={{fontSize: '9px', color: '#ffa500', textTransform: 'uppercase', fontFamily: '"Courier New", monospace'}}>EFFICIENCY</div>
              </div>
              
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: '"Courier New", monospace'}}>A+</div>
                <div style={{fontSize: '9px', color: '#ffa500', textTransform: 'uppercase', fontFamily: '"Courier New", monospace'}}>GRADE</div>
              </div>
              
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: 'bold', color: 'white', fontFamily: '"Courier New", monospace'}}>LVL5</div>
                <div style={{fontSize: '9px', color: '#ffa500', textTransform: 'uppercase', fontFamily: '"Courier New", monospace'}}>TIER</div>
              </div>
            </div>
            
            <button
              style={{
                ...styles.actionButton,
                background: 'rgba(255, 165, 0, 0.2)',
                borderColor: '#ffa500',
                color: '#ffa500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 165, 0, 0.3)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)'
                e.currentTarget.style.color = '#ffa500'
              }}
              onClick={() => router.push('/dashboard/quests')}
            >
              ► INITIATE_MISSIONS ◄
            </button>
          </div>

          {/* Social Network */}
          <div style={styles.metricPanel}>
            <h3 style={{...styles.panelTitle, color: '#ffa500', fontSize: '14px'}}>
              ◆ SOCIAL_NETWORK_STATUS ◆
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {['GITHUB', 'TWITTER', 'LINKEDIN', 'DISCORD'].map((platform) => {
                const isConnected = socialConnections?.some(conn => 
                  conn.platform.toLowerCase() === platform.toLowerCase()
                )
                
                return (
                  <div
                    key={platform}
                    style={{
                      padding: '8px',
                      background: isConnected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                      border: `1px solid ${isConnected ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
                      fontSize: '9px',
                      color: isConnected ? '#00ff00' : '#ff4444',
                      fontFamily: '"Courier New", monospace',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    {platform}: {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </div>
                )
              })}
            </div>
            
            <button
              style={{
                ...styles.actionButton,
                background: 'rgba(255, 165, 0, 0.2)',
                borderColor: '#ffa500',
                color: '#ffa500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 165, 0, 0.3)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)'
                e.currentTarget.style.color = '#ffa500'
              }}
              onClick={() => router.push('/dashboard/social')}
            >
              ◆ MANAGE_CONNECTIONS ◆
            </button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
      `}</style>
    </div>
  )
}
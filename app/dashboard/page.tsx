'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #0a0a0a 0%, #000000 50%, #0a0a0a 100%)',
    color: 'white',
    fontFamily: '"Courier New", monospace',
    overflow: 'hidden',
    position: 'relative' as const
  },

  // Animated background grid
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

  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  navLink: {
    color: '#00ff00',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '0px',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    border: '1px solid transparent',
    fontFamily: '"Courier New", monospace'
  },

  navLinkActive: {
    color: '#00ff00',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
  },

  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  userInfo: {
    textAlign: 'right' as const,
    fontSize: '11px',
    fontFamily: '"Courier New", monospace'
  },

  username: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#00ff00'
  },

  address: {
    fontSize: '10px',
    color: '#0099cc',
    opacity: 0.8
  },

  mainContainer: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '100px 30px 60px 30px',
    position: 'relative',
    zIndex: 10
  },

  systemInterface: {
    display: 'grid',
    gridTemplateColumns: '2.5fr 1.5fr',
    gap: '30px',
    marginBottom: '30px'
  },

  controlPanel: {
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 255, 0, 0.4)',
    borderRadius: '0px',
    padding: '30px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(0, 255, 0, 0.1)'
  },

  userProfilePanel: {
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 153, 204, 0.4)',
    borderRadius: '0px',
    padding: '30px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(0, 153, 204, 0.1)'
  },

  panelTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#00ff00',
    marginBottom: '25px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace',
    borderBottom: '1px solid rgba(0, 255, 0, 0.3)',
    paddingBottom: '10px'
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '25px'
  },

  metricBox: {
    background: 'rgba(0, 255, 0, 0.05)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    padding: '15px',
    textAlign: 'center' as const,
    position: 'relative'
  },

  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '5px',
    fontFamily: '"Courier New", monospace'
  },

  metricLabel: {
    fontSize: '9px',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: '"Courier New", monospace'
  },

  terminalOutput: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    padding: '15px',
    fontSize: '10px',
    color: '#00ff00',
    fontFamily: '"Courier New", monospace',
    lineHeight: '1.6',
    height: '120px',
    overflow: 'auto'
  },

  userAvatar: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #0099cc 0%, #0066cc 100%)',
    border: '2px solid #0099cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '20px'
  },

  userDetails: {
    marginBottom: '20px'
  },

  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '5px',
    fontFamily: '"Courier New", monospace'
  },

  userAddress: {
    fontSize: '11px',
    color: '#0099cc',
    marginBottom: '10px',
    fontFamily: '"Courier New", monospace'
  },

  userStats: {
    fontSize: '10px',
    color: '#0099cc',
    fontFamily: '"Courier New", monospace',
    lineHeight: '1.5'
  },

  actionButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(0, 153, 204, 0.2)',
    border: '1px solid #0099cc',
    color: '#0099cc',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    marginTop: '15px',
    transition: 'all 0.3s ease'
  },

  advancedMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px'
  },

  metricPanel: {
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 165, 0, 0.4)',
    borderRadius: '0px',
    padding: '25px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(255, 165, 0, 0.1)'
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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, socialConnections, isLoading: isProfileLoading } = useUserProfile()
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  // Simulate terminal output
  useEffect(() => {
    const terminal = [
      '> SYSTEM_BOOT: COMPLETE',
      '> LOADING_USER_PROFILE...',
      '> BLOCKCHAIN_CONNECTION: ESTABLISHED',
      '> REPUTATION_ENGINE: ONLINE',
      '> SOCIAL_CONNECTORS: ACTIVE',
      '> QUEST_SYSTEM: OPERATIONAL',
      '> ALL_SYSTEMS: NOMINAL',
      `> USER_SESSION: @${profile?.username || 'GUEST'}_AUTHENTICATED`,
      '> READY_FOR_COMMANDS...'
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < terminal.length) {
        setTerminalLines(prev => [...prev, terminal[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [profile])

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
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut, Github, Twitter, Linkedin, Plus, ExternalLink, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111827 0%, #1f2937 50%, #111827 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
  
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  logoInner: {
    width: '16px',
    height: '16px',
    background: 'white',
    borderRadius: '4px'
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
    fontSize: '13px',
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
  
  connectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  
  connectionCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  },
  
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  
  platformInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  platformIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  githubIcon: {
    background: '#24292f'
  },
  
  twitterIcon: {
    background: '#1d9bf0'
  },
  
  linkedinIcon: {
    background: '#0077b5'
  },
  
  platformDetails: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  
  platformName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white'
  },
  
  platformDesc: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '0px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const
  },
  
  connectedBadge: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)'
  },
  
  notConnectedBadge: {
    background: 'rgba(156, 163, 175, 0.2)',
    color: '#9ca3af',
    border: '1px solid rgba(156, 163, 175, 0.3)'
  },
  
  connectionInfo: {
    marginBottom: '16px'
  },
  
  connectedUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  
  connectedUsername: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  },
  
  connectionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  
  statItem: {
    textAlign: 'center' as const
  },
  
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white'
  },
  
  statLabel: {
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const
  },
  
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '0px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    width: '100%',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  
  connectButton: {
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    color: 'white'
  },
  
  refreshButton: {
    background: 'transparent',
    border: '1px solid rgba(168, 85, 247, 0.5)',
    color: '#c084fc'
  },
  
  disconnectButton: {
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#ef4444'
  },
  
  overviewSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  
  overviewTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  
  overviewStat: {
    textAlign: 'center' as const
  },
  
  overviewValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '4px'
  },
  
  overviewLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  }
}

// Abstract Geometric Logo Component (matching landing page)
const LogoIcon = () => (
  <div style={{
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }}>
    {/* Abstract Geometric Logo - No Animation */}
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

export default function SocialPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, socialConnections, isLoading: isProfileLoading } = useUserProfile()

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
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address

  const platforms = [
    {
      name: 'GitHub',
      description: 'Developer activity and contributions',
      icon: <Github size={20} />,
      iconStyle: styles.githubIcon,
      connected: socialConnections?.some(conn => conn.platform === 'github') || false,
      username: socialConnections?.find(conn => conn.platform === 'github')?.username || null,
      stats: socialConnections?.find(conn => conn.platform === 'github')?.profile_data ? {
        repos: socialConnections.find(conn => conn.platform === 'github')?.profile_data?.public_repos || 0,
        followers: socialConnections.find(conn => conn.platform === 'github')?.profile_data?.followers || 0,
        stars: socialConnections.find(conn => conn.platform === 'github')?.profile_data?.total_stars || 0
      } : null
    },
    {
      name: 'Twitter',
      description: 'Social presence and engagement',
      icon: <Twitter size={20} />,
      iconStyle: styles.twitterIcon,
      connected: socialConnections?.some(conn => conn.platform === 'twitter') || false,
      username: socialConnections?.find(conn => conn.platform === 'twitter')?.username || null,
      stats: socialConnections?.find(conn => conn.platform === 'twitter')?.profile_data ? {
        tweets: socialConnections.find(conn => conn.platform === 'twitter')?.profile_data?.tweet_count || 0,
        followers: socialConnections.find(conn => conn.platform === 'twitter')?.profile_data?.followers_count || 0,
        following: socialConnections.find(conn => conn.platform === 'twitter')?.profile_data?.following_count || 0
      } : null
    },
    {
      name: 'LinkedIn',
      description: 'Professional network and experience',
      icon: <Linkedin size={20} />,
      iconStyle: styles.linkedinIcon,
      connected: false, // Not implemented yet
      username: null,
      stats: null
    }
  ]

  const connectedCount = platforms.filter(p => p.connected).length
  const totalReputationBoost = connectedCount * 50 // Each connection adds 50 points

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
              href="/dashboard/social" 
              style={{...styles.navLink, ...styles.navLinkActive}}
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
                border: 'none',
                color: '#9ca3af',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
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
      </nav>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{...styles.pageTitle, textTransform: 'uppercase', letterSpacing: '1px'}}>
            SOCIAL CONNECTIONS
          </h1>
          <p style={styles.pageSubtitle}>
            PLATFORM INTEGRATIONS // REPUTATION ENHANCEMENT
          </p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.overviewSection}
        >
          <h2 style={{...styles.overviewTitle, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            CONNECTION OVERVIEW
          </h2>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewStat}>
              <div style={styles.overviewValue}>{connectedCount}</div>
              <div style={styles.overviewLabel}>CONNECTED</div>
            </div>
            <div style={styles.overviewStat}>
              <div style={styles.overviewValue}>{platforms.length - connectedCount}</div>
              <div style={styles.overviewLabel}>AVAILABLE</div>
            </div>
            <div style={styles.overviewStat}>
              <div style={styles.overviewValue}>+{totalReputationBoost}</div>
              <div style={styles.overviewLabel}>REP BOOST</div>
            </div>
            <div style={styles.overviewStat}>
              <div style={styles.overviewValue}>{Math.round((connectedCount / platforms.length) * 100)}%</div>
              <div style={styles.overviewLabel}>COMPLETION</div>
            </div>
          </div>
        </motion.div>

        {/* Social Platforms */}
        <div style={styles.connectionsGrid}>
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              style={styles.connectionCard}
              className="connection-card"
            >
              <div style={styles.cardHeader}>
                <div style={styles.platformInfo}>
                  <div style={{...styles.platformIcon, ...platform.iconStyle}}>
                    {platform.icon}
                  </div>
                  <div style={styles.platformDetails}>
                    <div style={styles.platformName}>{platform.name}</div>
                    <div style={styles.platformDesc}>{platform.description}</div>
                  </div>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  ...(platform.connected ? styles.connectedBadge : styles.notConnectedBadge)
                }}>
                  {platform.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>

              <div style={styles.connectionInfo}>
                {platform.connected && platform.username ? (
                  <>
                    <div style={styles.connectedUser}>
                      <div style={styles.avatar}>
                        {platform.username.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.connectedUsername}>@{platform.username}</div>
                      <ExternalLink size={14} color="#9ca3af" />
                    </div>
                    
                    {platform.stats && (
                      <div style={styles.connectionStats}>
                        {Object.entries(platform.stats).map(([key, value]) => (
                          <div key={key} style={styles.statItem}>
                            <div style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
                            <div style={styles.statLabel}>{key}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '16px'}}>
                    Connect your {platform.name} account to verify your {platform.name.toLowerCase()} presence and boost your reputation score.
                  </div>
                )}
              </div>

              {platform.connected ? (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                  <button 
                    style={{...styles.button, ...styles.refreshButton}}
                    className="refresh-button"
                    onClick={() => {
                      console.log(`Refreshing ${platform.name} connection...`)
                    }}
                  >
                    <RefreshCw size={14} />
                    REFRESH
                  </button>
                  <button 
                    style={{...styles.button, ...styles.disconnectButton}}
                    className="disconnect-button"
                    onClick={() => {
                      console.log(`Disconnecting ${platform.name}...`)
                    }}
                  >
                    DISCONNECT
                  </button>
                </div>
              ) : (
                <button 
                  style={{...styles.button, ...styles.connectButton}}
                  className="connect-button"
                  onClick={() => {
                    console.log(`Connecting to ${platform.name}...`)
                  }}
                >
                  <Plus size={14} />
                  CONNECT {platform.name.toUpperCase()}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .connection-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        
        .connect-button:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
        }
        
        .refresh-button:hover {
          background: rgba(168, 85, 247, 0.1);
          transform: scale(1.02);
        }
        
        .disconnect-button:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}
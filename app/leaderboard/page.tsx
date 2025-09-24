'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, ExternalLink, Github, X, Linkedin } from 'lucide-react'
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
  },

  authButton: {
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '0px',
    padding: '8px 16px',
    color: '#c084fc',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease'
  }
}

export default function PublicLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
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

  // Fetch public leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setIsLoadingLeaderboard(true)
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      
      if (data.success) {
        setLeaderboardData(data.leaderboard || [])
        setTotalUsers(data.totalUsers || 0)
      } else {
        // Show empty state for public view
        setLeaderboardData([])
        setTotalUsers(0)
      }
    } catch (error) {
      // If API unavailable, show empty state
      setLeaderboardData([])
      setTotalUsers(0)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

  // Fetch leaderboard when component mounts
  useEffect(() => {
    fetchLeaderboardData()
  }, [])

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
            <Link href="/" style={styles.navLink}>
              HOME
            </Link>
            <Link href="/leaderboard" style={{...styles.navLink, ...styles.navLinkActive}}>
              LEADERBOARD
            </Link>
            <Link href="/quests" style={styles.navLink}>
              QUESTS
            </Link>
            <Link href="/jobs" style={styles.navLink}>
              TALENT
            </Link>
          </nav>

          {/* Auth Section */}
          <Link href="/#contact" style={styles.authButton}>
            CONTACT
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              GLOBAL LEADERBOARD
            </h1>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              TOP REPUTATION SCORES ON SUIDENTITY
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Stats */}
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
            PLATFORM STATISTICS
          </h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{totalUsers}</div>
              <div style={styles.statLabel}>TOTAL USERS</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{leaderboardData.length}</div>
              <div style={styles.statLabel}>RANKED USERS</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>
                {leaderboardData.length > 0 ? Math.max(...leaderboardData.map(u => u.score)) : 0}
              </div>
              <div style={styles.statLabel}>TOP SCORE</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>
                {leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((sum, u) => sum + u.score, 0) / leaderboardData.length) : 0}
              </div>
              <div style={styles.statLabel}>AVG SCORE</div>
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
            TOP PERFORMERS
          </h2>
          
          {isLoadingLeaderboard ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyDescription}>
                Loading leaderboard...
              </div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>No Users Found</div>
              <div style={styles.emptyDescription}>
                The leaderboard is currently empty. Be the first to build your reputation!
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
                  style={styles.userRow}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
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
    </div>
  )
}
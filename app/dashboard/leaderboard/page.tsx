'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut, Trophy, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface LeaderboardUser {
  id: string
  username: string
  wallet_address: string
  profile_picture: string | null
  reputation_score: number
  defi_score: number
  social_score: number
  developer_score: number
  rank: number
  total_tips_received: number
  total_tips_sent: number
  social_connections_count: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  total_count: number
  current_user_rank: number | null
  has_more: boolean
  platform_stats: {
    total_users: number
    total_reputation_calculated: number
    average_score: number
    top_score: number
  }
  category: string
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
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
    padding: '120px 60px 60px 60px' // Top padding for fixed header
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
  
  topThreeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr 1fr',
    gap: '24px',
    marginBottom: '40px',
    alignItems: 'end'
  },
  
  podiumCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    textAlign: 'center' as const,
    position: 'relative' as const,
    transition: 'all 0.3s ease'
  },
  
  podiumFirst: {
    border: '2px solid #fbbf24',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  },
  
  podiumSecond: {
    border: '2px solid #9ca3af',
    background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  },
  
  podiumThird: {
    border: '2px solid #cd7c2f',
    background: 'linear-gradient(135deg, rgba(205, 124, 47, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  },
  
  rankBadge: {
    position: 'absolute' as const,
    top: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '32px',
    height: '32px',
    borderRadius: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  
  firstBadge: {
    background: '#fbbf24',
    color: '#000'
  },
  
  secondBadge: {
    background: '#9ca3af',
    color: '#000'
  },
  
  thirdBadge: {
    background: '#cd7c2f',
    color: '#000'
  },
  
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    margin: '16px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  
  leaderboardTable: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 120px 100px',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '16px'
  },
  
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 120px 100px',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    borderRadius: '0px'
  },
  
  tableHeaderCell: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase' as const
  },
  
  rankCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white'
  },
  
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  
  userInfo2: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  },
  
  userAddress: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  
  scoreCell: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white'
  },
  
  xpCell: {
    fontSize: '14px',
    color: '#fbbf24',
    fontWeight: '500'
  },
  
  changeCell: {
    fontSize: '14px',
    fontWeight: '500'
  },
  
  currentUserRow: {
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)'
  },
  
  statsSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    marginBottom: '32px'
  },
  
  statsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  
  statItem: {
    textAlign: 'center' as const
  },
  
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '4px'
  },
  
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af'
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

export default function LeaderboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('total')
  const [error, setError] = useState<string | null>(null)

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setIsLeaderboardLoading(true)
      setError(null)
      
      const response = await fetch(`/api/leaderboard?category=${selectedCategory}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setLeaderboardData(data.data)
      } else {
        setError(data.error || 'Failed to fetch leaderboard data')
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setError('Failed to load leaderboard. Please try again.')
    } finally {
      setIsLeaderboardLoading(false)
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

  // Fetch leaderboard when component mounts or category changes
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchLeaderboardData()
    }
  }, [isAuthenticated, profile, selectedCategory])

  if (isLoading || isProfileLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address

  // Use real leaderboard data or empty array as fallback
  const leaderboard = leaderboardData?.leaderboard || []
  const currentUserRank = leaderboardData?.current_user_rank
  const platformStats = leaderboardData?.platform_stats

  // Use real data or show loading/error state
  const displayData = leaderboard.length > 0 ? leaderboard : []
  const topThree = displayData.slice(0, 3)
  const userRank = currentUserRank || displayData.findIndex(user => user.username === profile.username) + 1
  
  // Transform data format for compatibility
  const transformedData = displayData.map(user => ({
    rank: user.rank,
    username: user.username,
    address: user.wallet_address?.slice(0, 8) + '...' + user.wallet_address?.slice(-4),
    reputationScore: user.reputation_score,
    xp: Math.round(user.reputation_score * 2.5), // Estimate XP from reputation
    change: '+0' // We don't track changes yet, could be implemented later
  }))

  if (isLeaderboardLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading leaderboard data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          color: '#ef4444',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          {error}
          <br />
          <button 
            onClick={fetchLeaderboardData}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

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
              style={{...styles.navLink, ...styles.navLinkActive}}
            >
              LEADERBOARD
            </Link>
            
            <Link 
              href="/dashboard/social" 
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
            GLOBAL LEADERBOARD
          </h1>
          <p style={styles.pageSubtitle}>
            REPUTATION RANKINGS // PERFORMANCE METRICS
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.statsSection}
        >
          <h2 style={{...styles.statsTitle, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            YOUR PERFORMANCE
          </h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>#{userRank || '—'}</div>
              <div style={{...styles.statLabel, textTransform: 'uppercase'}}>CURRENT RANK</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{profile.reputation_scores?.[0]?.total_score || 300}</div>
              <div style={{...styles.statLabel, textTransform: 'uppercase'}}>REPUTATION SCORE</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{platformStats?.total_users || '—'}</div>
              <div style={{...styles.statLabel, textTransform: 'uppercase'}}>TOTAL USERS</div>
            </div>
            <div style={styles.statItem}>
              <div style={{...styles.statValue, color: '#22c55e'}}>{Math.round(platformStats?.average_score || 300)}</div>
              <div style={{...styles.statLabel, textTransform: 'uppercase'}}>AVERAGE SCORE</div>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.topThreeGrid}
        >
          {/* Second Place */}
          <div style={{...styles.podiumCard, ...styles.podiumSecond}} className="podium-card">
            <div style={{...styles.rankBadge, ...styles.secondBadge}}>
              #2
            </div>
            <div style={styles.avatar}>
              {topThree[1]?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userName}>@{topThree[1]?.username || 'Unknown'}</div>
            <div style={styles.userAddress}>{topThree[1]?.wallet_address?.slice(0, 8) + '...' + topThree[1]?.wallet_address?.slice(-4) || '—'}</div>
            <div style={{...styles.scoreCell, marginTop: '12px'}}>{topThree[1]?.reputation_score || 300}</div>
            <div style={{...styles.statLabel, textTransform: 'uppercase'}}>REPUTATION SCORE</div>
          </div>

          {/* First Place */}
          <div style={{...styles.podiumCard, ...styles.podiumFirst}} className="podium-card">
            <div style={{...styles.rankBadge, ...styles.firstBadge}}>
              #1
            </div>
            <div style={styles.avatar}>
              {topThree[0]?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userName}>@{topThree[0]?.username || 'Unknown'}</div>
            <div style={styles.userAddress}>{topThree[0]?.wallet_address?.slice(0, 8) + '...' + topThree[0]?.wallet_address?.slice(-4) || '—'}</div>
            <div style={{...styles.scoreCell, marginTop: '12px'}}>{topThree[0]?.reputation_score || 300}</div>
            <div style={{...styles.statLabel, textTransform: 'uppercase'}}>REPUTATION SCORE</div>
          </div>

          {/* Third Place */}
          <div style={{...styles.podiumCard, ...styles.podiumThird}} className="podium-card">
            <div style={{...styles.rankBadge, ...styles.thirdBadge}}>
              #3
            </div>
            <div style={styles.avatar}>
              {topThree[2]?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userName}>@{topThree[2]?.username || 'Unknown'}</div>
            <div style={styles.userAddress}>{topThree[2]?.wallet_address?.slice(0, 8) + '...' + topThree[2]?.wallet_address?.slice(-4) || '—'}</div>
            <div style={{...styles.scoreCell, marginTop: '12px'}}>{topThree[2]?.reputation_score || 300}</div>
            <div style={{...styles.statLabel, textTransform: 'uppercase'}}>REPUTATION SCORE</div>
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.leaderboardTable}
        >
          <h2 style={{...styles.statsTitle, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            COMPLETE RANKINGS
          </h2>
          
          <div style={styles.tableHeader}>
            <div style={styles.tableHeaderCell}>RANK</div>
            <div style={styles.tableHeaderCell}>USER</div>
            <div style={styles.tableHeaderCell}>REPUTATION</div>
            <div style={styles.tableHeaderCell}>XP</div>
            <div style={styles.tableHeaderCell}>CHANGE</div>
          </div>

          {displayData.map((userData, index) => (
            <motion.div
              key={userData.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              style={{
                ...styles.tableRow,
                ...(userData.username === profile.username ? styles.currentUserRow : {})
              }}
              className="table-row"
            >
              <div style={styles.rankCell}>
                #{userData.rank}
              </div>
              <div style={styles.userCell}>
                <div style={styles.userAvatar}>
                  {userData.username.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userInfo2}>
                  <div style={styles.userName}>@{userData.username}</div>
                  <div style={styles.userAddress}>
                    {userData.wallet_address?.slice(0, 8) + '...' + userData.wallet_address?.slice(-4)}
                  </div>
                </div>
              </div>
              <div style={styles.scoreCell}>{userData.reputation_score}</div>
              <div style={styles.xpCell}>{Math.round(userData.reputation_score * 2.5).toLocaleString()}</div>
              <div style={{
                ...styles.changeCell,
                color: '#9ca3af'
              }}>
                +0
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .podium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        
        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
}
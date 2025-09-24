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

// Abstract Geometric Logo Component (matching landing page)
const LogoIcon = () => (
  <div style={{
    width: '36px',
    height: '36px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
        width: '8px',
        height: '8px',
        bottom: '10px',
        right: '10px',
        background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
        transform: 'rotate(45deg)',
        boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
      }} />
      
      {/* Static dot */}
      <div style={{
        position: 'absolute',
        width: '3px',
        height: '3px',
        top: '6px',
        right: '6px',
        background: '#ffffff',
        borderRadius: '50%',
        opacity: 0.8
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
          minHeight: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address
  const reputationScore = profile.reputation_scores?.[0]?.total_score || 300

  // Social platforms data
  const socialPlatforms = [
    { name: 'GitHub', icon: Github, connected: socialConnections?.some(sc => sc.platform === 'github') },
    { name: 'X (Twitter)', icon: Twitter, connected: socialConnections?.some(sc => sc.platform === 'twitter') },
    { name: 'LinkedIn', icon: Linkedin, connected: false },
    { name: 'Instagram', icon: Instagram, connected: false }
  ]

  return (
    <div style={styles.pageContainer}>
      {/* Corner Brackets */}
      <div style={{
        ...styles.cornerBrackets,
        top: '28px',
        left: '58px',
        borderRight: 'none',
        borderBottom: 'none'
      }} />
      <div style={{
        ...styles.cornerBrackets,
        top: '28px',
        right: '58px',
        borderLeft: 'none',
        borderBottom: 'none'
      }} />
      <div style={{
        ...styles.cornerBrackets,
        bottom: '28px',
        left: '58px',
        borderRight: 'none',
        borderTop: 'none'
      }} />
      <div style={{
        ...styles.cornerBrackets,
        bottom: '28px',
        right: '58px',
        borderLeft: 'none',
        borderTop: 'none'
      }} />

      {/* Header */}
      <nav style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Logo */}
          <div style={styles.logoContainer} onClick={() => router.push('/')}>
            <LogoIcon />
          </div>

          {/* Navigation Menu */}
          <nav style={styles.navigation}>
            <Link href="/dashboard" style={{...styles.navLink, ...styles.navLinkActive}}>
              Dashboard
            </Link>
            <Link href="/dashboard/quests" style={styles.navLink}>
              Quests
            </Link>
            <Link href="/dashboard/leaderboard" style={styles.navLink}>
              Leaderboard
            </Link>
            <Link href="/dashboard/jobs" style={styles.navLink}>
              Jobs
            </Link>
            <Link href="/dashboard/hr" style={styles.navLink}>
              HR Panel
            </Link>
            <Link href="/dashboard/ai-coach" style={styles.navLink}>
              AI Coach
            </Link>
            <Link href="/dashboard/sponsor" style={styles.navLink}>
              Sponsor
            </Link>
            <Link href="/dashboard/social" style={styles.navLink}>
              Social
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
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        <div style={styles.dashboardGrid}>
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.glassCard}
          >
            <h2 style={styles.sectionTitle}>
              <Users size={24} />
              User Profile
            </h2>
            
            <div style={styles.profileSection}>
              <div 
                style={styles.avatar}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.edit-overlay') as HTMLElement
                  if (overlay) overlay.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.edit-overlay') as HTMLElement
                  if (overlay) overlay.style.opacity = '0'
                }}
              >
                {profile.username?.charAt(0).toUpperCase()}
                <div className="edit-overlay" style={styles.editOverlay}>
                  <Edit3 size={20} />
                </div>
              </div>
              
              <div style={styles.profileInfo}>
                <div style={styles.fieldLabel}>Username</div>
                <div style={styles.editableField}>
                  {isEditingUsername ? (
                    <>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        style={styles.editInput}
                      />
                      <button
                        onClick={handleSaveUsername}
                        style={{...styles.editButton, color: '#22c55e'}}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{...styles.editButton, color: '#ef4444'}}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={styles.fieldValue}>@{profile.username}</span>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        style={styles.editButton}
                      >
                        <Edit3 size={16} />
                      </button>
                    </>
                  )}
                </div>
                
                <div style={styles.fieldLabel}>Wallet Address</div>
                <div style={styles.fieldValue}>
                  {walletAddress?.slice(0, 16)}...{walletAddress?.slice(-8)}
                </div>
                
                <div style={styles.fieldLabel}>Joined</div>
                <div style={styles.fieldValue}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Social Connections */}
            <h3 style={{...styles.sectionTitle, fontSize: '16px', marginBottom: '16px'}}>
              Social Connections
            </h3>
            <div style={styles.socialGrid}>
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon
                return (
                  <div key={platform.name} style={styles.socialCard}>
                    <IconComponent style={styles.socialIcon} />
                    <div style={styles.socialInfo}>
                      <div style={styles.socialName}>{platform.name}</div>
                      <div style={styles.socialStatus}>
                        {platform.connected ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                    <button 
                      style={styles.connectButton}
                      onClick={() => console.log(`Connect to ${platform.name}`)}
                    >
                      {platform.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Key Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.glassCard}
          >
            <h2 style={styles.sectionTitle}>
              <Trophy size={24} />
              Key Metrics
            </h2>
            
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <div style={{...styles.metricValue, color: '#c084fc'}}>
                  {reputationScore}
                </div>
                <div style={styles.metricLabel}>Reputation Score</div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>
                  {socialConnections?.length || 0}
                </div>
                <div style={styles.metricLabel}>Social Connections</div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>
                  0
                </div>
                <div style={styles.metricLabel}>Active Quests</div>
              </div>
              
              <div style={styles.metricCard}>
                <div style={{...styles.metricValue, color: '#fbbf24'}}>
                  {Math.round(reputationScore * 2.5)}
                </div>
                <div style={styles.metricLabel}>XP Earned</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
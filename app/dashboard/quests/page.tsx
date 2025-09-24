'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { LogOut, CheckCircle, Clock, Star, Zap, Users, TrendingUp, ExternalLink, Link2, Award, Target } from 'lucide-react'
import { motion } from 'framer-motion'

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
  
  questsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  
  questCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative' as const
  },
  
  questHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  
  questTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },
  
  questDescription: {
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  
  questProgress: {
    marginBottom: '16px'
  },
  
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  
  progressText: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'flex',
    justifyContent: 'space-between'
  },
  
  questFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  questReward: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fbbf24'
  },
  
  questStatus: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
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
  
  statsSection: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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

export default function QuestsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()

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

  const quests = [
    {
      id: 1,
      title: "Connect Social Media",
      description: "Link your GitHub and Twitter accounts to verify your online presence",
      progress: 67,
      maxProgress: 100,
      reward: 100,
      status: 'in_progress' as const,
      icon: <Link2 size={20} />
    },
    {
      id: 2,
      title: "First Transaction",
      description: "Make your first transaction on the Sui blockchain",
      progress: 0,
      maxProgress: 1,
      reward: 50,
      status: 'locked' as const,
      icon: <Zap size={20} />
    },
    {
      id: 3,
      title: "Reputation Builder",
      description: "Achieve a reputation score above 500 points",
      progress: profile.reputation_scores?.[0]?.total_score || 0,
      maxProgress: 500,
      reward: 200,
      status: (profile.reputation_scores?.[0]?.total_score || 0) >= 500 ? 'completed' : 'in_progress',
      icon: <TrendingUp size={20} />
    },
    {
      id: 4,
      title: "Community Member",
      description: "Join the SuiDentity Discord and introduce yourself",
      progress: 0,
      maxProgress: 1,
      reward: 75,
      status: 'locked' as const,
      icon: <Users size={20} />
    },
    {
      id: 5,
      title: "NFT Collector",
      description: "Mint your first identity NFT",
      progress: 0,
      maxProgress: 1,
      reward: 150,
      status: 'locked' as const,
      icon: <Award size={20} />
    },
    {
      id: 6,
      title: "Daily Check-in",
      description: "Log in to your dashboard 7 days in a row",
      progress: 3,
      maxProgress: 7,
      reward: 125,
      status: 'in_progress' as const,
      icon: <Clock size={20} />
    }
  ]

  const completedQuests = quests.filter(q => q.status === 'completed').length
  const totalXP = quests.filter(q => q.status === 'completed').reduce((sum, q) => sum + q.reward, 0)

  return (
    <div style={styles.pageContainer}>
      {/* Header with Corner Brackets */}
      <div style={styles.header}>
        <div style={styles.headerContainer}>
          {/* Corner Brackets */}
          <div style={{
            position: 'absolute',
            inset: '-2px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
            }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            }} />
          </div>
          
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
      </div>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={styles.pageTitle}>
            <Target size={32} />
            MISSION INTERFACE
          </h1>
          <p style={styles.pageSubtitle}>
            Complete tactical objectives to earn experience points and unlock advanced features
          </p>
        </motion.div>

        {/* Quest Stats Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.statsSection}
        >
          {/* Corner Brackets */}
          <div style={{
            position: 'absolute',
            inset: '-2px',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.4)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
            }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.4)',
              borderRight: '1px solid rgba(255, 255, 255, 0.4)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
              borderRight: '1px solid rgba(255, 255, 255, 0.4)',
            }} />
          </div>
          
          <h2 style={styles.statsTitle}>
            <Star size={20} />
            TACTICAL PROGRESS
          </h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{completedQuests}</div>
              <div style={styles.statLabel}>COMPLETED</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{quests.length - completedQuests}</div>
              <div style={styles.statLabel}>REMAINING</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalXP}</div>
              <div style={styles.statLabel}>TOTAL XP</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{Math.round((completedQuests / quests.length) * 100)}%</div>
              <div style={styles.statLabel}>PROGRESS</div>
            </div>
          </div>
        </motion.div>

        {/* Quests Grid */}
        <div style={styles.questsGrid}>
          {quests.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              style={styles.questCard}
              className="quest-card"
            >
              {/* Corner Brackets */}
              <div style={{
                position: 'absolute',
                inset: '-2px',
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  width: '16px',
                  height: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '-2px',
                  width: '16px',
                  height: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                }} />
              </div>
              
              <div style={styles.questHeader}>
                <div>
                  <div style={styles.questTitle}>
                    {quest.icon} {quest.title.toUpperCase()}
                  </div>
                  <div style={styles.questDescription}>
                    {quest.description}
                  </div>
                </div>
                <div style={{
                  ...styles.questStatus,
                  ...(quest.status === 'completed' ? styles.statusCompleted : 
                      quest.status === 'in_progress' ? styles.statusInProgress : 
                      styles.statusLocked)
                }}>
                  {quest.status === 'completed' ? <CheckCircle size={12} /> : 
                   quest.status === 'in_progress' ? <Clock size={12} /> : 
                   <Target size={12} />}
                  {quest.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {quest.status !== 'locked' && (
                <div style={styles.questProgress}>
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

              <div style={styles.questFooter}>
                <div style={styles.questReward}>
                  <Star size={14} />
                  {quest.reward} XP
                </div>
                {quest.status === 'completed' && (
                  <CheckCircle size={20} color="#22c55e" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .quest-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  )
}
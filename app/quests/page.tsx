'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Users,
  Calendar,
  Star,
  Clock,
  Award,
  Zap,
  CheckCircle,
  ExternalLink,
  TrendingUp
} from 'lucide-react'

interface Quest {
  id: string
  title: string
  description: string
  category: string
  xp_reward: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  estimated_time: string
  requirements: string[]
  status: 'available' | 'in_progress' | 'completed' | 'locked'
  participants_count?: number
  completion_rate?: number
  deadline?: string
  created_at: string
  updated_at: string
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

  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },

  filterTab: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '8px 16px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#9ca3af',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease'
  },

  filterTabActive: {
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    color: '#c084fc'
  },

  questsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },

  questCard: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '0px',
    padding: '24px',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    cursor: 'pointer'
  },

  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },

  questTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  questCategory: {
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },

  questDescription: {
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: '1.4',
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  questMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  questReward: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '0px',
    padding: '8px 12px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  difficultyBadge: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    padding: '4px 8px',
    fontSize: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '0px'
  },

  requirements: {
    marginBottom: '16px'
  },

  requirementsList: {
    fontSize: '10px',
    color: '#9ca3af',
    lineHeight: '1.4'
  },

  questFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
  },

  questStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '9px',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  startButton: {
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '0px',
    padding: '8px 16px',
    color: '#c084fc',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
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

export default function PublicQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock data for now - in production this would come from API
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Connect Your GitHub Account',
      description: 'Link your GitHub account to verify your development skills and contributions. This quest helps build your developer reputation score.',
      category: 'social',
      xp_reward: 100,
      difficulty: 'easy',
      estimated_time: '5 minutes',
      requirements: ['Valid GitHub account', 'Public repositories'],
      status: 'available',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Deploy Your First Sui Move Contract',
      description: 'Create and deploy a basic Move smart contract on Sui testnet. Learn the fundamentals of Sui blockchain development.',
      category: 'development',
      xp_reward: 250,
      difficulty: 'medium',
      estimated_time: '2 hours',
      requirements: ['Basic Move knowledge', 'Sui CLI installed', 'Testnet SUI tokens'],
      status: 'available',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z'
    },
    {
      id: '3',
      title: 'Complete Professional Profile',
      description: 'Fill out your complete professional profile including skills, experience, and portfolio links to increase your reputation score.',
      category: 'profile',
      xp_reward: 150,
      difficulty: 'easy',
      estimated_time: '15 minutes',
      requirements: ['Account verification', 'Valid email address'],
      status: 'available',
      created_at: '2024-01-12T10:00:00Z',
      updated_at: '2024-01-12T10:00:00Z'
    },
    {
      id: '4',
      title: 'Contribute to Open Source',
      description: 'Make meaningful contributions to open source projects. Submit at least 3 pull requests that get merged.',
      category: 'development',
      xp_reward: 400,
      difficulty: 'hard',
      estimated_time: '1 week',
      requirements: ['GitHub account', 'Programming skills', 'Understanding of Git'],
      status: 'available',
      created_at: '2024-01-08T10:00:00Z',
      updated_at: '2024-01-08T10:00:00Z'
    },
    {
      id: '5',
      title: 'NFT Marketplace Builder',
      description: 'Build a complete NFT marketplace on Sui using Move smart contracts. Advanced quest for experienced developers.',
      category: 'development',
      xp_reward: 800,
      difficulty: 'expert',
      estimated_time: '3 weeks',
      requirements: ['Advanced Move skills', 'Frontend development', 'Sui ecosystem knowledge'],
      status: 'available',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    },
    {
      id: '6',
      title: 'Community Champion',
      description: 'Actively participate in the SuiDentity community. Help other users, answer questions, and share knowledge.',
      category: 'community',
      xp_reward: 200,
      difficulty: 'medium',
      estimated_time: 'Ongoing',
      requirements: ['Active community participation', 'Helpful contributions'],
      status: 'available',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Quests', count: mockQuests.length },
    { id: 'social', name: 'Social', count: mockQuests.filter(q => q.category === 'social').length },
    { id: 'development', name: 'Development', count: mockQuests.filter(q => q.category === 'development').length },
    { id: 'profile', name: 'Profile', count: mockQuests.filter(q => q.category === 'profile').length },
    { id: 'community', name: 'Community', count: mockQuests.filter(q => q.category === 'community').length }
  ]

  const filteredQuests = selectedCategory === 'all' 
    ? mockQuests 
    : mockQuests.filter(quest => quest.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, { bg: string, border: string, color: string }> = {
      'easy': { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' },
      'medium': { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' },
      'hard': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' },
      'expert': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', color: '#8b5cf6' }
    }
    return colors[difficulty] || colors.easy
  }

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setQuests(mockQuests)
      setLoading(false)
    }, 1000)
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
            <Link href="/leaderboard" style={styles.navLink}>
              LEADERBOARD
            </Link>
            <Link href="/quests" style={{...styles.navLink, ...styles.navLinkActive}}>
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
              REPUTATION QUESTS
            </h1>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              EARN XP & BUILD YOUR WEB3 REPUTATION
            </div>
          </div>
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
            PLATFORM STATISTICS
          </h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>{mockQuests.length}</div>
              <div style={styles.statLabel}>TOTAL QUESTS</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>
                {mockQuests.reduce((sum, quest) => sum + quest.xp_reward, 0)}
              </div>
              <div style={styles.statLabel}>TOTAL XP AVAILABLE</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>
                {mockQuests.reduce((sum, quest) => sum + (quest.participants_count || 0), 0)}
              </div>
              <div style={styles.statLabel}>TOTAL PARTICIPANTS</div>
            </div>
            <div style={styles.statCard}>
              <CornerBrackets size={12} opacity={0.2} />
              <div style={styles.statValue}>
                {Math.round(mockQuests.reduce((sum, quest) => sum + (quest.completion_rate || 0), 0) / mockQuests.length)}%
              </div>
              <div style={styles.statLabel}>AVG COMPLETION</div>
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
          
          {/* Category Filters */}
          <div style={styles.filterTabs}>
            {categories.map((category) => (
              <button
                key={category.id}
                style={{
                  ...styles.filterTab,
                  ...(selectedCategory === category.id ? styles.filterTabActive : {})
                }}
                onClick={() => setSelectedCategory(category.id)}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Loading quests...
            </div>
          ) : filteredQuests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666666',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              No quests found in this category.
            </div>
          ) : (
            <div style={styles.questsGrid}>
              {filteredQuests.map((quest, index) => {
                const difficultyStyle = getDifficultyColor(quest.difficulty)
                
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    style={styles.questCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={() => window.open(`/dashboard/quests/${quest.id}`, '_blank')}
                  >
                    <CornerBrackets size={10} opacity={0.2} />
                    
                    <div
                      style={{
                        ...styles.difficultyBadge,
                        background: difficultyStyle.bg,
                        border: `1px solid ${difficultyStyle.border}`,
                        color: difficultyStyle.color
                      }}
                    >
                      {quest.difficulty}
                    </div>

                    <div style={styles.questHeader}>
                      <div style={{ flex: 1 }}>
                        <h3 style={styles.questTitle}>{quest.title}</h3>
                        <div style={styles.questCategory}>
                          {quest.category.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div style={styles.questDescription}>
                      {quest.description}
                    </div>


                    {quest.requirements.length > 0 && (
                      <div style={styles.requirements}>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px'
                        }}>
                          Requirements:
                        </div>
                        <div style={styles.requirementsList}>
                          • {quest.requirements.join(' • ')}
                        </div>
                      </div>
                    )}

                    <div style={styles.questFooter}>
                      <div style={styles.questReward}>
                        <Award size={10} />
                        {quest.xp_reward} XP
                      </div>

                      <button
                        style={styles.startButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/dashboard/quests/${quest.id}`, '_blank')
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)'
                          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'
                          e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
                        }}
                      >
                        VIEW QUEST
                        <ExternalLink size={8} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
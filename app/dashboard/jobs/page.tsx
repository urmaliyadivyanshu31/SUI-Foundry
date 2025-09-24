'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Plus,
  Briefcase,
  Building,
  Star,
  Eye,
  Heart,
  ArrowRight
} from 'lucide-react'
import { JobWithDetails, JobSearchFilters } from '@/types'

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, #0a0a0a 0%, #000000 50%, #0a0a0a 100%)',
    color: 'white',
    fontFamily: '"Courier New", monospace',
    overflow: 'hidden',
    position: 'relative' as const
  },

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

  mainContainer: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '100px 30px 60px 30px',
    position: 'relative',
    zIndex: 10
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
  },

  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace'
  },

  actionButtons: {
    display: 'flex',
    gap: '12px'
  },

  actionButton: {
    padding: '12px 20px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  searchSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '20px',
    marginBottom: '30px',
    padding: '25px',
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.1)'
  },

  searchInput: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    padding: '15px',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  filterButton: {
    padding: '15px 25px',
    background: 'rgba(0, 153, 204, 0.1)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    color: '#0099cc',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '25px'
  },

  jobCard: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    padding: '25px',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  },

  jobCardFeatured: {
    border: '1px solid rgba(255, 215, 0, 0.4)',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
  },

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },

  jobTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '5px',
    fontFamily: '"Courier New", monospace'
  },

  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#0099cc',
    marginBottom: '15px'
  },

  jobMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '15px'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: '#00ff00',
    fontFamily: '"Courier New", monospace'
  },

  jobDescription: {
    fontSize: '11px',
    color: '#cccccc',
    lineHeight: '1.5',
    marginBottom: '15px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  skillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '15px'
  },

  skillTag: {
    padding: '4px 8px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    fontSize: '9px',
    color: '#00ff00',
    fontFamily: '"Courier New", monospace',
    textTransform: 'uppercase'
  },

  jobFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '15px',
    borderTop: '1px solid rgba(0, 255, 0, 0.1)'
  },

  jobStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '10px',
    color: '#666666'
  },

  applyButton: {
    padding: '8px 16px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease'
  },

  featuredBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    padding: '4px 8px',
    background: 'rgba(255, 215, 0, 0.2)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    color: '#ffd700',
    fontSize: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px'
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

export default function JobBoardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<JobSearchFilters>({})

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

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      
      if (searchTerm) searchParams.append('search', searchTerm)
      
      const response = await fetch(`/api/jobs?${searchParams.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setJobs(result.data.jobs)
      } else {
        console.error('Failed to fetch jobs:', result.error)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs()
    }
  }, [isAuthenticated, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs()
  }

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    return `Up to ${currency} ${max?.toLocaleString()}`
  }

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': '#00ff00',
      'part-time': '#0099cc',
      'contract': '#ffa500',
      'freelance': '#ff6b6b',
      'internship': '#9b59b6'
    }
    return colors[type] || '#666666'
  }

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
          LOADING_JOB_INTERFACE...
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const walletAddress = user?.walletAddress || user?.address

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
              style={{...styles.navLink, ...styles.navLinkActive}}
            >
              TALENT
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
            <div style={{
              textAlign: 'right' as const,
              fontSize: '11px',
              fontFamily: '"Courier New", monospace'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#00ff00' }}>
                @{profile.username}
              </div>
              <div style={{ fontSize: '10px', color: '#0099cc', opacity: 0.8 }}>
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.pageHeader}
        >
          <div>
            <h1 style={styles.pageTitle}>
              ║█║ JOB_OPPORTUNITIES ║█║
            </h1>
            <div style={{
              fontSize: '11px',
              color: '#0099cc',
              marginTop: '5px',
              fontFamily: '"Courier New", monospace'
            }}>
              DISCOVER_BLOCKCHAIN_CAREERS // REPUTATION_BASED_MATCHING
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button
              style={styles.actionButton}
              onClick={() => router.push('/dashboard/jobs/post')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Plus size={14} />
              POST_JOB
            </button>

            <button
              style={{
                ...styles.actionButton,
                background: 'rgba(0, 153, 204, 0.1)',
                borderColor: 'rgba(0, 153, 204, 0.3)',
                color: '#0099cc'
              }}
              onClick={() => router.push('/dashboard/jobs/my-applications')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 153, 204, 0.2)'
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 153, 204, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Briefcase size={14} />
              MY_APPLICATIONS
            </button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.searchSection}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px' }}>
            <input
              type="text"
              placeholder="SEARCH_JOBS: TITLE, COMPANY, SKILLS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{...styles.searchInput, flex: 1}}
            />
            <button
              type="submit"
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
              }}
            >
              <Search size={14} />
              SEARCH
            </button>
          </form>

          <button
            style={styles.filterButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)'
            }}
          >
            <Filter size={14} />
            FILTERS
          </button>
        </motion.div>

        {/* Jobs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.jobsGrid}
        >
          {loading ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '50px',
              color: '#00ff00',
              fontSize: '14px'
            }}>
              LOADING_OPPORTUNITIES...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '50px',
              color: '#666666',
              fontSize: '14px'
            }}>
              NO_JOBS_FOUND // EXPAND_SEARCH_PARAMETERS
            </div>
          ) : (
            jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  ...styles.jobCard,
                  ...(job.featured ? styles.jobCardFeatured : {})
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                {job.featured && (
                  <div style={styles.featuredBadge}>
                    <Star size={10} style={{ marginRight: '4px' }} />
                    FEATURED
                  </div>
                )}

                <div style={styles.jobHeader}>
                  <div>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <div style={styles.companyInfo}>
                      <Building size={12} />
                      {job.company.name}
                      {job.company.verified && <Star size={10} color="#ffd700" />}
                    </div>
                  </div>
                </div>

                <div style={styles.jobMeta}>
                  <div style={styles.metaItem}>
                    <Briefcase size={10} />
                    <span style={{ color: getJobTypeColor(job.job_type) }}>
                      {job.job_type.toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <MapPin size={10} />
                    {job.location_type.toUpperCase()}
                  </div>
                  <div style={styles.metaItem}>
                    <DollarSign size={10} />
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </div>
                  <div style={styles.metaItem}>
                    <Users size={10} />
                    MIN_REP: {job.min_reputation_score}
                  </div>
                </div>

                <div style={styles.jobDescription}>
                  {job.description}
                </div>

                {job.required_skills_details && job.required_skills_details.length > 0 && (
                  <div style={styles.skillsTags}>
                    {job.required_skills_details.slice(0, 5).map((skill) => (
                      <span key={skill.id} style={styles.skillTag}>
                        {skill.name}
                      </span>
                    ))}
                    {job.required_skills_details.length > 5 && (
                      <span style={styles.skillTag}>
                        +{job.required_skills_details.length - 5} MORE
                      </span>
                    )}
                  </div>
                )}

                <div style={styles.jobFooter}>
                  <div style={styles.jobStats}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={10} />
                      {job.view_count}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={10} />
                      {job.application_count}
                    </div>
                    <div style={{ fontSize: '9px' }}>
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    style={styles.applyButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/jobs/${job.id}/apply`)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    APPLY
                    <ArrowRight size={10} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        input:focus {
          border-color: rgba(0, 255, 0, 0.6) !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3) !important;
        }
        
        input::placeholder {
          color: rgba(0, 255, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase,
  Building,
  Star,
  Eye,
  ArrowRight,
  ExternalLink,
  LogOut,
  Plus
} from 'lucide-react'
import { JobWithDetails, JobSearchFilters } from '@/types'

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

// Infinity loader component
const InfinityLoader = () => (
  <div style={styles.infinityLoader}>
    <svg
      width="80"
      height="40"
      viewBox="0 0 80 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main infinity path */}
      <motion.path
        d="M20,20 C20,10 30,10 40,20 C50,30 60,30 60,20 C60,10 50,10 40,20 C30,30 20,30 20,20 Z"
        fill="none"
        stroke="url(#infinityGradient)"
        strokeWidth="3"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 2, ease: "easeInOut", repeat: Infinity },
          opacity: { duration: 0.5 }
        }}
      />
      
      {/* Moving particle */}
      <motion.circle
        cx="20"
        cy="20"
        r="3"
        fill="#c084fc"
        filter="url(#glow)"
        animate={{
          x: [0, 20, 40, 20, 0],
          y: [0, -10, 0, 10, 0]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />
      
      {/* Second moving particle (opposite direction) */}
      <motion.circle
        cx="60"
        cy="20"
        r="2"
        fill="#a855f7"
        filter="url(#glow)"
        animate={{
          x: [0, -20, -40, -20, 0],
          y: [0, 10, 0, -10, 0]
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1
        }}
      />
    </svg>
  </div>
)

// Floating particles background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 10 + Math.random() * 20
  }))

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(147, 51, 234, 0.3)',
            borderRadius: '50%'
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at top, rgba(16, 16, 16, 0.8) 0%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 1) 100%), linear-gradient(to bottom, #000000, #0a0a0a)',
    color: 'white',
    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
    fontSize: '13px'
  },

  header: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 100
  },

  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'relative' as const
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

  searchSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '16px',
    marginBottom: '24px'
  },

  searchInput: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0px',
    padding: '12px 16px',
    fontSize: '13px',
    color: 'white',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },

  filterButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0px',
    padding: '12px 20px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '16px'
  },

  jobCard: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '0px',
    padding: '20px',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    cursor: 'pointer'
  },

  jobCardFeatured: {
    border: '1px solid rgba(255, 215, 0, 0.3)',
    background: 'rgba(255, 215, 0, 0.02)'
  },

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },

  jobTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '12px'
  },

  jobMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginBottom: '12px'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  jobDescription: {
    fontSize: '11px',
    color: '#9ca3af',
    lineHeight: '1.4',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  skillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '16px'
  },

  skillTag: {
    padding: '2px 6px',
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    fontSize: '9px',
    color: '#c084fc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  jobFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
  },

  salary: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  applyButton: {
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '0px',
    padding: '6px 12px',
    color: '#c084fc',
    fontSize: '9px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  featuredBadge: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    padding: '2px 6px',
    background: 'rgba(255, 215, 0, 0.2)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    color: '#ffd700',
    fontSize: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
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
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  },

  createJobButton: {
    position: 'fixed' as const,
    bottom: '2rem',
    right: '2rem',
    background: 'rgba(147, 51, 234, 0.2)',
    border: '1px solid rgba(147, 51, 234, 0.4)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#c084fc',
    transition: 'all 0.3s ease',
    zIndex: 1000
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 2rem',
    gap: '2rem'
  },

  infinityLoader: {
    width: '80px',
    height: '40px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },

  jobInfo: {
    flex: 1
  },

  companyName: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px'
  },

  jobTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px'
  },

  tag: {
    padding: '4px 8px',
    background: 'rgba(147, 51, 234, 0.1)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    fontSize: '9px',
    color: '#c084fc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
}

export default function DashboardJobsPage() {
  const router = useRouter()
  const { user, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile(user?.wallet_address)
  
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [filters, setFilters] = useState<JobSearchFilters>({})

  // Hardcoded jobs for demonstration
  const hardcodedJobs: JobWithDetails[] = [
    {
      id: '1',
      title: 'Senior Blockchain Developer',
      company_id: 'comp1',
      description: 'We are looking for an experienced blockchain developer to join our team and work on cutting-edge DeFi protocols on Sui blockchain. You will be responsible for developing smart contracts, building dApps, and ensuring security best practices.',
      requirements: ['5+ years of blockchain development', 'Experience with Move language', 'DeFi protocol knowledge'],
      location: 'San Francisco, CA',
      salary_min: 150000,
      salary_max: 250000,
      job_type: 'full-time',
      experience_level: 'senior',
      is_remote: false,
      skills: ['Move', 'Rust', 'Sui', 'DeFi', 'Smart Contracts'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company: {
        id: 'comp1',
        name: 'SuiDentity Labs',
        logo: null,
        website: 'https://suidentity.com',
        description: 'Leading blockchain identity solutions'
      },
      applications: []
    },
    {
      id: '2', 
      title: 'Move Smart Contract Engineer',
      company_id: 'comp2',
      description: 'Join our innovative team building the next generation of Web3 applications. We are seeking a talented Move developer to create secure and efficient smart contracts for our DeFi ecosystem on Sui.',
      requirements: ['3+ years Move experience', 'Smart contract security knowledge', 'DeFi understanding'],
      location: 'Remote',
      salary_min: 120000,
      salary_max: 180000,
      job_type: 'full-time',
      experience_level: 'mid',
      is_remote: true,
      skills: ['Move', 'Sui', 'Web3', 'DeFi', 'Security'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company: {
        id: 'comp2',
        name: 'DeFi Innovations',
        logo: null,
        website: 'https://defiinnovations.com',
        description: 'Pioneering DeFi solutions'
      },
      applications: []
    }
  ]

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs || [])
      } else {
        // Fallback to hardcoded data if API fails
        console.warn('Jobs API failed, using fallback data')
        setJobs(hardcodedJobs)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      // Fallback to hardcoded data if network fails
      setJobs(hardcodedJobs)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleApplyJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}/apply`)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !location || 
      job.location.toLowerCase().includes(location.toLowerCase())
    
    const matchesType = !jobType || job.job_type === jobType
    
    return matchesSearch && matchesLocation && matchesType
  })

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
            <Link href="/dashboard" style={styles.navLink}>
              DASHBOARD
            </Link>
            <Link href="/dashboard/leaderboard" style={styles.navLink}>
              LEADERBOARD
            </Link>
            <Link href="/dashboard/quests" style={styles.navLink}>
              QUESTS
            </Link>
            <Link href="/dashboard/jobs" style={{...styles.navLink, ...styles.navLinkActive}}>
              TALENT
            </Link>
          </nav>

          {/* Auth Section */}
          <button onClick={handleLogout} style={styles.authButton}>
            <LogOut size={12} />
            LOGOUT
          </button>
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
              TALENT MARKETPLACE
            </h1>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              REPUTATION-BASED WEB3 TALENT MATCHING
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            SEARCH & FILTER
          </h2>
          
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            />
            <button
              type="button"
              style={styles.filterButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <Filter size={12} />
              FILTER
            </button>
          </div>
        </motion.section>

        {/* Jobs Grid */}
        {loading ? (
          <motion.div 
            style={styles.loadingContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <InfinityLoader />
            <div style={styles.loadingText}>
              Loading opportunities...
            </div>
          </motion.div>
        ) : (
          <motion.div 
            style={styles.jobsGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                style={styles.jobCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)'
                }}
              >
                <CornerBrackets size={16} opacity={0.2} />
                
                <div style={styles.jobHeader}>
                  <div style={styles.jobInfo}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <div style={styles.companyName}>
                      <Building size={12} />
                      {job.company?.name}
                    </div>
                  </div>
                  
                  <div style={styles.featuredBadge}>
                    FEATURED
                  </div>
                </div>

                <div style={styles.companyInfo}>
                  <Building size={10} />
                  <span>{job.company?.name}</span>
                </div>

                <div style={styles.jobMeta}>
                  <div style={styles.metaItem}>
                    <MapPin size={10} />
                    {job.location}
                  </div>
                  <div style={styles.metaItem}>
                    <Briefcase size={10} />
                    {job.job_type.replace('-', ' ')}
                  </div>
                  <div style={styles.metaItem}>
                    <Clock size={10} />
                    {job.experience_level}
                  </div>
                  <div style={styles.metaItem}>
                    <DollarSign size={10} />
                    ${job.salary_min?.toLocaleString()}
                  </div>
                </div>

                <p style={styles.jobDescription}>
                  {job.description}
                </p>

                <div style={styles.skillsTags}>
                  {job.skills?.slice(0, 4).map((skill) => (
                    <span key={skill} style={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={styles.jobFooter}>
                  <div style={styles.salary}>
                    ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                  </div>
                  
                  <button 
                    style={styles.applyButton}
                    onClick={() => handleApplyJob(job.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'
                    }}
                  >
                    APPLY
                    <ArrowRight size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredJobs.length === 0 && !loading && (
          <motion.div 
            style={styles.loadingContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              ...styles.infinityLoader,
              opacity: 0.3,
              transform: 'scale(0.8)'
            }}>
              <Briefcase size={48} color="rgba(192, 132, 252, 0.5)" />
            </div>
            <div style={styles.loadingText}>
              No opportunities match your search criteria
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem',
              textAlign: 'center' as const,
              maxWidth: '400px'
            }}>
              Try adjusting your filters or search terms to discover more blockchain and Web3 career opportunities.
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Job Button */}
      <Link href="/dashboard/jobs/post">
        <motion.button
          style={styles.createJobButton}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Post New Job"
        >
          <Plus size={24} />
        </motion.button>
      </Link>
    </div>
  )
}
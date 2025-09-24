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
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%)',
    color: 'white',
    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
    position: 'relative' as const,
    overflow: 'auto'
  },
  
  header: {
    position: 'relative' as const,
    zIndex: 10,
    padding: '2rem',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },

  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#c084fc'
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },

  navLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    position: 'relative' as const,
    border: '1px solid transparent'
  },

  navLinkActive: {
    color: '#c084fc',
    background: 'rgba(192, 132, 252, 0.1)',
    border: '1px solid rgba(192, 132, 252, 0.3)'
  },

  authButton: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(124, 58, 237, 0.5)',
    position: 'relative' as const
  },

  mainContent: {
    position: 'relative' as const,
    zIndex: 5,
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },

  titleSection: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    position: 'relative' as const
  },

  title: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: 1.2
  },

  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6
  },

  searchSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '3rem',
    position: 'relative' as const
  },

  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    alignItems: 'end'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },

  label: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },

  input: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '1rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },

  searchButton: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '56px'
  },

  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '2rem'
  },

  jobCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '2rem',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    cursor: 'pointer'
  },

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },

  jobInfo: {
    flex: 1
  },

  jobTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem'
  },

  companyName: {
    color: '#c084fc',
    fontSize: '1rem',
    marginBottom: '1rem'
  },

  jobMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    marginBottom: '1rem'
  },

  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },

  jobDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  },

  jobTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '1.5rem'
  },

  tag: {
    background: 'rgba(124, 58, 237, 0.2)',
    color: '#c084fc',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    border: '1px solid rgba(124, 58, 237, 0.3)'
  },

  jobFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },

  salary: {
    color: '#10b981',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },

  applyButton: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  createJobButton: {
    position: 'fixed' as const,
    bottom: '2rem',
    right: '2rem',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 1000
  },

  loadingText: {
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.1rem',
    padding: '3rem'
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
      // For demo purposes, use hardcoded data
      setTimeout(() => {
        setJobs(hardcodedJobs)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching jobs:', error)
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
      <FloatingParticles />
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.nav}>
          <div style={styles.navLeft}>
            <Link href="/" style={styles.logo}>
              <LogoIcon />
              SUIDENTITY
            </Link>
            
            <div style={styles.navLinks}>
              <Link 
                href="/dashboard" 
                style={styles.navLink}
              >
                DASHBOARD
              </Link>

              <Link 
                href="/dashboard/jobs" 
                style={{...styles.navLink, ...styles.navLinkActive}}
              >
                TALENT
              </Link>

              <Link 
                href="/dashboard/quests" 
                style={styles.navLink}
              >
                QUESTS
              </Link>

              <Link 
                href="/dashboard/leaderboard" 
                style={styles.navLink}
              >
                LEADERBOARD
              </Link>
            </div>
          </div>
          
          <button onClick={handleLogout} style={styles.authButton}>
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Title Section */}
        <motion.div 
          style={styles.titleSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={styles.title}>TALENT MARKETPLACE</h1>
          <p style={styles.subtitle}>
            DISCOVER BLOCKCHAIN & WEB3 CAREERS • REPUTATION-MATCHED OPPORTUNITIES
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          style={styles.searchSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <CornerBrackets />
          
          <div style={styles.searchGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Search Jobs</label>
              <input
                type="text"
                placeholder="Job title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={styles.input}
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            
            <button style={styles.searchButton}>
              <Search size={20} />
              Search
            </button>
          </div>
        </motion.div>

        {/* Jobs Grid */}
        {loading ? (
          <div style={styles.loadingText}>
            Loading opportunities...
          </div>
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
                      <Building size={16} style={{ marginRight: '0.5rem' }} />
                      {job.company?.name}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(124, 58, 237, 0.2)',
                    color: '#c084fc',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(124, 58, 237, 0.3)'
                  }}>
                    FEATURED
                  </div>
                </div>

                <div style={styles.jobMeta}>
                  <div style={styles.metaItem}>
                    <MapPin size={16} />
                    {job.location}
                  </div>
                  <div style={styles.metaItem}>
                    <Briefcase size={16} />
                    {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1).replace('-', ' ')}
                  </div>
                  <div style={styles.metaItem}>
                    <Users size={16} />
                    {job.experience_level}
                  </div>
                </div>

                <p style={styles.jobDescription}>
                  {job.description}
                </p>

                <div style={styles.jobTags}>
                  {job.skills?.slice(0, 4).map((skill) => (
                    <span key={skill} style={styles.tag}>
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
                  >
                    Apply Now
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredJobs.length === 0 && !loading && (
          <div style={styles.loadingText}>
            No jobs match your search criteria.
          </div>
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
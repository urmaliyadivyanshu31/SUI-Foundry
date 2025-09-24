'use client'

import { useState, useEffect } from 'react'
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
  ExternalLink
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

  jobStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '9px',
    color: '#666666',
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
    transition: 'all 0.2s ease'
  }
}

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<JobSearchFilters>({})

  // Hardcoded jobs for demo
  const hardcodedJobs: JobWithDetails[] = [
    {
      id: 'demo-1',
      title: 'Senior Move Developer',
      description: 'Join our team to build cutting-edge smart contracts on Sui blockchain. We\'re looking for an experienced developer passionate about Move programming language and decentralized applications.',
      requirements: 'Experience with Move programming, Sui ecosystem, smart contract development',
      job_type: 'full-time',
      experience_level: 'senior',
      location_type: 'remote',
      location: 'Global',
      salary_min: 120000,
      salary_max: 180000,
      salary_currency: 'USD',
      min_reputation_score: 650,
      company: {
        id: 'demo-company-1',
        name: 'SuiFi Labs',
        verified: true,
        logo: null,
        website: 'https://suifilabs.com',
        industry: 'Blockchain'
      },
      required_skills_details: [
        { id: '1', name: 'Move', category: 'programming' },
        { id: '2', name: 'Sui', category: 'blockchain' },
        { id: '3', name: 'Smart Contracts', category: 'blockchain' },
        { id: '4', name: 'Rust', category: 'programming' }
      ],
      preferred_skills_details: [],
      featured: true,
      view_count: 432,
      application_count: 28,
      is_active: true,
      remote_friendly: true,
      equity_offered: true,
      crypto_payment: true,
      sui_payment: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'demo-2',
      title: 'Web3 Frontend Engineer',
      description: 'Build beautiful and intuitive user interfaces for next-generation DeFi applications. Work with modern React, TypeScript, and Web3 technologies to create seamless user experiences.',
      requirements: 'React, TypeScript, Web3.js/Ethers.js experience, UI/UX skills',
      job_type: 'full-time',
      experience_level: 'mid',
      location_type: 'hybrid',
      location: 'San Francisco, CA',
      salary_min: 90000,
      salary_max: 140000,
      salary_currency: 'USD',
      min_reputation_score: 500,
      company: {
        id: 'demo-company-2',
        name: 'DecentraUI',
        verified: false,
        logo: null,
        website: 'https://decentraui.com',
        industry: 'DeFi'
      },
      required_skills_details: [
        { id: '5', name: 'React', category: 'frontend' },
        { id: '6', name: 'TypeScript', category: 'programming' },
        { id: '7', name: 'Web3', category: 'blockchain' },
        { id: '8', name: 'UI/UX Design', category: 'design' }
      ],
      preferred_skills_details: [],
      featured: false,
      view_count: 287,
      application_count: 15,
      is_active: true,
      remote_friendly: true,
      equity_offered: false,
      crypto_payment: false,
      sui_payment: false,
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z'
    }
  ]

  // Fetch jobs without authentication requirement
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      
      if (searchTerm) searchParams.append('search', searchTerm)
      
      const response = await fetch(`/api/jobs?${searchParams.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        // Combine API jobs with hardcoded jobs
        const apiJobs = result.data.jobs || []
        setJobs([...hardcodedJobs, ...apiJobs])
      } else {
        console.error('Failed to fetch jobs:', result.error)
        // Show hardcoded jobs even if API fails
        setJobs(hardcodedJobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      // Show hardcoded jobs if API call fails
      setJobs(hardcodedJobs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always show hardcoded jobs for demo
    setJobs(hardcodedJobs)
    setLoading(false)
    
    // Disable API fetching for now to prevent errors
    // fetchJobs()
  }, [searchTerm])

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
      'full-time': '#22c55e',
      'part-time': '#3b82f6',
      'contract': '#f59e0b',
      'freelance': '#ef4444',
      'internship': '#8b5cf6'
    }
    return colors[type] || '#9ca3af'
  }

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
            <Link href="/quests" style={styles.navLink}>
              QUESTS
            </Link>
            <Link href="/jobs" style={{...styles.navLink, ...styles.navLinkActive}}>
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
          
          <form onSubmit={handleSearch} style={styles.searchSection}>
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
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Filter size={12} />
              FILTERS
            </button>
          </form>
        </motion.section>

        {/* Jobs Grid */}
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
            TALENT OPPORTUNITIES
          </h2>
          
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Loading opportunities...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#666666',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              No jobs found. Try adjusting your search.
            </div>
          ) : (
            <div style={styles.jobsGrid}>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  style={{
                    ...styles.jobCard,
                    ...(job.featured ? styles.jobCardFeatured : {})
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = job.featured 
                      ? 'rgba(255, 215, 0, 0.5)' 
                      : 'rgba(147, 51, 234, 0.3)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = job.featured 
                      ? 'rgba(255, 215, 0, 0.3)' 
                      : 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => window.open(`/dashboard/jobs/${job.id}`, '_blank')}
                >
                  <CornerBrackets size={10} opacity={0.2} />
                  
                  {job.featured && (
                    <div style={styles.featuredBadge}>
                      FEATURED
                    </div>
                  )}

                  <div style={styles.jobHeader}>
                    <div>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <div style={styles.companyInfo}>
                        <Building size={10} />
                        {job.company.name}
                        {job.company.verified && <Star size={8} color="#ffd700" />}
                      </div>
                    </div>
                  </div>

                  <div style={styles.jobMeta}>
                    <div style={styles.metaItem}>
                      <Briefcase size={8} />
                      <span style={{ color: getJobTypeColor(job.job_type) }}>
                        {job.job_type.replace('-', ' ')}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <MapPin size={8} />
                      {job.location_type.replace('-', ' ')}
                    </div>
                    <div style={styles.metaItem}>
                      <DollarSign size={8} />
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </div>
                    <div style={styles.metaItem}>
                      <Users size={8} />
                      Min Rep: {job.min_reputation_score}
                    </div>
                  </div>

                  <div style={styles.jobDescription}>
                    {job.description}
                  </div>

                  {job.required_skills_details && job.required_skills_details.length > 0 && (
                    <div style={styles.skillsTags}>
                      {job.required_skills_details.slice(0, 4).map((skill) => (
                        <span key={skill.id} style={styles.skillTag}>
                          {skill.name}
                        </span>
                      ))}
                      {job.required_skills_details.length > 4 && (
                        <span style={styles.skillTag}>
                          +{job.required_skills_details.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={styles.jobFooter}>
                    <div style={styles.jobStats}>
                      <div style={{ fontSize: '9px', color: '#9ca3af' }}>
                        REPUTATION-MATCHED OPPORTUNITY
                      </div>
                    </div>

                    <button
                      style={styles.applyButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/dashboard/jobs/${job.id}/apply`, '_blank')
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
                      VIEW
                      <ExternalLink size={8} />
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
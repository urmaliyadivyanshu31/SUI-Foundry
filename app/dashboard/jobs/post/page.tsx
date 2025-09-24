'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  ArrowLeft, 
  Building, 
  Plus, 
  X,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle
} from 'lucide-react'
import { JobPostForm, Company, JobSkill } from '@/types'

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

  mainContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '100px 30px 60px 30px',
    position: 'relative',
    zIndex: 10
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
  },

  backButton: {
    padding: '10px 15px',
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
    gap: '8px',
    transition: 'all 0.3s ease'
  },

  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace'
  },

  formContainer: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    padding: '30px',
    boxShadow: '0 0 30px rgba(0, 255, 0, 0.1)'
  },

  formSection: {
    marginBottom: '30px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)',
    fontFamily: '"Courier New", monospace'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },

  formField: {
    marginBottom: '20px'
  },

  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#0099cc',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    fontFamily: '"Courier New", monospace'
  },

  input: {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  textarea: {
    width: '100%',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '100px',
    transition: 'all 0.3s ease'
  },

  select: {
    width: '100%',
    padding: '12px 15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },

  checkboxInput: {
    width: '16px',
    height: '16px',
    accentColor: '#00ff00'
  },

  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '15px'
  },

  skillTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    fontSize: '10px',
    color: '#00ff00',
    fontFamily: '"Courier New", monospace'
  },

  removeSkillButton: {
    background: 'none',
    border: 'none',
    color: '#ff4444',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center'
  },

  skillSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    maxHeight: '200px',
    overflow: 'auto',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    marginTop: '10px'
  },

  skillOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: 'rgba(0, 255, 0, 0.05)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    cursor: 'pointer',
    fontSize: '10px',
    color: '#00ff00',
    transition: 'all 0.2s ease'
  },

  companySelector: {
    padding: '15px',
    background: 'rgba(0, 153, 204, 0.1)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    marginBottom: '20px'
  },

  companyOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.2s ease'
  },

  createCompanyButton: {
    width: '100%',
    padding: '15px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },

  submitButton: {
    width: '100%',
    padding: '18px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    marginTop: '20px'
  },

  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
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

export default function PostJobPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [companies, setCompanies] = useState<Company[]>([])
  const [skills, setSkills] = useState<JobSkill[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showSkillSelector, setShowSkillSelector] = useState<'required' | 'preferred' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<JobPostForm>({
    title: '',
    description: '',
    requirements: '',
    job_type: 'full-time',
    experience_level: 'mid',
    location_type: 'remote',
    location: '',
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: 'USD',
    min_reputation_score: 400,
    required_skills: [],
    preferred_skills: [],
    benefits: [],
    application_deadline: '',
    remote_friendly: true,
    equity_offered: false,
    crypto_payment: false,
    sui_payment: false
  })

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

  // Fetch user's companies and skills
  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanies()
      fetchSkills()
    }
  }, [isAuthenticated])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const result = await response.json()
      if (result.success) {
        // Filter to user's companies
        const userCompanies = result.data.companies.filter((c: Company) => c.created_by === user?.id)
        setCompanies(userCompanies)
        if (userCompanies.length === 1) {
          setSelectedCompany(userCompanies[0])
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/job-skills')
      const result = await response.json()
      if (result.success) {
        setSkills(result.data.skills)
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const handleInputChange = (field: keyof JobPostForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = (skillId: string, type: 'required' | 'preferred') => {
    const currentSkills = type === 'required' ? formData.required_skills : formData.preferred_skills
    if (!currentSkills.includes(skillId)) {
      handleInputChange(
        type === 'required' ? 'required_skills' : 'preferred_skills',
        [...currentSkills, skillId]
      )
    }
  }

  const removeSkill = (skillId: string, type: 'required' | 'preferred') => {
    const currentSkills = type === 'required' ? formData.required_skills : formData.preferred_skills
    handleInputChange(
      type === 'required' ? 'required_skills' : 'preferred_skills',
      currentSkills.filter(id => id !== skillId)
    )
  }

  const getSkillById = (skillId: string) => skills.find(s => s.id === skillId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          company_id: selectedCompany.id
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Job posted successfully!')
        router.push('/dashboard/jobs')
      } else {
        alert('Failed to post job: ' + result.error)
      }
    } catch (error) {
      console.error('Error posting job:', error)
      alert('Error posting job')
    } finally {
      setSubmitting(false)
    }
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
          LOADING_JOB_POSTING_INTERFACE...
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

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <button
            style={styles.backButton}
            onClick={() => router.back()}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)'
            }}
          >
            <ArrowLeft size={14} />
            BACK
          </button>

          <div>
            <h1 style={styles.pageTitle}>
              ║█║ POST_NEW_JOB ║█║
            </h1>
            <div style={{
              fontSize: '11px',
              color: '#0099cc',
              marginTop: '5px',
              fontFamily: '"Courier New", monospace'
            }}>
              RECRUIT_TOP_TALENT // REPUTATION_BASED_HIRING
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            {/* Company Selection */}
            <div style={styles.formSection}>
              <div style={styles.sectionTitle}>
                ▲ COMPANY_SELECTION ▲
              </div>
              
              {companies.length === 0 ? (
                <div style={styles.companySelector}>
                  <div style={{
                    fontSize: '12px',
                    color: '#ffa500',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    NO_COMPANY_FOUND // CREATE_ONE_TO_POST_JOBS
                  </div>
                  <button
                    type="button"
                    style={styles.createCompanyButton}
                    onClick={() => router.push('/dashboard/company/create')}
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
                    CREATE_COMPANY
                  </button>
                </div>
              ) : (
                <div>
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      style={{
                        ...styles.companyOption,
                        ...(selectedCompany?.id === company.id ? {
                          background: 'rgba(0, 255, 0, 0.1)',
                          borderColor: 'rgba(0, 255, 0, 0.4)'
                        } : {})
                      }}
                      onClick={() => setSelectedCompany(company)}
                      onMouseEnter={(e) => {
                        if (selectedCompany?.id !== company.id) {
                          e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCompany?.id !== company.id) {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building size={16} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
                            {company.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#0099cc' }}>
                            {company.industry || 'Industry not specified'}
                          </div>
                        </div>
                      </div>
                      {company.verified && <Star size={14} color="#ffd700" />}
                      {selectedCompany?.id === company.id && <CheckCircle size={14} color="#00ff00" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCompany && (
              <>
                {/* Basic Job Information */}
                <div style={styles.formSection}>
                  <div style={styles.sectionTitle}>
                    ◆ JOB_INFORMATION ◆
                  </div>
                  
                  <div style={styles.formField}>
                    <label style={styles.label}>Job Title *</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="SENIOR_MOVE_DEVELOPER"
                      required
                    />
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.label}>Job Description *</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="DETAILED_JOB_DESCRIPTION..."
                      required
                    />
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.label}>Requirements *</label>
                    <textarea
                      style={styles.textarea}
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="MINIMUM_REQUIREMENTS_FOR_CANDIDATES..."
                      required
                    />
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Job Type *</label>
                      <select
                        style={styles.select}
                        value={formData.job_type}
                        onChange={(e) => handleInputChange('job_type', e.target.value)}
                      >
                        <option value="full-time">FULL_TIME</option>
                        <option value="part-time">PART_TIME</option>
                        <option value="contract">CONTRACT</option>
                        <option value="freelance">FREELANCE</option>
                        <option value="internship">INTERNSHIP</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Experience Level *</label>
                      <select
                        style={styles.select}
                        value={formData.experience_level}
                        onChange={(e) => handleInputChange('experience_level', e.target.value)}
                      >
                        <option value="entry">ENTRY_LEVEL</option>
                        <option value="mid">MID_LEVEL</option>
                        <option value="senior">SENIOR</option>
                        <option value="lead">LEAD</option>
                        <option value="executive">EXECUTIVE</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Location Type *</label>
                      <select
                        style={styles.select}
                        value={formData.location_type}
                        onChange={(e) => handleInputChange('location_type', e.target.value)}
                      >
                        <option value="remote">REMOTE</option>
                        <option value="on-site">ON_SITE</option>
                        <option value="hybrid">HYBRID</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Location</label>
                      <input
                        type="text"
                        style={styles.input}
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="SAN_FRANCISCO_CA"
                      />
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div style={styles.formSection}>
                  <div style={styles.sectionTitle}>
                    $ COMPENSATION_DETAILS $
                  </div>
                  
                  <div style={styles.formGrid}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Salary Min (Annual)</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.salary_min || ''}
                        onChange={(e) => handleInputChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="80000"
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Salary Max (Annual)</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.salary_max || ''}
                        onChange={(e) => handleInputChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="120000"
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Currency</label>
                      <select
                        style={styles.select}
                        value={formData.salary_currency}
                        onChange={(e) => handleInputChange('salary_currency', e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="SUI">SUI</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Min Reputation Score</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.min_reputation_score}
                        onChange={(e) => handleInputChange('min_reputation_score', parseInt(e.target.value))}
                        min={300}
                        max={850}
                        placeholder="400"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
                    <div style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.equity_offered}
                        onChange={(e) => handleInputChange('equity_offered', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', color: '#0099cc' }}>EQUITY_OFFERED</span>
                    </div>

                    <div style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.crypto_payment}
                        onChange={(e) => handleInputChange('crypto_payment', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', color: '#0099cc' }}>CRYPTO_PAYMENT_ACCEPTED</span>
                    </div>

                    <div style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.sui_payment}
                        onChange={(e) => handleInputChange('sui_payment', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', color: '#0099cc' }}>SUI_PAYMENT_PREFERRED</span>
                    </div>

                    <div style={styles.checkbox}>
                      <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={formData.remote_friendly}
                        onChange={(e) => handleInputChange('remote_friendly', e.target.checked)}
                      />
                      <span style={{ fontSize: '11px', color: '#0099cc' }}>REMOTE_FRIENDLY</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div style={styles.formSection}>
                  <div style={styles.sectionTitle}>
                    ◇ REQUIRED_SKILLS ◇
                  </div>
                  
                  <div style={styles.skillsContainer}>
                    {formData.required_skills.map(skillId => {
                      const skill = getSkillById(skillId)
                      return skill ? (
                        <div key={skillId} style={styles.skillTag}>
                          {skill.name}
                          <button
                            type="button"
                            style={styles.removeSkillButton}
                            onClick={() => removeSkill(skillId, 'required')}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>

                  <button
                    type="button"
                    style={styles.createCompanyButton}
                    onClick={() => setShowSkillSelector(showSkillSelector === 'required' ? null : 'required')}
                  >
                    <Plus size={14} />
                    ADD_REQUIRED_SKILLS
                  </button>

                  {showSkillSelector === 'required' && (
                    <div style={styles.skillSelector}>
                      {skills
                        .filter(skill => !formData.required_skills.includes(skill.id))
                        .map(skill => (
                        <div
                          key={skill.id}
                          style={styles.skillOption}
                          onClick={() => {
                            addSkill(skill.id, 'required')
                            setShowSkillSelector(null)
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.05)'
                          }}
                        >
                          <input type="checkbox" style={styles.checkboxInput} />
                          <span>{skill.name}</span>
                          <span style={{ fontSize: '8px', opacity: 0.7 }}>
                            [{skill.category.toUpperCase()}]
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Skills */}
                <div style={styles.formSection}>
                  <div style={styles.sectionTitle}>
                    ◇ PREFERRED_SKILLS ◇
                  </div>
                  
                  <div style={styles.skillsContainer}>
                    {formData.preferred_skills.map(skillId => {
                      const skill = getSkillById(skillId)
                      return skill ? (
                        <div key={skillId} style={styles.skillTag}>
                          {skill.name}
                          <button
                            type="button"
                            style={styles.removeSkillButton}
                            onClick={() => removeSkill(skillId, 'preferred')}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>

                  <button
                    type="button"
                    style={styles.createCompanyButton}
                    onClick={() => setShowSkillSelector(showSkillSelector === 'preferred' ? null : 'preferred')}
                  >
                    <Plus size={14} />
                    ADD_PREFERRED_SKILLS
                  </button>

                  {showSkillSelector === 'preferred' && (
                    <div style={styles.skillSelector}>
                      {skills
                        .filter(skill => !formData.preferred_skills.includes(skill.id))
                        .map(skill => (
                        <div
                          key={skill.id}
                          style={styles.skillOption}
                          onClick={() => {
                            addSkill(skill.id, 'preferred')
                            setShowSkillSelector(null)
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.05)'
                          }}
                        >
                          <input type="checkbox" style={styles.checkboxInput} />
                          <span>{skill.name}</span>
                          <span style={{ fontSize: '8px', opacity: 0.7 }}>
                            [{skill.category.toUpperCase()}]
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div style={styles.formSection}>
                  <div style={styles.sectionTitle}>
                    ▲ ADDITIONAL_DETAILS ▲
                  </div>
                  
                  <div style={styles.formField}>
                    <label style={styles.label}>Application Deadline</label>
                    <input
                      type="datetime-local"
                      style={styles.input}
                      value={formData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(submitting ? styles.submitButtonDisabled : {})
                  }}
                  disabled={submitting || !formData.title || !formData.description || !formData.requirements}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {submitting ? 'POSTING_JOB...' : 'POST_JOB_OPENING'}
                  <CheckCircle size={16} />
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: rgba(0, 255, 0, 0.6) !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3) !important;
        }
        
        input::placeholder, textarea::placeholder {
          color: rgba(0, 255, 0, 0.4);
        }

        option {
          background: rgba(0, 0, 0, 0.9);
          color: #00ff00;
        }
      `}</style>
    </div>
  )
}
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
  CheckCircle,
  Globe,
  MapPin,
  Users
} from 'lucide-react'
import { CompanyForm } from '@/types'

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
    maxWidth: '800px',
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
    minHeight: '80px',
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
  },

  infoBox: {
    padding: '15px',
    background: 'rgba(0, 153, 204, 0.1)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    marginBottom: '20px',
    fontSize: '11px',
    color: '#0099cc',
    lineHeight: '1.5'
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

export default function CreateCompanyPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CompanyForm>({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    company_size: undefined,
    industry: '',
    location: '',
    wallet_address: ''
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

  const handleInputChange = (field: keyof CompanyForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        alert('Company created successfully!')
        router.push('/dashboard/jobs/post')
      } else {
        alert('Failed to create company: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating company:', error)
      alert('Error creating company')
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
          LOADING_COMPANY_CREATION_INTERFACE...
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
              ║█║ CREATE_COMPANY ║█║
            </h1>
            <div style={{
              fontSize: '11px',
              color: '#0099cc',
              marginTop: '5px',
              fontFamily: '"Courier New", monospace'
            }}>
              ESTABLISH_CORPORATE_IDENTITY // POST_JOB_OPPORTUNITIES
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={styles.infoBox}>
            <Building size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
            COMPANY_VERIFICATION: After creation, contact support for verification badge. Verified companies receive enhanced visibility and access to premium features.
          </div>

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            {/* Basic Company Information */}
            <div style={styles.formSection}>
              <div style={styles.sectionTitle}>
                ◆ COMPANY_IDENTITY ◆
              </div>
              
              <div style={styles.formField}>
                <label style={styles.label}>Company Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="BLOCKCHAIN_INNOVATIONS_CORP"
                  required
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Company Description</label>
                <textarea
                  style={styles.textarea}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="BRIEF_DESCRIPTION_OF_YOUR_COMPANY..."
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.label}>Website</label>
                  <input
                    type="url"
                    style={styles.input}
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://your-company.com"
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Logo URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://cdn.your-company.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div style={styles.formSection}>
              <div style={styles.sectionTitle}>
                ▲ ORGANIZATION_DETAILS ▲
              </div>
              
              <div style={styles.formGrid}>
                <div style={styles.formField}>
                  <label style={styles.label}>Company Size</label>
                  <select
                    style={styles.select}
                    value={formData.company_size || ''}
                    onChange={(e) => handleInputChange('company_size', e.target.value || undefined)}
                  >
                    <option value="">SELECT_SIZE</option>
                    <option value="1-10">1-10_EMPLOYEES</option>
                    <option value="11-50">11-50_EMPLOYEES</option>
                    <option value="51-200">51-200_EMPLOYEES</option>
                    <option value="201-1000">201-1000_EMPLOYEES</option>
                    <option value="1000+">1000+_EMPLOYEES</option>
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Industry</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="BLOCKCHAIN_DEFI_INFRASTRUCTURE"
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="SAN_FRANCISCO_CA_USA"
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Company Wallet Address</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={formData.wallet_address}
                    onChange={(e) => handleInputChange('wallet_address', e.target.value)}
                    placeholder={walletAddress || 'SUI_WALLET_ADDRESS'}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(submitting ? styles.submitButtonDisabled : {})
              }}
              disabled={submitting || !formData.name}
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
              {submitting ? 'CREATING_COMPANY...' : 'CREATE_COMPANY_PROFILE'}
              <CheckCircle size={16} />
            </button>
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
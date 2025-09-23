'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile, useUsernameValidator } from '@/hooks/useUserProfile'
import { CheckCircle, User, UserCheck, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

type SetupStep = 'welcome' | 'profile' | 'complete'

// Logo Component
const LogoIcon = () => (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(203, 176, 255, 0.3)'
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      background: 'linear-gradient(45deg, #ffffff 0%, #cbb0ff 100%)',
      borderRadius: '4px',
    }} />
  </div>
)

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useZkLogin()
  const { profile, updateProfile, isLoading: isProfileLoading } = useUserProfile()
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Username validation
  const { 
    isAvailable, 
    isValidating, 
    validationError, 
    validateUsername 
  } = useUsernameValidator()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Auto-fill user data from authentication
  useEffect(() => {
    if (user && !displayName) {
      setDisplayName(user.name || user.email?.split('@')[0] || '')
    }
  }, [user, displayName])

  // Validate username on change
  useEffect(() => {
    if (username && username.length >= 3) {
      const timer = setTimeout(() => {
        validateUsername(username, profile?.id)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [username, validateUsername, profile?.id])

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleProfileSubmit = async () => {
    if (!isAvailable || validationError || !displayName.trim()) {
      toast.error('Please complete all required fields')
      return
    }

    setIsUpdating(true)
    try {
      const success = await updateProfile({ 
        username: username.trim(),
        // We'll set the display name as the username for now since we don't have a separate name field in the DB
        // In a real implementation, you might want to add a display_name field to the database
      })
      
      if (success) {
        toast.success('Profile updated successfully!')
        setCurrentStep('complete')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleComplete = () => {
    router.push('/dashboard')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <nav style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogoIcon />
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              SuiDentity
            </span>
          </div>
          
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            Setup Profile
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Progress Bar */}
          <div style={{
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon
                
                return (
                  <div key={step.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isActive 
                        ? 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: isCurrent ? '2px solid #9333ea' : 'none'
                    }}>
                      <Icon size={18} />
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: isActive 
                          ? 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)'
                          : 'rgba(255, 255, 255, 0.1)',
                        marginLeft: '8px'
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
            
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              textAlign: 'center'
            }}>
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            {currentStep === 'welcome' && (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Sparkles size={32} color="white" />
                </div>
                
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  Welcome to SuiDentity!
                </h2>
                
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  maxWidth: '400px',
                  margin: '0 auto 32px'
                }}>
                  Hi {user.name || user.email || 'there'}! Let's set up your decentralized identity profile.
                </p>
                
                <Button
                  onClick={() => setCurrentStep('profile')}
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  Get Started <ArrowRight size={16} />
                </Button>
              </div>
            )}

            {currentStep === 'profile' && (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <User size={32} color="white" />
                </div>
                
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  Create Your Profile
                </h2>
                
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  marginBottom: '32px'
                }}>
                  Choose a unique username for your SuiDentity profile.
                </p>
                
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Enter username"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '16px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                    
                    {username && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {isValidating ? (
                          <span style={{ color: '#9ca3af' }}>Checking availability...</span>
                        ) : validationError ? (
                          <span style={{ color: '#ef4444' }}>{validationError}</span>
                        ) : isAvailable ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} />
                            Username available
                          </span>
                        ) : username.length >= 3 ? (
                          <span style={{ color: '#ef4444' }}>Username not available</span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleProfileSubmit}
                    disabled={!isAvailable || validationError || !username.trim() || isUpdating}
                    style={{
                      background: (!isAvailable || validationError || !username.trim()) 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      cursor: (!isAvailable || validationError || !username.trim()) ? 'not-allowed' : 'pointer',
                      width: '100%',
                      opacity: isUpdating ? 0.7 : 1
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle size={32} color="white" />
                </div>
                
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  Profile Created!
                </h2>
                
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  maxWidth: '400px',
                  margin: '0 auto 32px'
                }}>
                  Your SuiDentity profile has been created successfully. You can now explore the dashboard and connect additional social accounts.
                </p>
                
                <Button
                  onClick={handleComplete}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  Enter Dashboard <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
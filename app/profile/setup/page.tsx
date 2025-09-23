'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUserProfile, useUsernameValidator } from '@/hooks/useUserProfile'
import { GitHubConnectionCard } from '@/components/ui/github-connection-card'
import { CheckCircle, Circle, User, UserCheck, Wallet, Github, Twitter, Linkedin } from 'lucide-react'
import { toast } from 'sonner'

type SetupStep = 'welcome' | 'username' | 'social' | 'complete'

// Logo Component matching homepage
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
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '12px',
        height: '12px',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '2px'
      }} />
    </div>
  </div>
)

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user: privyUser, authenticated } = usePrivy()
  const { profile, updateProfile, isLoading, profileCompletion, socialConnections, refreshProfile } = useUserProfile()
  const { validateUsername, isChecking, isAvailable, validationError } = useUsernameValidator()
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
  const [username, setUsername] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authenticated) {
      router.push('/')
    }
  }, [authenticated, router])

  // Set initial username from Privy data
  useEffect(() => {
    if (privyUser && !username) {
      const name = privyUser.google?.name || privyUser.twitter?.name || ''
      if (name) {
        const suggestedUsername = name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 15)
        setUsername(suggestedUsername)
      }
    }
  }, [privyUser, username])

  // Handle username validation
  useEffect(() => {
    if (username && username.length >= 3) {
      const timer = setTimeout(() => {
        validateUsername(username, profile?.id)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [username, validateUsername, profile?.id])

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: User },
    { id: 'username', title: 'Username', icon: UserCheck },
    { id: 'social', title: 'Social', icon: Github },
    { id: 'complete', title: 'Complete', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleUsernameSubmit = async () => {
    if (!isAvailable || validationError) {
      toast.error('Please choose a valid username')
      return
    }

    setIsUpdating(true)
    try {
      const success = await updateProfile({ username })
      if (success) {
        toast.success('Username saved!')
        setCurrentStep('social')
      } else {
        toast.error('Failed to save username')
      }
    } catch (error) {
      console.error('Username update error:', error)
      toast.error('Failed to save username')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSkipToComplete = () => {
    setCurrentStep('complete')
  }

  const handleFinishSetup = () => {
    toast.success('Welcome to SuiDentity!')
    router.push('/')
  }

  if (!authenticated || isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(203, 176, 255, 0.3)',
          borderTop: '3px solid #cbb0ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      {/* Fixed Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: '100%',
        maxWidth: '1200px',
        padding: '0 24px'
      }}>
        <div style={{
          backgroundColor: 'rgba(20, 20, 24, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(203, 176, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Left - Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogoIcon />
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbb0ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>SuiDentity</span>
            </div>
            
            {/* Right - Back to Home */}
            <button 
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                color: '#9ca3af',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(156, 163, 175, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af'
                e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)'
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '120px', minHeight: '100vh', position: 'relative' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(ellipse at center top, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '16px',
              background: 'linear-gradient(180deg, #ffffff 0%, #cbb0ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              PROFILE SETUP
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#9ca3af',
              lineHeight: '1.6',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              Complete your Web3 identity profile and start building your reputation
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '24px',
              position: 'relative'
            }}>
              {/* Progress line */}
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                right: '24px',
                height: '2px',
                background: 'rgba(156, 163, 175, 0.3)',
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #cbb0ff 0%, #9333ea 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                
                return (
                  <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      background: isCompleted ? 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)' : 
                                 isCurrent ? 'rgba(20, 20, 24, 0.8)' : 'rgba(60, 60, 64, 0.8)',
                      border: isCurrent ? '2px solid #cbb0ff' : '2px solid rgba(156, 163, 175, 0.3)',
                      color: isCompleted ? '#ffffff' : isCurrent ? '#cbb0ff' : '#9ca3af',
                      backdropFilter: 'blur(12px)',
                      transition: 'all 0.3s ease'
                    }}>
                      <StepIcon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: isCurrent ? '#cbb0ff' : '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div style={{
            backgroundColor: 'rgba(20, 20, 24, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(203, 176, 255, 0.1)',
            borderRadius: '16px',
            padding: '48px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}>
            {currentStep === 'welcome' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Wallet style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: 'white'
                }}>
                  Your Web3 Journey Starts Here
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  marginBottom: '32px',
                  lineHeight: '1.6'
                }}>
                  Hi {privyUser?.google?.name || privyUser?.twitter?.name || 'there'}! 
                  Let's build your on-chain identity and reputation.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                    <span style={{ fontSize: '14px', color: 'white' }}>Wallet Connected</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                    <span style={{ fontSize: '14px', color: 'white' }}>Profile Created</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentStep('username')}
                  style={{
                    background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 32px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 24px rgba(203, 176, 255, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(203, 176, 255, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(203, 176, 255, 0.4)'
                  }}
                >
                  Let's Get Started →
                </button>
              </div>
            )}

            {currentStep === 'username' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: 'white'
                  }}>
                    Choose Your Username
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#9ca3af',
                    lineHeight: '1.6'
                  }}>
                    This will be your unique identifier on SuiDentity
                  </p>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      background: 'rgba(60, 60, 64, 0.8)',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#cbb0ff'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(203, 176, 255, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  {isChecking && (
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                      Checking availability...
                    </p>
                  )}
                  {validationError && (
                    <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>
                      {validationError}
                    </p>
                  )}
                  {isAvailable === true && !validationError && (
                    <p style={{ fontSize: '14px', color: '#22c55e', marginTop: '8px' }}>
                      ✓ Username is available
                    </p>
                  )}
                </div>

                <div style={{
                  background: 'rgba(60, 60, 64, 0.5)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '32px'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                    Username Requirements:
                  </h4>
                  <ul style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', paddingLeft: '20px' }}>
                    <li>3-20 characters long</li>
                    <li>Only letters, numbers, and underscores</li>
                    <li>Must be unique</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => setCurrentStep('welcome')}
                    style={{
                      background: 'transparent',
                      color: '#9ca3af',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleUsernameSubmit}
                    disabled={!isAvailable || !!validationError || isUpdating}
                    style={{
                      flex: 1,
                      background: !isAvailable || !!validationError || isUpdating ? 
                        'rgba(156, 163, 175, 0.3)' : 
                        'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: !isAvailable || !!validationError || isUpdating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: !isAvailable || !!validationError || isUpdating ? 0.5 : 1
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Continue →'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'social' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: 'white'
                  }}>
                    Connect Social Accounts
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#9ca3af',
                    lineHeight: '1.6'
                  }}>
                    Connect your social accounts to build your reputation score
                  </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  {/* GitHub Connection Card */}
                  <div style={{ marginBottom: '16px' }}>
                    <GitHubConnectionCard
                      userId={profile?.id || ''}
                      socialConnections={socialConnections}
                      onConnectionUpdate={refreshProfile}
                    />
                  </div>

                  {/* Twitter/X Connection */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(60, 60, 64, 0.5)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Twitter style={{ width: '24px', height: '24px', color: '#1DA1F2' }} />
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: 'white', margin: '0 0 4px 0' }}>
                          Twitter/X
                        </p>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                          {privyUser?.twitter ? 
                            `Connected as ${privyUser.twitter.name}` : 
                            'Connect your social presence'
                          }
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      background: privyUser?.twitter ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      border: `1px solid ${privyUser?.twitter ? 'rgba(34, 197, 94, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: privyUser?.twitter ? '#22c55e' : '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {privyUser?.twitter ? "Connected" : "Available in Privy"}
                    </div>
                  </div>

                  {/* LinkedIn Connection */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(60, 60, 64, 0.3)',
                    border: '1px solid rgba(156, 163, 175, 0.2)',
                    borderRadius: '8px',
                    opacity: 0.6,
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Linkedin style={{ width: '24px', height: '24px', color: '#0077B5' }} />
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: 'white', margin: '0 0 4px 0' }}>
                          LinkedIn
                        </p>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                          Coming soon in next update
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      background: 'rgba(156, 163, 175, 0.2)',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      Coming Soon
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '14px', color: '#93c5fd', margin: 0 }}>
                      💡 Connecting social accounts helps our AI calculate a more accurate reputation score
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => setCurrentStep('username')}
                    style={{
                      background: 'transparent',
                      color: '#9ca3af',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSkipToComplete}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#9ca3af',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.borderColor = 'rgba(203, 176, 255, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.3)'
                    }}
                  >
                    Skip for Now
                  </button>
                  <button 
                    onClick={() => setCurrentStep('complete')}
                    style={{
                      background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: 'white'
                }}>
                  Profile Setup Complete!
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  marginBottom: '32px',
                  lineHeight: '1.6'
                }}>
                  Your SuiDentity profile is ready. You can always add more social connections later.
                </p>
                
                <div style={{
                  background: 'rgba(60, 60, 64, 0.5)',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '32px'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                    Profile Completion: {profileCompletion}%
                  </h4>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(156, 163, 175, 0.3)',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${profileCompletion}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #cbb0ff 0%, #9333ea 100%)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                      <span style={{ fontSize: '14px', color: 'white' }}>Wallet Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                      <span style={{ fontSize: '14px', color: 'white' }}>Username Set</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {privyUser?.twitter ? 
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} /> :
                        <Circle style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      }
                      <span style={{ fontSize: '14px', color: 'white' }}>Social Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Circle style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                      <span style={{ fontSize: '14px', color: 'white' }}>Reputation Calculated</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleFinishSetup}
                  style={{
                    background: 'linear-gradient(135deg, #cbb0ff 0%, #9333ea 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 32px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 24px rgba(203, 176, 255, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(203, 176, 255, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(203, 176, 255, 0.4)'
                  }}
                >
                  Enter SuiDentity →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
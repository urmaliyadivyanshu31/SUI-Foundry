'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile, useUsernameValidator } from '@/hooks/useUserProfile'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

type SetupStep = 'welcome' | 'profile' | 'complete'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useZkLogin()
  const { profile, updateProfile, isLoading: isProfileLoading } = useUserProfile()
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
  const [username, setUsername] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Get wallet address from user
  const walletAddress = user?.walletAddress || user?.address

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

  // Validate username on change
  useEffect(() => {
    if (username && username.length >= 3) {
      const timer = setTimeout(() => {
        validateUsername(username, profile?.id)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [username, validateUsername, profile?.id])

  const handleProfileSubmit = async () => {
    if (!isAvailable || validationError || !username.trim()) {
      toast.error('Please complete all required fields')
      return
    }

    setIsUpdating(true)
    try {
      const success = await updateProfile({ 
        username: username.trim()
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Address copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
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
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '4px',
        height: '4px',
        background: '#c084fc',
        borderRadius: '50%',
        opacity: 0.6,
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '6px',
        height: '6px',
        background: '#9333ea',
        borderRadius: '50%',
        opacity: 0.4,
        animation: 'float 10s ease-in-out infinite reverse'
      }} />

      {/* Header */}
      <nav style={{
        position: 'relative',
        zIndex: 10,
        padding: '24px 60px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div 
            onClick={() => router.push('/')}
            style={{ 
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Abstract Geometric Logo */}
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
                border: '2px solid #c084fc',
                transform: 'rotate(45deg)'
              }} />
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
              <div style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                bottom: '10px',
                right: '10px',
                background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
              }} />
              <div style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                top: '6px',
                right: '6px',
                background: '#ffffff',
                borderRadius: '50%',
                opacity: 0.8
              }} />
            </div>
          </div>
          
          {/* Back to Landing */}
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)'
              e.currentTarget.style.color = '#c084fc'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
            }}
          >
            ← BACK TO HOME
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%'
        }}>
          {/* Step Indicator with Animation */}
          <div style={{
            marginBottom: '60px',
            position: 'relative'
          }}>
            {/* Glow Effect Behind Active Progress */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: currentStep === 'welcome' ? '0%' : currentStep === 'profile' ? '50%' : '100%',
              height: '1px',
              background: '#c084fc',
              filter: 'blur(4px)',
              opacity: 0.6,
              zIndex: 0,
              transition: 'width 0.5s ease'
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative'
            }}>
              {/* Progress Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                right: '0',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0
              }} />
              
              {/* Active Progress Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                width: currentStep === 'welcome' ? '0%' : currentStep === 'profile' ? '50%' : '100%',
                height: '1px',
                background: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)',
                zIndex: 1,
                transition: 'width 0.5s ease',
                boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
              }} />
              
              {/* Step Nodes */}
              {['INITIALIZE', 'CONFIGURE', 'ACTIVATE'].map((label, index) => {
                const isActive = 
                  (currentStep === 'welcome' && index === 0) ||
                  (currentStep === 'profile' && index <= 1) ||
                  (currentStep === 'complete' && index <= 2)
                const isCurrent = 
                  (currentStep === 'welcome' && index === 0) ||
                  (currentStep === 'profile' && index === 1) ||
                  (currentStep === 'complete' && index === 2)
                
                return (
                  <div key={label} style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* Node with Pulse Animation */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#0a0a0a',
                      border: `2px solid ${isActive ? '#c084fc' : 'rgba(255, 255, 255, 0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transform: 'rotate(45deg)',
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrent ? '0 0 20px rgba(147, 51, 234, 0.5)' : 'none'
                    }}>
                      <div style={{
                        width: isCurrent ? '12px' : '0px',
                        height: isCurrent ? '12px' : '0px',
                        background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                        transition: 'all 0.3s ease',
                        animation: isCurrent ? 'pulse 2s infinite' : 'none'
                      }} />
                    </div>
                    
                    {/* Label */}
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      position: 'absolute',
                      top: '48px',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.3s ease'
                    }}>
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'relative'
            }}
          >
            {/* Corner Brackets with Glow */}
            <div style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(147, 51, 234, 0.5)',
              borderLeft: '1px solid rgba(147, 51, 234, 0.5)',
              filter: 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.3))'
            }} />
            <div style={{
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(147, 51, 234, 0.5)',
              borderRight: '1px solid rgba(147, 51, 234, 0.5)',
              filter: 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.3))'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: '-1px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(147, 51, 234, 0.5)',
              borderLeft: '1px solid rgba(147, 51, 234, 0.5)',
              filter: 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.3))'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '20px',
              height: '20px',
              borderBottom: '1px solid rgba(147, 51, 234, 0.5)',
              borderRight: '1px solid rgba(147, 51, 234, 0.5)',
              filter: 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.3))'
            }} />
            
            {/* Content Container */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}>
              {currentStep === 'welcome' && (
                <div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(147, 51, 234, 0.2)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      padding: '8px 16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#c084fc',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '32px'
                    }}
                  >
                    INITIALIZATION PHASE
                  </motion.div>
                  
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(147, 51, 234, 0.3)'
                  }}>
                    WELCOME TO SUIDENTITY
                  </h2>

                  {/* Wallet Status Card */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: walletAddress 
                        ? '1px solid rgba(34, 197, 94, 0.3)' 
                        : '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '24px',
                      margin: '32px auto',
                      maxWidth: '400px',
                      position: 'relative',
                      borderRadius: '4px'
                    }}
                  >
                    {/* Status Corner Indicators */}
                    <div style={{
                      position: 'absolute',
                      top: '-1px',
                      left: '-1px',
                      width: '12px',
                      height: '12px',
                      borderTop: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`,
                      borderLeft: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '-1px',
                      width: '12px',
                      height: '12px',
                      borderTop: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`,
                      borderRight: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '-1px',
                      width: '12px',
                      height: '12px',
                      borderBottom: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`,
                      borderLeft: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '12px',
                      height: '12px',
                      borderBottom: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`,
                      borderRight: `2px solid ${walletAddress ? '#22c55e' : '#ef4444'}`
                    }} />
                    
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: walletAddress ? '#22c55e' : '#ef4444',
                      marginBottom: '12px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: walletAddress ? '#22c55e' : '#ef4444',
                        animation: walletAddress ? 'pulse 2s infinite' : 'none'
                      }} />
                      {walletAddress ? 'WALLET CONNECTED' : 'WALLET NOT CONNECTED'}
                    </div>
                    {walletAddress && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontFamily: 'monospace'
                        }}>
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(walletAddress)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)'
                            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C8 3.89543 8.89543 3 10 3H12C13.1046 3 14 3.89543 14 5M14 5H16C17.1046 5 18 5.89543 18 7V10" stroke={copied ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </motion.div>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.6',
                    marginBottom: '40px',
                    maxWidth: '400px',
                    margin: '0 auto 40px'
                  }}>
                    {walletAddress 
                      ? 'Your Sui wallet has been successfully connected. Proceed to configure your identity profile.'
                      : 'Connect your wallet to initialize the profile setup process.'
                    }
                  </p>
                  
                  <button
                    onClick={() => walletAddress && setCurrentStep('profile')}
                    disabled={!walletAddress}
                    style={{
                      background: walletAddress 
                        ? 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      borderRadius: '0px',
                      padding: '14px 32px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: walletAddress ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      cursor: walletAddress ? 'pointer' : 'not-allowed',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (walletAddress) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(147, 51, 234, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (walletAddress) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    INITIALIZE PROFILE →
                  </button>
                </div>
              )}

              {currentStep === 'profile' && (
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(147, 51, 234, 0.2)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      padding: '8px 16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#c084fc',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '32px'
                    }}
                  >
                    CONFIGURATION PHASE
                  </motion.div>
                  
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(147, 51, 234, 0.3)'
                  }}>
                    CONFIGURE IDENTITY
                  </h2>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '40px'
                  }}>
                    Define your unique identifier on the Sui network.
                  </p>
                  
                  <div style={{ 
                    textAlign: 'left', 
                    maxWidth: '400px', 
                    margin: '0 auto' 
                  }}>
                    <div style={{ marginBottom: '32px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: '12px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                      }}>
                        USERNAME IDENTIFIER
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="Enter username"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0px',
                            padding: '14px 16px',
                            color: 'white',
                            fontSize: '14px',
                            width: '100%',
                            outline: 'none',
                            fontFamily: 'monospace',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(147, 51, 234, 0.5)'
                            e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)'
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
                          }}
                        />
                        
                        {/* Corner Accent */}
                        <div style={{
                          position: 'absolute',
                          top: '-1px',
                          left: '-1px',
                          width: '8px',
                          height: '8px',
                          borderTop: '2px solid #c084fc',
                          borderLeft: '2px solid #c084fc'
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '8px',
                          height: '8px',
                          borderBottom: '2px solid #c084fc',
                          borderRight: '2px solid #c084fc'
                        }} />
                      </div>
                      
                      {username && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ 
                            marginTop: '12px', 
                            fontSize: '11px',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {isValidating ? (
                            <span style={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '4px',
                                height: '4px',
                                background: 'rgba(255, 255, 255, 0.5)',
                                borderRadius: '50%',
                                animation: 'pulse 1s infinite'
                              }} />
                              VALIDATING...
                            </span>
                          ) : validationError ? (
                            <span style={{ color: '#ef4444' }}>
                              {validationError.toUpperCase()}
                            </span>
                          ) : isAvailable ? (
                            <span style={{ 
                              color: '#22c55e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '4px',
                                height: '4px',
                                background: '#22c55e',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                              }} />
                              IDENTIFIER AVAILABLE
                            </span>
                          ) : username.length >= 3 ? (
                            <span style={{ color: '#ef4444' }}>
                              IDENTIFIER UNAVAILABLE
                            </span>
                          ) : null}
                        </motion.div>
                      )}
                    </div>

                    <button
                      onClick={handleProfileSubmit}
                      disabled={!isAvailable || !!validationError || !username.trim() || isUpdating}
                      style={{
                        background: (!isAvailable || validationError || !username.trim()) 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                        border: 'none',
                        borderRadius: '0px',
                        padding: '14px 32px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: (!isAvailable || validationError || !username.trim()) 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : 'white',
                        cursor: (!isAvailable || validationError || !username.trim()) 
                          ? 'not-allowed' 
                          : 'pointer',
                        width: '100%',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease',
                        opacity: isUpdating ? 0.7 : 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (isAvailable && !validationError && username.trim()) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(147, 51, 234, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {isUpdating ? 'CONFIGURING...' : 'CONFIRM CONFIGURATION →'}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'complete' && (
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      display: 'inline-block',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '8px 16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#22c55e',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '32px'
                    }}
                  >
                    ACTIVATION COMPLETE
                  </motion.div>
                  
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '24px',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
                  }}>
                    PROFILE ACTIVATED
                  </h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '24px',
                      marginBottom: '32px',
                      position: 'relative',
                      borderRadius: '4px'
                    }}
                  >
                    {/* Success Indicator Corners */}
                    <div style={{
                      position: 'absolute',
                      top: '-1px',
                      left: '-1px',
                      width: '12px',
                      height: '12px',
                      borderTop: '2px solid #22c55e',
                      borderLeft: '2px solid #22c55e'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '-1px',
                      width: '12px',
                      height: '12px',
                      borderTop: '2px solid #22c55e',
                      borderRight: '2px solid #22c55e'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '-1px',
                      width: '12px',
                      height: '12px',
                      borderBottom: '2px solid #22c55e',
                      borderLeft: '2px solid #22c55e'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '12px',
                      height: '12px',
                      borderBottom: '2px solid #22c55e',
                      borderRight: '2px solid #22c55e'
                    }} />
                    
                    <div style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        animation: 'pulse 2s infinite'
                      }} />
                      USERNAME: <span style={{ color: '#22c55e', fontFamily: 'monospace' }}>@{username}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontFamily: 'monospace'
                      }}>
                        {walletAddress}
                      </div>
                      <button
                        onClick={() => copyToClipboard(walletAddress || '')}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)'
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5C8 6.10457 8.89543 7 10 7H12C13.1046 7 14 6.10457 14 5M8 5C8 3.89543 8.89543 3 10 3H12C13.1046 3 14 3.89543 14 5M14 5H16C17.1046 5 18 5.89543 18 7V10" stroke={copied ? '#22c55e' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                  
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.6',
                    marginBottom: '40px',
                    maxWidth: '400px',
                    margin: '0 auto 40px'
                  }}>
                    Your SuiDentity profile has been successfully activated. 
                    Access the dashboard to manage your identity and reputation.
                  </p>
                  
                  <button
                    onClick={handleComplete}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                      border: 'none',
                      borderRadius: '0px',
                      padding: '14px 32px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      cursor: 'pointer',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    ACCESS DASHBOARD →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
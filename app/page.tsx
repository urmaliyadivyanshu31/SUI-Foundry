'use client'

import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useEffect } from 'react'
import { ConnectButton } from '@mysten/dapp-kit'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Shield, Brain, Globe, Users, Zap, LogOut } from 'lucide-react'
import { Globe as GlobeComponent } from '@/components/ui/globe'

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

export default function LandingPage() {
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const router = useRouter()

  // No automatic redirects - let users navigate manually using the buttons
  // This allows them to see the landing page and choose when to go to dashboard

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation Header */}
      <div style={{
        position: 'fixed',
        top: '30px',
        left: '60px',
        right: '60px',
        zIndex: 50,
      }}>
        {/* Corner Brackets */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
        }} />
        
        {/* Glass Navigation Container */}
        <nav style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0px',
          padding: '12px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left - Logo */}
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
            {/* Abstract Geometric Logo - No Animation */}
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
                width: '8px',
                height: '8px',
                bottom: '10px',
                right: '10px',
                background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
              }} />
              
              {/* Static dot */}
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

          {/* Center - Navigation Menu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }}>
            <a 
              href="#hero" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c084fc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              HOME
            </a>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>•</span>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c084fc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              FEATURES
            </a>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>•</span>
            <a 
              href="#usecases" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('usecases')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c084fc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              USE CASES
            </a>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>•</span>
            <a 
              href="#contact" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c084fc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              CONTACT
            </a>
          </div>

          {/* Right - Auth Section */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* User Info */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
                  {profile?.username ? `@${profile.username}` : 'Setting up...'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {(user.walletAddress || user.address)?.slice(0, 6)}...{(user.walletAddress || user.address)?.slice(-4)}
                </div>
              </div>
              
              {/* Go to Dashboard Button */}
              {profile?.username && (
                <Button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Dashboard
                </Button>
              )}
              
              {/* Profile Setup Button if no username */}
              {!profile?.username && (
                <Button
                  onClick={() => router.push('/profile/setup')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          ) : (
            <button
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0px',
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
              }}
            >
              GET STARTED →
            </button>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <main id="hero" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 60px 60px 60px',
        position: 'relative',
        minHeight: '100vh'
      }}>
        {/* Background Grid Network */}
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

        {/* Floating geometric elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '8px',
          height: '8px',
          background: '#c084fc',
          transform: 'rotate(45deg)',
          opacity: 0.6
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          width: '12px',
          height: '12px',
          border: '1px solid #9333ea',
          transform: 'rotate(45deg)',
          opacity: 0.4
        }} />
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '20%',
          width: '6px',
          height: '6px',
          background: '#ffffff',
          borderRadius: '50%',
          opacity: 0.3
        }} />

        {/* Content Container */}
        <div style={{
          maxWidth: '1400px',
          width: '100%',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 500px',
            gap: '60px',
            alignItems: 'center'
          }}>
            {/* Left - Hero Content */}
            <div>
              {/* Protocol Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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
                SUIDENTITY PROTOCOL
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{
                  fontSize: 'clamp(48px, 5vw, 72px)',
                  fontWeight: '700',
                  lineHeight: '1.1',
                  marginBottom: '32px',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase'
                }}
              >
                AI-POWERED
                <br />
                IDENTITY
                <br />
                LAYER FOR SUI
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{
                  marginBottom: '48px'
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    position: 'relative',
                    padding: '8px 0'
                  }}>
                    {/* Left bracket */}
                    <span style={{
                      position: 'absolute',
                      left: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(147, 51, 234, 0.6)',
                      fontSize: '14px',
                      fontWeight: '300'
                    }}>[</span>
                    
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'rgba(255, 255, 255, 0.7)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}>
                      ONCHAIN + OFFCHAIN REPUTATION AGGREGATION
                    </span>
                    
                    {/* Right bracket */}
                    <span style={{
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(147, 51, 234, 0.6)',
                      fontSize: '14px',
                      fontWeight: '300'
                    }}>]</span>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.6',
                  maxWidth: '520px'
                }}>
                  BUILD YOUR DECENTRALIZED IDENTITY WITH AI-POWERED REPUTATION SCORING. 
                  CONNECT SOCIAL ACCOUNTS, VERIFY SKILLS, AND UNLOCK WEB3 OPPORTUNITIES
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}
              >
                {isAuthenticated && user ? (
                  <>
                    {profile?.username ? (
                      <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                          background: '#c084fc',
                          border: 'none',
                          borderRadius: '0px',
                          padding: '16px 32px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#000',
                          cursor: 'pointer',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        DASHBOARD →
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/profile/setup')}
                        style={{
                          background: '#c084fc',
                          border: 'none',
                          borderRadius: '0px',
                          padding: '16px 32px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#000',
                          cursor: 'pointer',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        COMPLETE SETUP →
                      </button>
                    )}
                  </>
                ) : (
                  <ConnectButton 
                    style={{
                      background: '#c084fc',
                      border: 'none',
                      borderRadius: '0px',
                      padding: '16px 32px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#000',
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  />
                )}
                
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0px',
                    padding: '16px 32px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📄 DOCUMENTATION
                </button>
              </motion.div>

            </div>

            {/* Right - Beautiful Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{
                position: 'relative',
                height: '500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Globe Container */}
              <div style={{
                position: 'relative',
                width: '700px',
                height: '700px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '80px'
              }}>
                
                {/* Outer Boundary Ring - Contains all effects */}
                <div style={{
                  position: 'absolute',
                  width: '580px',
                  height: '580px',
                  border: '2px solid rgba(147, 51, 234, 0.4)',
                  borderRadius: '50%',
                  animation: 'outerRing 25s linear infinite',
                  zIndex: 1
                }} />
                
                {/* Inner Boundary Ring */}
                <div style={{
                  position: 'absolute',
                  width: '540px',
                  height: '540px',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  borderRadius: '50%',
                  animation: 'innerRing 35s linear infinite reverse',
                  zIndex: 1
                }} />

                {/* Vertical Rings - Simple 2 ring system like horizontal ones */}
                <div style={{
                  position: 'absolute',
                  width: '580px',
                  height: '580px',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}>
                  {/* Vertical Outer Ring */}
                  <div style={{
                    position: 'absolute',
                    width: '580px',
                    height: '580px',
                    border: '2px solid rgba(147, 51, 234, 0.4)',
                    borderRadius: '50%',
                    transform: 'rotateY(90deg)',
                    animation: 'verticalOuterRing 30s linear infinite',
                    left: '0',
                    top: '0'
                  }} />
                  
                  {/* Vertical Inner Ring */}
                  <div style={{
                    position: 'absolute',
                    width: '540px',
                    height: '540px',
                    border: '1px solid rgba(192, 132, 252, 0.3)',
                    borderRadius: '50%',
                    transform: 'rotateY(90deg)',
                    animation: 'verticalInnerRing 40s linear infinite reverse',
                    left: '20px',
                    top: '20px'
                  }} />
                </div>

                {/* Collision Burst Effects */}
                <div style={{
                  position: 'absolute',
                  width: '500px',
                  height: '500px',
                  zIndex: 6,
                  pointerEvents: 'none'
                }}>
                  {/* Burst 1 */}
                  <div style={{
                    position: 'absolute',
                    width: '30px',
                    height: '30px',
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 100%)',
                    borderRadius: '50%',
                    top: '25%',
                    left: '35%',
                    animation: 'collisionBurst1 4s ease-out infinite',
                    opacity: 0
                  }} />
                  
                  {/* Burst 2 */}
                  <div style={{
                    position: 'absolute',
                    width: '25px',
                    height: '25px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                    borderRadius: '50%',
                    top: '60%',
                    right: '25%',
                    animation: 'collisionBurst2 3.5s ease-out infinite',
                    opacity: 0
                  }} />
                  
                  {/* Burst 3 */}
                  <div style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.8) 0%, rgba(192, 132, 252, 0.2) 50%, transparent 100%)',
                    borderRadius: '50%',
                    bottom: '30%',
                    left: '20%',
                    animation: 'collisionBurst3 5s ease-out infinite',
                    opacity: 0
                  }} />
                </div>

                {/* Intense Pulsing Glow Effect */}
                <div style={{
                  position: 'absolute',
                  width: '520px',
                  height: '520px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(192, 132, 252, 0.05) 70%, transparent 100%)',
                  animation: 'intensePulse 3s ease-in-out infinite',
                  zIndex: 0
                }} />

                <div style={{ 
                  width: '500px', 
                  height: '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 10
                }}>
                  <GlobeComponent />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 60px',
        position: 'relative'
      }}>
        {/* Corner Brackets */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '40px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }} />

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: 'center',
              marginBottom: '80px'
            }}
          >
            <div style={{
              display: 'inline-block',
              background: 'rgba(147, 51, 234, 0.2)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#c084fc',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              WHY SUIDENTITY PROTOCOL?
            </div>
            
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              AI REPUTATION IS FRAGMENTED—SUIDENTITY MAKES IT
              <br />
              FRICTIONLESS
            </h2>
          </motion.div>

          {/* Features Grid - Exact Reference Design */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px'
          }}>
            {[
              {
                number: 1,
                title: 'FRAGMENTED IDENTITY ACROSS CHAINS AND NETWORKS',
                description: 'Users struggle to maintain consistent identity verification across multiple blockchain networks and traditional platforms.',
              },
              {
                number: 2,
                title: 'PAINFUL AND MANUAL REPUTATION BUILDING',
                description: 'Each platform requires separate reputation building with no cross-platform recognition or aggregation.',
              },
              {
                number: 3,
                title: 'ISOLATED VERIFICATION SYSTEMS',
                description: 'No unified system exists to verify and aggregate achievements across different platforms and networks.',
              },
              {
                number: 4,
                title: 'LACK OF AI-POWERED ANALYSIS',
                description: 'Current systems rely on basic metrics without intelligent analysis of user behavior and contributions.',
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15
                }}
                style={{
                  position: 'relative',
                  background: 'rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '32px 24px',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Corner Brackets */}
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '-1px',
                  width: '20px',
                  height: '20px',
                  borderTop: '2px solid rgba(147, 51, 234, 0.6)',
                  borderLeft: '2px solid rgba(147, 51, 234, 0.6)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  width: '20px',
                  height: '20px',
                  borderTop: '2px solid rgba(147, 51, 234, 0.6)',
                  borderRight: '2px solid rgba(147, 51, 234, 0.6)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '-1px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '2px solid rgba(147, 51, 234, 0.6)',
                  borderLeft: '2px solid rgba(147, 51, 234, 0.6)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '20px',
                  height: '20px',
                  borderBottom: '2px solid rgba(147, 51, 234, 0.6)',
                  borderRight: '2px solid rgba(147, 51, 234, 0.6)',
                }} />

                {/* Problem Label */}
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(147, 51, 234, 0.2)',
                  border: '1px solid rgba(147, 51, 234, 0.4)',
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#c084fc',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                  alignSelf: 'flex-start'
                }}>
                  → PROBLEM {problem.number}
                </div>


                {/* Text Content */}
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    {problem.title}
                  </h3>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5',
                    fontSize: '13px'
                  }}>
                    {problem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="usecases" style={{
        padding: '100px 60px',
        position: 'relative'
      }}>
        {/* Corner Brackets */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '40px',
          width: '20px',
          height: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          width: '20px',
          height: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        }} />

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              textAlign: 'center',
              marginBottom: '80px'
            }}
          >
            <div style={{
              display: 'inline-block',
              background: 'rgba(147, 51, 234, 0.2)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#c084fc',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              USE CASES
            </div>
            
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              FOUR PRACTICAL APPLICATION SCENARIOS
            </h2>
          </motion.div>

          {/* Use Cases Grid - Pure Floating Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '60px',
            padding: '0',
            position: 'relative'
          }}>
            {[
              {
                title: 'DAPP INTEGRATION',
                description: 'One-click multichain actions, making onboarding seamless.'
              },
              {
                title: 'WALLET INTEGRATION',
                description: 'one API to access every chain and every dapp'
              },
              {
                title: 'AUTOMATED DEFI STRATEGIES',
                description: 'Auto lending, staking, portfolio rebalancing.'
              },
              {
                title: 'SEAMLESS CROSS-CHAIN LIQUIDITY',
                description: 'Atomic bridging and optimized swaps.'
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  const imgEl = e.currentTarget.querySelector('img') as HTMLElement
                  if (imgEl) {
                    imgEl.style.filter = 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.6)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.4))'
                  }
                }}
                onMouseLeave={(e) => {
                  const imgEl = e.currentTarget.querySelector('img') as HTMLElement
                  if (imgEl) {
                    imgEl.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.1))'
                  }
                }}
              >

                {/* Image with Glow Effect */}
                <div 
                  className="use-case-image"
                  style={{
                    width: '100%',
                    height: '350px',
                    marginBottom: '32px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={index === 0 
                      ? '/image.png'
                      : index === 1
                      ? '/image1.png'
                      : index === 2
                      ? '/image2.png'
                      : '/image3.png'}
                    alt={useCase.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.1))',
                      transition: 'all 0.4s ease'
                    }}
                  />
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  lineHeight: '1.2'
                }}>
                  {useCase.title}
                </h3>
                
                {/* Description */}
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5',
                  fontSize: '14px',
                  margin: 0
                }}>
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" style={{
        padding: '80px 60px 60px 60px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
        position: 'relative'
      }}>
        {/* Background Grid Network */}
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

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '60px',
            alignItems: 'flex-start'
          }}>
            {/* Left - Brand & Description */}
            <div style={{
              flex: '1',
              maxWidth: '400px'
            }}>
              <div style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace'
                }}>
                  SUIDENTITY
                </div>
                <div style={{
                  width: '40px',
                  height: '1px',
                  background: 'rgba(147, 51, 234, 0.5)'
                }} />
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(147, 51, 234, 0.8)',
                  letterSpacing: '0.1em',
                  fontWeight: '600'
                }}>
                  PROTOCOL
                </div>
              </div>
              
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}>
                The definitive AI-powered identity and reputation layer for Sui network. Connect your digital identity across platforms and unlock Web3 opportunities.
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  TESTNET ALPHA
                </div>
                
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
              </div>
            </div>

            {/* Right - Built By Section */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#c084fc',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                BUILT BY
              </div>
              
              {/* Team Grid */}
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                {[
                  { name: 'Unati', twitter: 'https://x.com/UnatiSingh', image: '/image copy 4.png' },
                  { name: 'Vattyy', twitter: 'https://x.com/_Vattyy', image: '/image copy 3.png' },
                  { name: 'Divyanshu', twitter: 'https://x.com/Divyanshueth', image: '/image copy 2.png' },
                  { name: 'Aasha', twitter: 'https://x.com/aashatwt', image: '/image copy.png' }
                ].map((member, i) => (
                  <a
                    key={i}
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      position: 'relative',
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      background: 'rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(147, 51, 234, 0.5)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {/* Profile Image */}
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Dark overlay for better visibility */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.6) 100%)',
                      pointerEvents: 'none'
                    }} />
                    
                    {/* Name Label */}
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      right: '4px',
                      fontSize: '9px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {member.name}
                    </div>
                    
                    {/* Twitter Icon */}
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '14px',
                      height: '14px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.8
                    }}>
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          fill="rgba(255, 255, 255, 0.9)"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>


          {/* Bottom Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.05em'
            }}>
              © 2024 SUIDENTITY PROTOCOL • BUILT ON SUI • POWERED BY AI
            </div>
            
            <div style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'center'
            }}>
              <a href="#" style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                TERMS
              </a>
              <a href="#" style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                PRIVACY
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes rotate {
          from {
            transform: rotateZ(0deg);
          }
          to {
            transform: rotateZ(360deg);
          }
        }
        
        @keyframes flare {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes flareMove {
          0% {
            transform: translate(-50%, -100%) scale(0);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -100%) scale(1);
            opacity: 1;
          }
          80% {
            transform: translate(-50%, -300px) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -400px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes ringPulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Dramatic Globe Animation System */
        
        /* Boundary Rings */
        @keyframes outerRing {
          0% {
            transform: rotate(0deg);
            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.6));
          }
          100% {
            transform: rotate(360deg);
            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
          }
        }

        @keyframes innerRing {
          0% {
            transform: rotate(0deg);
            filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.5));
          }
          100% {
            transform: rotate(360deg);
            filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.3));
          }
        }

        /* Simple Vertical Rings - Just like horizontal rings but vertical */
        @keyframes verticalOuterRing {
          0% {
            transform: rotateY(90deg) rotateZ(0deg);
            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.6));
          }
          100% {
            transform: rotateY(90deg) rotateZ(360deg);
            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4));
          }
        }

        @keyframes verticalInnerRing {
          0% {
            transform: rotateY(90deg) rotateZ(0deg);
            filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.5));
          }
          100% {
            transform: rotateY(90deg) rotateZ(360deg);
            filter: drop-shadow(0 0 6px rgba(192, 132, 252, 0.3));
          }
        }

        /* Collision Burst Effects */
        @keyframes collisionBurst1 {
          0%, 60% {
            opacity: 0;
            transform: scale(0);
          }
          65% {
            opacity: 0.8;
            transform: scale(0.5);
          }
          75% {
            opacity: 1;
            transform: scale(1.5);
          }
          85% {
            opacity: 0.6;
            transform: scale(2);
          }
          100% {
            opacity: 0;
            transform: scale(3);
          }
        }

        @keyframes collisionBurst2 {
          0%, 40% {
            opacity: 0;
            transform: scale(0);
          }
          45% {
            opacity: 0.9;
            transform: scale(0.3);
          }
          55% {
            opacity: 1;
            transform: scale(1.2);
          }
          70% {
            opacity: 0.4;
            transform: scale(2.5);
          }
          100% {
            opacity: 0;
            transform: scale(4);
          }
        }

        @keyframes collisionBurst3 {
          0%, 75% {
            opacity: 0;
            transform: scale(0);
          }
          80% {
            opacity: 0.7;
            transform: scale(0.4);
          }
          90% {
            opacity: 1;
            transform: scale(1.8);
          }
          95% {
            opacity: 0.5;
            transform: scale(2.2);
          }
          100% {
            opacity: 0;
            transform: scale(3.5);
          }
        }

        /* Intense Pulsing Glow Effect */
        @keyframes intensePulse {
          0% {
            transform: scale(1);
            opacity: 0.15;
            filter: blur(0px);
          }
          50% {
            transform: scale(1.1);
            opacity: 0.25;
            filter: blur(2px);
          }
          100% {
            transform: scale(1);
            opacity: 0.15;
            filter: blur(0px);
          }
        }
      `}</style>
    </div>
  )
}
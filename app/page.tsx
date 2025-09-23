'use client'

import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useEffect } from 'react'
import { ConnectButton } from '@mysten/dapp-kit'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Shield, Brain, Globe, Users, Zap } from 'lucide-react'
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
  const { user, isAuthenticated, isLoading } = useZkLogin()
  const router = useRouter()

  // Redirect authenticated users to profile setup
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/profile/setup')
    }
  }, [isAuthenticated, user, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation Header */}
      <nav style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: '0',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left - Logo */}
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

          {/* Right - Connect Button */}
          <ConnectButton 
            style={{
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px',
        position: 'relative'
      }}>
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(ellipse at center top, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        {/* Content Container */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '80px',
            alignItems: 'center'
          }}>
            {/* Left - Hero Content */}
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  fontSize: '64px',
                  fontWeight: '800',
                  lineHeight: '1.1',
                  marginBottom: '24px',
                  background: 'linear-gradient(180deg, #ffffff 0%, #cbb0ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Your Identity,
                <br />
                <span style={{ color: '#9333ea' }}>AI-Powered</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  fontSize: '20px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  marginBottom: '40px',
                  maxWidth: '480px'
                }}
              >
                Build your decentralized identity with AI-powered reputation scoring. 
                Connect your social accounts, showcase your skills, and unlock Web3 opportunities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ marginBottom: '48px' }}
              >
                <ConnectButton 
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Sparkles size={20} />
                  Get Started with Google
                </ConnectButton>
              </motion.div>

              {/* Feature Points */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{
                  display: 'flex',
                  gap: '32px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} style={{ color: '#34d399' }} />
                  <span style={{ fontSize: '14px', color: '#d1d5db' }}>Secure zkLogin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '14px', color: '#d1d5db' }}>AI Reputation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '14px', color: '#d1d5db' }}>Web3 Native</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Interactive Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '500px'
              }}
            >
              <GlobeComponent />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section style={{
        padding: '80px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: '32px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '48px',
              color: '#ffffff'
            }}
          >
            Build Your Digital Identity
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: Shield,
                title: 'Secure Authentication',
                description: 'Login with Google using Sui zkLogin technology. No seed phrases, no wallet setup.'
              },
              {
                icon: Brain,
                title: 'AI-Powered Reputation',
                description: 'Our AI analyzes your activity to build a comprehensive reputation score.'
              },
              {
                icon: Users,
                title: 'Social Connections',
                description: 'Connect GitHub, Twitter, and other platforms to enrich your profile.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px'
                }}>
                  <CardContent style={{ padding: '32px' }}>
                    <feature.icon size={32} style={{ 
                      color: '#9333ea',
                      marginBottom: '16px'
                    }} />
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '12px'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: '#9ca3af',
                      lineHeight: '1.6'
                    }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#6b7280'
      }}>
        <p style={{ fontSize: '14px' }}>
          Built on Sui • Powered by AI • Secured by zkLogin
        </p>
      </footer>
    </div>
  )
}
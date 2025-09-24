'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import Head from 'next/head'
import Link from 'next/link'

export default function PortfolioPage() {
  const params = useParams()
  const username = params?.username as string

  const { data: portfolioData, isLoading, error, refetch } = usePortfolioData(username)

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Loading Portfolio...
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Fetching @{username}'s data
          </p>
        </div>
      </div>
    )
  }

  if (error || !portfolioData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Portfolio Not Found
          </h1>
          <p style={{ 
            color: '#9ca3af', 
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error || `Unable to find portfolio for @${username}`}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: '#9333ea',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '0px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const githubConnection = portfolioData.socialConnections.find(conn => conn.platform === 'github')

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    
    mainContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 60px'
    },

    section: {
      background: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      position: 'relative' as const
    },

    cornerBrackets: {
      position: 'absolute' as const,
      inset: '-2px',
      pointerEvents: 'none' as const
    }
  }

  const CornerBrackets = ({ size = 20, opacity = 0.3 }: { size?: number, opacity?: number }) => (
    <div style={styles.cornerBrackets}>
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

  return (
    <>
      <Head>
        <title>{`@${portfolioData.user.username} - SuiDentity Portfolio`}</title>
        <meta
          name="description"
          content={`Check out @${portfolioData.user.username}'s decentralized identity portfolio on SuiDentity. View their reputation score, NFT collection, and GitHub projects.`}
        />
        <meta property="og:title" content={`@${portfolioData.user.username} - SuiDentity Portfolio`} />
        <meta property="og:description" content={`Decentralized identity portfolio with reputation score: ${portfolioData.reputation.total_score}/850`} />
        <meta property="og:type" content="profile" />
        {portfolioData.user.profile_picture && (
          <meta property="og:image" content={portfolioData.user.profile_picture} />
        )}
      </Head>

      <div style={styles.pageContainer}>
        <div style={styles.mainContainer}>
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px'
            }}
          >
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                @{portfolioData.user.username}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#9ca3af'
              }}>
                DECENTRALIZED IDENTITY PORTFOLIO
              </p>
            </div>
            
            <Link
              href="/"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '0px',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              ← Back to Home
            </Link>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px'
          }}>
            {/* Profile Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                ...styles.section,
                padding: '24px 32px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <CornerBrackets size={16} opacity={0.3} />
              
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                Identity Profile
              </h2>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '0px',
                  background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  flexShrink: 0
                }}>
                  {(githubConnection?.profile_data?.avatar_url || portfolioData.user.profile_picture) ? (
                    <img 
                      src={githubConnection?.profile_data?.avatar_url || portfolioData.user.profile_picture} 
                      alt={portfolioData.user.username}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '0px'
                      }}
                    />
                  ) : (
                    portfolioData.user.username.charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                  }}>
                    WALLET ADDRESS
                  </div>
                  {portfolioData.user.wallet_address && (
                    <p 
                      style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(portfolioData.user.wallet_address!)
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                      }}
                      title="Click to copy address"
                    >
                      {portfolioData.user.wallet_address}
                    </p>
                  )}
                </div>

                <button
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '0px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Send Tip
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '20px' 
              }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    REPUTATION SCORE
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#9333ea',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.reputation.total_score}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    OUT OF 850
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    NFTs OWNED
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#c084fc',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.blockchain?.nftCount || portfolioData.nfts.length}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    DIGITAL ASSETS
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    REPOSITORIES
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#22c55e',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.githubStats?.public_repos || portfolioData.repositories.length}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    PUBLIC REPOS
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    TIPS RECEIVED
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#f59e0b',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.tipStats.tips_received_count}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    FROM SUPPORTERS
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Reputation Analysis */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                ...styles.section,
                padding: '24px 32px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <CornerBrackets size={16} opacity={0.3} />
              
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                Reputation Analysis
              </h2>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    DEVELOPER SCORE
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#9333ea',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.reputation.developer_score}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    OUT OF 100
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    SOCIAL SCORE
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#22c55e',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.reputation.social_score}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    OUT OF 100
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <CornerBrackets size={12} opacity={0.2} />
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px'
                  }}>
                    DEFI SCORE
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#f59e0b',
                    marginBottom: '4px'
                  }}>
                    {portfolioData.reputation.defi_score}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    OUT OF 100
                  </div>
                </div>
              </div>

              {portfolioData.reputation.ai_analysis?.careerRecommendations && portfolioData.reputation.ai_analysis.careerRecommendations.length > 0 && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                  }}>
                    AREAS FOR IMPROVEMENT
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {portfolioData.reputation.ai_analysis.careerRecommendations.slice(0, 6).map((recommendation, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          background: 'rgba(249, 115, 22, 0.1)',
                          border: '1px solid rgba(249, 115, 22, 0.3)',
                          borderRadius: '0px',
                          color: '#f97316',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          fontWeight: '600'
                        }}
                      >
                        {recommendation.replace(/^(improve|enhance|add|implement|focus on|work on)\s*/i, '').substring(0, 20)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>

            {/* Developer Profile */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                ...styles.section,
                padding: '24px 32px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <CornerBrackets size={16} opacity={0.3} />
              
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                Developer Profile
              </h2>

              {portfolioData.githubStats && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      PUBLIC REPOS
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {portfolioData.githubStats.public_repos}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      FOLLOWERS
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {portfolioData.githubStats.followers}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      FOLLOWING
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {portfolioData.githubStats.following}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      MEMBER SINCE
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {new Date(portfolioData.githubStats.created_at).getFullYear()}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                  fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                }}>
                  TOP REPOSITORIES
                </div>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {portfolioData.repositories.slice(0, 5).map((repo, index) => (
                    <div key={repo.id} style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'white',
                          marginBottom: '4px',
                          fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                        }}>
                          {repo.name}
                        </div>
                        {repo.description && (
                          <p style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            marginBottom: '8px'
                          }}>
                            {repo.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#9ca3af' }}>
                          {repo.language && <span>{repo.language}</span>}
                          <span>{repo.stargazers_count} stars</span>
                          <span>{repo.forks_count} forks</span>
                        </div>
                      </div>
                      
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        VIEW →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Digital Assets */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                ...styles.section,
                padding: '24px 32px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <CornerBrackets size={16} opacity={0.3} />
              
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                Digital Assets
              </h2>

              {/* Token Balances */}
              {portfolioData.blockchain && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {/* Mainnet Balance */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0px',
                    padding: '16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981'
                    }} />
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      TESTNET BALANCE
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#10b981'
                    }}>
                      {portfolioData.blockchain.balance || '0'} $SUI
                    </div>
                  </div>

                  {/* Testnet Balance */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '0px',
                    padding: '16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#f59e0b'
                    }} />
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                    }}>
                      MAINNET BALANCE
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#f59e0b'
                    }}>
                      0 $SUI
                    </div>
                  </div>
                </div>
              )}

              {/* NFTs Section */}
              {portfolioData.nfts.length > 0 ? (
                <div>
                  {/* Mainnet NFTs */}
                  {portfolioData.nfts.filter(nft => nft.network === 'mainnet').length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981'
                        }} />
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                        }}>
                          MAINNET NFTs ({portfolioData.nfts.filter(nft => nft.network === 'mainnet').length})
                        </div>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        {portfolioData.nfts.filter(nft => nft.network === 'mainnet').slice(0, 8).map((nft) => (
                          <div
                            key={nft.id}
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '0px',
                              padding: '8px',
                              aspectRatio: '1',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            {nft.image_url ? (
                              <img 
                                src={nft.image_url} 
                                alt={`${nft.name} NFT from ${nft.collection_name} collection`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '0px'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                color: 'rgba(16, 185, 129, 0.6)'
                              }}>
                                NFT
                              </div>
                            )}
                            
                            <div style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              right: '0',
                              background: 'rgba(16, 185, 129, 0.8)',
                              padding: '4px',
                              fontSize: '8px',
                              color: 'white',
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {nft.name || 'UNKNOWN'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testnet NFTs */}
                  {portfolioData.nfts.filter(nft => nft.network === 'testnet').length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#f59e0b'
                        }} />
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace'
                        }}>
                          TESTNET NFTs ({portfolioData.nfts.filter(nft => nft.network === 'testnet').length})
                        </div>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '12px'
                      }}>
                        {portfolioData.nfts.filter(nft => nft.network === 'testnet').slice(0, 8).map((nft) => (
                          <div
                            key={nft.id}
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '0px',
                              padding: '8px',
                              aspectRatio: '1',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            {nft.image_url ? (
                              <img 
                                src={nft.image_url} 
                                alt={`${nft.name} NFT from ${nft.collection_name} collection`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '0px'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                color: 'rgba(245, 158, 11, 0.6)'
                              }}>
                                NFT
                              </div>
                            )}
                            
                            <div style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              right: '0',
                              background: 'rgba(245, 158, 11, 0.8)',
                              padding: '4px',
                              fontSize: '8px',
                              color: 'white',
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {nft.name || 'UNKNOWN'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0px',
                  padding: '40px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    No NFTs Found
                  </div>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </>
  )
}
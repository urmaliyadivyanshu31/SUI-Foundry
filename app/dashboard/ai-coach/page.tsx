'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useZkLogin } from '@/lib/providers'
import { useUserProfile } from '@/hooks/useUserProfile'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Target, 
  Lightbulb,
  MessageSquare,
  Zap,
  Brain,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: string
}

interface Recommendation {
  type: string
  title: string
  description: string
  action: string
}

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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '100px 30px 60px 30px',
    position: 'relative',
    zIndex: 10,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  },

  pageHeader: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
  },

  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  chatContainer: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '20px',
    minHeight: 0
  },

  chatInterface: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    overflow: 'hidden'
  },

  chatHeader: {
    padding: '15px 20px',
    background: 'rgba(0, 255, 0, 0.1)',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  chatHeaderTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    minHeight: '400px',
    maxHeight: '500px'
  },

  messageGroup: {
    marginBottom: '20px'
  },

  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px'
  },

  userMessageBubble: {
    background: 'rgba(0, 153, 204, 0.2)',
    border: '1px solid rgba(0, 153, 204, 0.4)',
    padding: '12px 16px',
    maxWidth: '70%',
    fontSize: '12px',
    lineHeight: '1.5',
    position: 'relative' as const
  },

  aiMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '10px'
  },

  aiMessageBubble: {
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    padding: '12px 16px',
    maxWidth: '85%',
    fontSize: '12px',
    lineHeight: '1.5',
    position: 'relative' as const
  },

  messageTime: {
    fontSize: '9px',
    color: '#666666',
    marginTop: '5px'
  },

  inputContainer: {
    padding: '15px 20px',
    borderTop: '1px solid rgba(0, 255, 0, 0.2)',
    display: 'flex',
    gap: '10px'
  },

  messageInput: {
    flex: 1,
    padding: '12px 15px',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  sendButton: {
    padding: '12px 16px',
    background: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: '#00ff00',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease'
  },

  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },

  sidebarPanel: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    padding: '20px'
  },

  sidebarTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00ff00',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0, 255, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    background: 'rgba(0, 255, 0, 0.05)',
    border: '1px solid rgba(0, 255, 0, 0.2)',
    cursor: 'pointer',
    fontSize: '11px',
    color: '#00ff00',
    marginBottom: '8px',
    transition: 'all 0.2s ease'
  },

  recommendation: {
    padding: '12px',
    background: 'rgba(0, 153, 204, 0.1)',
    border: '1px solid rgba(0, 153, 204, 0.3)',
    marginBottom: '10px',
    fontSize: '11px',
    borderLeft: '3px solid #0099cc'
  },

  recommendationTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#0099cc',
    marginBottom: '5px'
  },

  recommendationDescription: {
    fontSize: '10px',
    color: '#cccccc',
    lineHeight: '1.4',
    marginBottom: '8px'
  },

  recommendationAction: {
    fontSize: '9px',
    color: '#00ff00',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },

  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '11px',
    color: '#666666',
    fontStyle: 'italic'
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

export default function AICoachPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useZkLogin()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

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

  // Initialize with welcome message
  useEffect(() => {
    if (profile && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello @${profile.username}! I'm your SuiDentity AI Coach. I'm here to help you climb the reputation leaderboard and land your dream Web3 job.\n\nYour current reputation score is ${profile.reputation_scores?.[0]?.total_score || 300}/850. What would you like to improve today?`,
        timestamp: new Date(),
        context: 'welcome'
      }
      setMessages([welcomeMessage])
    }
  }, [profile, messages.length])

  const sendMessage = async (messageText?: string, context?: string) => {
    const textToSend = messageText || currentMessage.trim()
    if (!textToSend || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      context
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          context: context || 'general'
        })
      })

      const result = await response.json()

      if (result.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          context: context || 'general'
        }

        setMessages(prev => [...prev, aiMessage])
        
        // Update recommendations if provided
        if (result.data.context?.recommendations) {
          setRecommendations(result.data.context.recommendations)
        }
      } else {
        console.error('AI response error:', result.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { text: "How can I improve my reputation score?", context: "reputation_improvement" },
    { text: "What jobs match my skills?", context: "job_search" },
    { text: "Which skills should I learn next?", context: "skill_development" },
    { text: "How do I get more social connections?", context: "social_growth" },
    { text: "Tips for getting hired faster?", context: "job_strategy" }
  ]

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
          LOADING_AI_COACH_INTERFACE...
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
          <h1 style={styles.pageTitle}>
            <Brain size={24} />
            ║█║ AI_CAREER_COACH ║█║
          </h1>
          <div style={{
            fontSize: '11px',
            color: '#0099cc',
            marginTop: '5px',
            fontFamily: '"Courier New", monospace'
          }}>
            PERSONALIZED_GUIDANCE // REPUTATION_OPTIMIZATION
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.chatContainer}
        >
          {/* Main Chat */}
          <div style={styles.chatInterface}>
            <div style={styles.chatHeader}>
              <Bot size={16} />
              <span style={styles.chatHeaderTitle}>
                SUIDENTITY_AI // ONLINE
              </span>
            </div>

            <div style={styles.messagesContainer}>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={styles.messageGroup}
                  >
                    {message.role === 'user' ? (
                      <div style={styles.userMessage}>
                        <div style={styles.userMessageBubble}>
                          {message.content}
                          <div style={styles.messageTime}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.aiMessage}>
                        <div style={styles.aiMessageBubble}>
                          {message.content}
                          <div style={styles.messageTime}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <div style={styles.typingIndicator}>
                  <Bot size={12} />
                  AI is thinking...
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ 
                      width: '4px', 
                      height: '4px', 
                      background: '#00ff00', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite' 
                    }} />
                    <div style={{ 
                      width: '4px', 
                      height: '4px', 
                      background: '#00ff00', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite 0.2s' 
                    }} />
                    <div style={{ 
                      width: '4px', 
                      height: '4px', 
                      background: '#00ff00', 
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite 0.4s' 
                    }} />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.inputContainer}>
              <input
                type="text"
                style={styles.messageInput}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ASK_YOUR_AI_COACH_ANYTHING..."
                disabled={isTyping}
              />
              <button
                style={{
                  ...styles.sendButton,
                  ...(isTyping || !currentMessage.trim() ? styles.sendButtonDisabled : {})
                }}
                onClick={() => sendMessage()}
                disabled={isTyping || !currentMessage.trim()}
                onMouseEnter={(e) => {
                  if (!isTyping && currentMessage.trim()) {
                    e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                }}
              >
                <Send size={14} />
                SEND
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Quick Actions */}
            <div style={styles.sidebarPanel}>
              <div style={styles.sidebarTitle}>
                <Zap size={14} />
                QUICK_ACTIONS
              </div>
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  style={styles.quickAction}
                  onClick={() => sendMessage(action.text, action.context)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 0, 0.05)'
                  }}
                >
                  <ArrowRight size={10} />
                  {action.text}
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div style={styles.sidebarPanel}>
                <div style={styles.sidebarTitle}>
                  <Sparkles size={14} />
                  RECOMMENDATIONS
                </div>
                {recommendations.map((rec, index) => (
                  <div key={index} style={styles.recommendation}>
                    <div style={styles.recommendationTitle}>
                      {rec.title}
                    </div>
                    <div style={styles.recommendationDescription}>
                      {rec.description}
                    </div>
                    <div style={styles.recommendationAction}>
                      → {rec.action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        input:focus {
          border-color: rgba(0, 255, 0, 0.6) !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3) !important;
        }
        
        input::placeholder {
          color: rgba(0, 255, 0, 0.4);
        }
        
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.3);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
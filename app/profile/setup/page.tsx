'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { useUserProfile, useUsernameValidator } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubConnectionCard } from '@/components/ui/github-connection-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, User, UserCheck, Wallet, Github, Twitter, Linkedin } from 'lucide-react'
import { toast } from 'sonner'

type SetupStep = 'welcome' | 'username' | 'social' | 'complete'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome to SuiDentity!
            </h1>
            <p className="text-muted-foreground text-lg">
              Let&apos;s set up your Web3 identity profile
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isCompleted ? 'bg-purple-600 text-white' : 
                        isCurrent ? 'bg-purple-100 text-purple-600 border-2 border-purple-600' : 
                        'bg-gray-100 text-gray-400'}
                    `}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm ${isCurrent ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {currentStep === 'welcome' && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="w-12 h-12 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Your Web3 Journey Starts Here</h2>
                    <p className="text-muted-foreground">
                      Hi {privyUser?.google?.name || privyUser?.twitter?.name || 'there'}! 
                      Let&apos;s build your on-chain identity and reputation.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span>Wallet Connected</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span>Profile Created</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setCurrentStep('username')}
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Let&apos;s Get Started
                  </Button>
                </div>
              )}

              {currentStep === 'username' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-3">Choose Your Username</h2>
                    <p className="text-muted-foreground">
                      This will be your unique identifier on SuiDentity
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="mt-2"
                      />
                      {isChecking && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Checking availability...
                        </p>
                      )}
                      {validationError && (
                        <p className="text-sm text-red-600 mt-2">
                          {validationError}
                        </p>
                      )}
                      {isAvailable === true && !validationError && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Username is available
                        </p>
                      )}
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Username Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 3-20 characters long</li>
                        <li>• Only letters, numbers, and underscores</li>
                        <li>• Must be unique</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('welcome')}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleUsernameSubmit}
                      disabled={!isAvailable || !!validationError || isUpdating}
                      className="bg-purple-600 hover:bg-purple-700 flex-1"
                    >
                      {isUpdating ? 'Saving...' : 'Continue'}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 'social' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-3">Connect Social Accounts</h2>
                    <p className="text-muted-foreground">
                      Connect your social accounts to build your reputation score
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* GitHub Connection Card */}
                    <GitHubConnectionCard
                      userId={profile?.id || ''}
                      socialConnections={socialConnections}
                      onConnectionUpdate={refreshProfile}
                    />

                    {/* Twitter/X Connection (from Privy) */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Twitter className="w-8 h-8" />
                        <div>
                          <p className="font-medium">Twitter/X</p>
                          <p className="text-sm text-muted-foreground">
                            {privyUser?.twitter ? 
                              `Connected as ${privyUser.twitter.name}` : 
                              'Connect your social presence'
                            }
                          </p>
                        </div>
                      </div>
                      <Badge variant={privyUser?.twitter ? "secondary" : "outline"}>
                        {privyUser?.twitter ? "Connected" : "Available in Privy"}
                      </Badge>
                    </div>

                    {/* LinkedIn Connection (Coming Soon) */}
                    <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                      <div className="flex items-center space-x-3">
                        <Linkedin className="w-8 h-8" />
                        <div>
                          <p className="font-medium">LinkedIn</p>
                          <p className="text-sm text-muted-foreground">Coming soon in next update</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Coming Soon
                      </Badge>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        💡 Connecting social accounts helps our AI calculate a more accurate reputation score
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('username')}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSkipToComplete}
                      className="flex-1"
                    >
                      Skip for Now
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('complete')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Profile Setup Complete!</h2>
                    <p className="text-muted-foreground">
                      Your SuiDentity profile is ready. You can always add more social connections later.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 p-6 rounded-lg">
                    <h4 className="font-medium mb-4">Profile Completion: {profileCompletion}%</h4>
                    <Progress value={profileCompletion} className="w-full mb-4" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Wallet Connected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Username Set</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {privyUser?.twitter ? 
                          <CheckCircle className="w-4 h-4 text-green-600" /> :
                          <Circle className="w-4 h-4 text-gray-400" />
                        }
                        <span>Social Connected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span>Reputation Calculated</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleFinishSetup}
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Enter SuiDentity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
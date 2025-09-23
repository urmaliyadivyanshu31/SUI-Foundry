'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useSuiWallet } from '@/hooks/useSuiWallet'
import { 
  Trophy, 
  Star,
  Users,
  Code,
  Wallet,
  CheckCircle,
  Lock,
  Zap,
  Target,
  Award,
  TrendingUp,
  Clock,
  Gift,
  Sparkles,
  ArrowRight
} from 'lucide-react'

// Mock quest data - this would come from your backend/smart contracts
const MOCK_QUESTS = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your profile setup by adding a username',
    type: 'onboarding',
    xpReward: 50,
    suiReward: 0,
    requirements: ['Complete profile', 'Add username'],
    isActive: true,
    progress: 80,
    completed: false,
    icon: Target
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Connect at least 1 social media account to verify your identity',
    type: 'social',
    xpReward: 100,
    suiReward: 0.01,
    requirements: ['Connect GitHub or Twitter'],
    isActive: true,
    progress: 100,
    completed: true,
    icon: Users
  },
  {
    id: 'github-developer',
    title: 'GitHub Developer',
    description: 'Connect your GitHub account and analyze your developer activity',
    type: 'github',
    xpReward: 150,
    suiReward: 0.02,
    requirements: ['Connect GitHub', 'Analyze repository activity'],
    isActive: true,
    progress: 50,
    completed: false,
    icon: Code
  },
  {
    id: 'reputation-builder',
    title: 'Reputation Builder',
    description: 'Achieve a reputation score of 400 or higher',
    type: 'reputation',
    xpReward: 200,
    suiReward: 0.05,
    requirements: ['Reputation score ≥ 400'],
    isActive: true,
    progress: 20,
    completed: false,
    icon: TrendingUp
  },
  {
    id: 'nft-pioneer',
    title: 'NFT Pioneer',
    description: 'Mint your first Identity NFT on the Sui blockchain',
    type: 'nft',
    xpReward: 250,
    suiReward: 0.1,
    requirements: ['Mint Identity NFT'],
    isActive: true,
    progress: 0,
    completed: false,
    icon: Trophy
  },
  {
    id: 'wallet-warrior',
    title: 'Wallet Warrior',
    description: 'Make your first SUI transaction through the platform',
    type: 'defi',
    xpReward: 100,
    suiReward: 0.02,
    requirements: ['Send SUI transaction'],
    isActive: true,
    progress: 0,
    completed: false,
    icon: Wallet
  }
]

// Mock user progress data
const MOCK_USER_PROGRESS = {
  totalXp: 250,
  level: 3,
  currentStreak: 2,
  longestStreak: 5,
  completedQuests: ['social-butterfly'],
  nextLevelXp: 400
}

interface QuestSystemProps {
  className?: string
}

export function QuestSystem({ className = '' }: QuestSystemProps) {
  const [quests, setQuests] = useState(MOCK_QUESTS)
  const [userProgress, setUserProgress] = useState(MOCK_USER_PROGRESS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'completed'>('all')

  const { profile } = useUserProfile()
  const { address } = useSuiWallet()

  // Filter quests based on active filter
  const filteredQuests = quests.filter(quest => {
    switch (activeFilter) {
      case 'available':
        return !quest.completed && quest.isActive
      case 'completed':
        return quest.completed
      default:
        return true
    }
  })

  // Calculate level progress
  const currentLevelXp = (userProgress.level - 1) * 150 // 150 XP per level after first
  const xpInCurrentLevel = userProgress.totalXp - currentLevelXp
  const xpForNextLevel = 150
  const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100

  const handleCompleteQuest = async (questId: string) => {
    setIsLoading(true)
    
    // Simulate quest completion
    setTimeout(() => {
      setQuests(prev => prev.map(quest => 
        quest.id === questId 
          ? { ...quest, completed: true, progress: 100 }
          : quest
      ))
      
      const quest = quests.find(q => q.id === questId)
      if (quest) {
        setUserProgress(prev => ({
          ...prev,
          totalXp: prev.totalXp + quest.xpReward,
          completedQuests: [...prev.completedQuests, questId]
        }))
      }
      
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Progress Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quest Progress
              </CardTitle>
              <CardDescription>
                Complete quests to earn XP and level up your reputation
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                Level {userProgress.level}
              </div>
              <div className="text-sm text-muted-foreground">
                {userProgress.totalXp} XP
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {userProgress.level} Progress</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {xpForNextLevel - xpInCurrentLevel} XP to next level
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {userProgress.completedQuests.length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {userProgress.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {userProgress.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest Filters */}
      <div className="flex gap-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All Quests
        </Button>
        <Button
          variant={activeFilter === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('available')}
        >
          Available
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {filteredQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={handleCompleteQuest}
            isLoading={isLoading}
          />
        ))}
      </div>

      {filteredQuests.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No quests found for the selected filter
          </p>
        </div>
      )}
    </div>
  )
}

interface QuestCardProps {
  quest: typeof MOCK_QUESTS[0]
  onComplete: (questId: string) => void
  isLoading: boolean
}

function QuestCard({ quest, onComplete, isLoading }: QuestCardProps) {
  const Icon = quest.icon
  
  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'onboarding': return 'text-blue-600'
      case 'social': return 'text-green-600'
      case 'github': return 'text-purple-600'
      case 'reputation': return 'text-orange-600'
      case 'nft': return 'text-pink-600'
      case 'defi': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getQuestTypeBg = (type: string) => {
    switch (type) {
      case 'onboarding': return 'bg-blue-100 dark:bg-blue-900/20'
      case 'social': return 'bg-green-100 dark:bg-green-900/20'
      case 'github': return 'bg-purple-100 dark:bg-purple-900/20'
      case 'reputation': return 'bg-orange-100 dark:bg-orange-900/20'
      case 'nft': return 'bg-pink-100 dark:bg-pink-900/20'
      case 'defi': return 'bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return (
    <Card className={`${quest.completed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''} transition-colors hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Quest Icon */}
          <div className={`p-3 rounded-lg ${getQuestTypeBg(quest.type)}`}>
            <Icon className={`w-6 h-6 ${getQuestTypeColor(quest.type)}`} />
          </div>

          {/* Quest Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {quest.title}
                  {quest.completed && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {quest.description}
                </p>
              </div>
              
              <Badge variant="outline" className={getQuestTypeColor(quest.type)}>
                {quest.type}
              </Badge>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requirements:</h4>
              <ul className="space-y-1">
                {quest.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${quest.progress > (index / quest.requirements.length) * 100 ? 'bg-green-500' : 'bg-muted'}`} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress */}
            {!quest.completed && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{quest.progress}%</span>
                </div>
                <Progress value={quest.progress} className="h-2" />
              </div>
            )}

            {/* Rewards & Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{quest.xpReward} XP</span>
                </div>
                {quest.suiReward > 0 && (
                  <div className="flex items-center gap-1">
                    <Gift className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{quest.suiReward} SUI</span>
                  </div>
                )}
              </div>

              {quest.completed ? (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : quest.progress >= 100 ? (
                <Button
                  onClick={() => onComplete(quest.id)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Claim Reward
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  In Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact quest progress for dashboard
export function QuestProgress({ className = '' }: { className?: string }) {
  const activeQuests = MOCK_QUESTS.filter(q => !q.completed && q.isActive).length
  const completedQuests = MOCK_QUESTS.filter(q => q.completed).length
  const totalQuests = MOCK_QUESTS.length

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Quest Progress</h3>
        <Badge variant="secondary">
          {completedQuests}/{totalQuests}
        </Badge>
      </div>

      <div className="space-y-3">
        {MOCK_QUESTS.slice(0, 3).map((quest) => (
          <div key={quest.id} className="flex items-center gap-3">
            <quest.icon className={`w-4 h-4 ${quest.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">{quest.title}</div>
              <Progress value={quest.progress} className="h-1 mt-1" />
            </div>
            <div className="text-xs text-muted-foreground">
              {quest.progress}%
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full">
        <ArrowRight className="w-4 h-4 mr-2" />
        View All Quests
      </Button>
    </div>
  )
}
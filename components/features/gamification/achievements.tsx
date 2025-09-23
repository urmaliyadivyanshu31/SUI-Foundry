'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Award,
  Trophy,
  Star,
  Users,
  Code,
  DollarSign,
  Zap,
  Crown,
  Sparkles,
  Calendar,
  Target,
  TrendingUp,
  Shield,
  Flame,
  Gift
} from 'lucide-react'

// Mock achievements data
const MOCK_ACHIEVEMENTS = [
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users to join SuiDentity',
    type: 'milestone',
    rarity: 'legendary',
    icon: Crown,
    earned: true,
    earnedAt: new Date('2024-01-15'),
    requirement: 'Be among the first 100 users',
    progress: 100,
    total: 100
  },
  {
    id: 'social-connector',
    name: 'Social Connector',
    description: 'Connected 3 or more social accounts',
    type: 'social',
    rarity: 'epic',
    icon: Users,
    earned: true,
    earnedAt: new Date('2024-02-01'),
    requirement: 'Connect 3 social accounts',
    progress: 3,
    total: 3
  },
  {
    id: 'github-expert',
    name: 'GitHub Expert',
    description: 'Achieved 500+ developer reputation score',
    type: 'github',
    rarity: 'rare',
    icon: Code,
    earned: false,
    requirement: 'Reach 500+ developer score',
    progress: 245,
    total: 500
  },
  {
    id: 'reputation-master',
    name: 'Reputation Master',
    description: 'Achieved maximum reputation score of 850',
    type: 'reputation',
    rarity: 'legendary',
    icon: Trophy,
    earned: false,
    requirement: 'Reach 850 reputation score',
    progress: 425,
    total: 850
  },
  {
    id: 'nft-collector',
    name: 'NFT Collector',
    description: 'Minted 5 or more identity NFTs',
    type: 'nft',
    rarity: 'epic',
    icon: Sparkles,
    earned: false,
    requirement: 'Mint 5 Identity NFTs',
    progress: 1,
    total: 5
  },
  {
    id: 'defi-enthusiast',
    name: 'DeFi Enthusiast',
    description: 'Made 10+ SUI transactions',
    type: 'defi',
    rarity: 'common',
    icon: DollarSign,
    earned: false,
    requirement: 'Complete 10 SUI transactions',
    progress: 3,
    total: 10
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintained a 7-day activity streak',
    type: 'engagement',
    rarity: 'rare',
    icon: Flame,
    earned: false,
    requirement: 'Maintain 7-day streak',
    progress: 2,
    total: 7
  },
  {
    id: 'verification-champion',
    name: 'Verification Champion',
    description: 'Verified accounts on all supported platforms',
    type: 'verification',
    rarity: 'epic',
    icon: Shield,
    earned: false,
    requirement: 'Verify all social platforms',
    progress: 1,
    total: 4
  }
]

interface AchievementsProps {
  className?: string
}

export function Achievements({ className = '' }: AchievementsProps) {
  const [achievements, setAchievements] = useState(MOCK_ACHIEVEMENTS)
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all')
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || 
      (filter === 'earned' && achievement.earned) ||
      (filter === 'available' && !achievement.earned)
    
    const rarityMatch = rarityFilter === 'all' || achievement.rarity === rarityFilter
    
    return statusMatch && rarityMatch
  })

  // Calculate stats
  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length
  const earnedPercentage = (earnedCount / totalCount) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Achievement Stats */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Achievement Progress
          </CardTitle>
          <CardDescription>
            Unlock badges by completing challenges and reaching milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{earnedCount}</div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(earnedPercentage)}%</div>
              <div className="text-xs text-muted-foreground">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {achievements.filter(a => a.rarity === 'legendary' && a.earned).length}
              </div>
              <div className="text-xs text-muted-foreground">Legendary</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'earned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('earned')}
          >
            Earned
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('available')}
          >
            Available
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={rarityFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter('all')}
          >
            All Rarity
          </Button>
          <Button
            variant={rarityFilter === 'legendary' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter('legendary')}
            className="text-yellow-600"
          >
            Legendary
          </Button>
          <Button
            variant={rarityFilter === 'epic' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter('epic')}
            className="text-purple-600"
          >
            Epic
          </Button>
          <Button
            variant={rarityFilter === 'rare' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter('rare')}
            className="text-blue-600"
          >
            Rare
          </Button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No achievements found for the selected filters
          </p>
        </div>
      )}
    </div>
  )
}

interface AchievementCardProps {
  achievement: typeof MOCK_ACHIEVEMENTS[0]
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = achievement.icon
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'
      case 'epic': return 'text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950/20'
      case 'rare': return 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/20'
      case 'common': return 'text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-950/20'
      default: return 'text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-600 text-white'
      case 'epic': return 'bg-purple-600 text-white'
      case 'rare': return 'bg-blue-600 text-white'
      case 'common': return 'bg-gray-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'social': return Users
      case 'github': return Code
      case 'defi': return DollarSign
      case 'nft': return Sparkles
      case 'reputation': return TrendingUp
      case 'milestone': return Crown
      case 'engagement': return Flame
      case 'verification': return Shield
      default: return Star
    }
  }

  const TypeIcon = getTypeIcon(achievement.type)
  const progress = achievement.earned ? 100 : (achievement.progress / achievement.total) * 100

  return (
    <Card className={`relative transition-all hover:shadow-lg ${achievement.earned ? getRarityColor(achievement.rarity) : 'opacity-60'}`}>
      {/* Rarity indicator */}
      <div className="absolute top-3 right-3">
        <Badge className={getRarityBadgeColor(achievement.rarity)}>
          {achievement.rarity}
        </Badge>
      </div>

      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${getRarityColor(achievement.rarity)}`}>
          <Icon className="w-8 h-8" />
        </div>
        <CardTitle className="text-lg">{achievement.name}</CardTitle>
        <CardDescription className="text-sm">
          {achievement.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{achievement.progress}/{achievement.total}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                achievement.earned
                  ? 'bg-green-500'
                  : achievement.rarity === 'legendary'
                  ? 'bg-yellow-500'
                  : achievement.rarity === 'epic'
                  ? 'bg-purple-500'
                  : achievement.rarity === 'rare'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Requirement */}
        <div className="text-xs text-muted-foreground">
          <strong>Requirement:</strong> {achievement.requirement}
        </div>

        {/* Type and earned date */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <TypeIcon className="w-3 h-3" />
            <span className="capitalize">{achievement.type}</span>
          </div>
          {achievement.earned && achievement.earnedAt && (
            <div className="flex items-center gap-1 text-green-600">
              <Calendar className="w-3 h-3" />
              <span>{achievement.earnedAt.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Status */}
        {achievement.earned ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
            <Trophy className="w-4 h-4" />
            <span>Earned!</span>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <Target className="w-4 h-4 mx-auto mb-1" />
            <span className="text-xs">In Progress</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact achievements display for dashboard
export function AchievementsSummary({ className = '' }: { className?: string }) {
  const recentAchievements = MOCK_ACHIEVEMENTS
    .filter(a => a.earned)
    .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
    .slice(0, 3)

  const totalEarned = MOCK_ACHIEVEMENTS.filter(a => a.earned).length
  const totalAvailable = MOCK_ACHIEVEMENTS.length

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recent Achievements</h3>
        <Badge variant="secondary">
          {totalEarned}/{totalAvailable}
        </Badge>
      </div>

      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${achievement.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-muted'}`}>
              <achievement.icon className={`w-4 h-4 ${achievement.rarity === 'legendary' ? 'text-yellow-600' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{achievement.name}</div>
              <div className="text-xs text-muted-foreground">
                {achievement.earnedAt?.toLocaleDateString()}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {achievement.rarity}
            </Badge>
          </div>
        ))}
      </div>

      {recentAchievements.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No achievements earned yet</p>
        </div>
      )}
    </div>
  )
}
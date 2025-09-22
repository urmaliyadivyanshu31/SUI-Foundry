'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Github, 
  Star, 
  GitFork, 
  Code, 
  Calendar, 
  ExternalLink,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useGitHubConnection, useGitHubConnectionStatus } from '@/hooks/useGitHubConnection'
import { formatNumber, getRelativeTime } from '@/lib/github'
import type { SocialConnection } from '@/types'

interface GitHubConnectionCardProps {
  userId: string
  socialConnections: SocialConnection[]
  onConnectionUpdate?: () => void
}

export function GitHubConnectionCard({ 
  userId, 
  socialConnections, 
  onConnectionUpdate 
}: GitHubConnectionCardProps) {
  const { connectGitHub, analyzeGitHubProfile, isConnecting, isAnalyzing, error } = useGitHubConnection()
  const { 
    isConnected, 
    connection, 
    username, 
    profileData, 
    lastAnalyzed, 
    developerScore,
    needsAnalysis 
  } = useGitHubConnectionStatus(socialConnections)

  const [showDetails, setShowDetails] = useState(false)

  const handleConnect = () => {
    connectGitHub(userId)
  }

  const handleAnalyze = async () => {
    await analyzeGitHubProfile(userId)
    onConnectionUpdate?.()
  }

  if (!isConnected) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Github className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <CardTitle className="text-xl">Connect GitHub Account</CardTitle>
          <CardDescription>
            Verify your developer credentials and boost your reputation score by connecting your GitHub profile
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Repository Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Activity Tracking</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Developer Score</span>
            </div>
          </div>
          
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </>
            )}
          </Button>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profileData?.avatar_url} alt={username} />
              <AvatarFallback>
                <Github className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{profileData?.name || username}</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>@{username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 px-2"
                >
                  <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {developerScore !== null && (
              <div className="mb-2">
                <div className="text-2xl font-bold text-green-600">{developerScore}</div>
                <div className="text-xs text-muted-foreground">Developer Score</div>
              </div>
            )}
            <Badge variant={needsAnalysis ? "secondary" : "default"}>
              {needsAnalysis ? "Needs Analysis" : "Analyzed"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Stats */}
        {profileData && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{formatNumber(profileData.public_repos || 0)}</div>
              <div className="text-xs text-muted-foreground">Repositories</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatNumber(profileData.followers || 0)}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{formatNumber(profileData.following || 0)}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        )}

        {/* Analysis Data */}
        {profileData?.analysis && (
          <div className="space-y-3">
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Stars:</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{formatNumber(profileData.analysis.totalStars)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Forks:</span>
                <div className="flex items-center space-x-1">
                  <GitFork className="h-3 w-3 text-blue-500" />
                  <span>{formatNumber(profileData.analysis.totalForks)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Commits:</span>
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span>{formatNumber(profileData.analysis.totalCommits)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Age:</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-purple-500" />
                  <span>{Math.floor(profileData.analysis.accountAge / 365)}y</span>
                </div>
              </div>
            </div>

            {/* Activity Scores */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Consistency Score</span>
                <span className="font-medium">{profileData.analysis.consistencyScore}/100</span>
              </div>
              <Progress value={profileData.analysis.consistencyScore} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Diversity Score</span>
                <span className="font-medium">{profileData.analysis.diversityScore}/100</span>
              </div>
              <Progress value={profileData.analysis.diversityScore} className="h-2" />
            </div>

            {/* Top Languages */}
            {Object.keys(profileData.analysis.languageStats).length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Top Languages</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(profileData.analysis.languageStats)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([language]) => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="sm"
            variant={needsAnalysis ? "default" : "outline"}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-3 w-3" />
                {needsAnalysis ? "Analyze Profile" : "Re-analyze"}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        </div>

        {/* Last Analyzed */}
        {lastAnalyzed && (
          <div className="text-xs text-muted-foreground text-center">
            Last analyzed {getRelativeTime(lastAnalyzed)}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
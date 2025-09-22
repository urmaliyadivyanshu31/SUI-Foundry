'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap, 
  Brain, 
  Target,
  Clock,
  DollarSign,
  Users,
  Code,
  Hash,
  ChevronRight,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useReputation, useReputationActions } from '@/hooks/useReputation'
import type { AIInsights } from '@/lib/ai-reputation'

interface ReputationDashboardProps {
  userId: string
}

function ScoreCircle({ score, maxScore = 850, size = 120 }: { score: number, maxScore?: number, size?: number }) {
  const percentage = ((score - 300) / (maxScore - 300)) * 100
  const circumference = 2 * Math.PI * (size / 2 - 10)
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className="text-purple-600 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{score}</div>
        <div className="text-xs text-muted-foreground">/ {maxScore}</div>
      </div>
    </div>
  )
}

function AIInsightsCard({ insights }: { insights: AIInsights }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Personality Analysis</span>
          <Badge variant="secondary" className="text-xs">
            {insights.tokenUsage} tokens
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered insights based on your digital footprint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personality Profile */}
        <div>
          <h4 className="font-medium mb-3">Personality Traits</h4>
          <div className="flex flex-wrap gap-2">
            {insights.personalityProfile.traits.map((trait, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {trait}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Work Style: <span className="font-medium">{insights.personalityProfile.workStyle}</span>
          </p>
        </div>

        <Separator />

        {/* Reputation Analysis */}
        <div>
          <h4 className="font-medium mb-3">Reputation Summary</h4>
          <p className="text-sm mb-3">{insights.reputationAnalysis.summary}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Trustworthiness</div>
              <div className="flex items-center space-x-2">
                <Progress value={insights.reputationAnalysis.trustworthiness} className="flex-1" />
                <span className="text-sm font-medium">{insights.reputationAnalysis.trustworthiness}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Expertise Areas</div>
              <div className="flex flex-wrap gap-1">
                {insights.reputationAnalysis.expertise.slice(0, 2).map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Improvement Suggestions */}
        <div>
          <h4 className="font-medium mb-3">AI Recommendations</h4>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-green-600 mb-1">Quick Wins</div>
              <ul className="text-sm space-y-1">
                {insights.improvementSuggestions.immediate.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600 mb-1">Long-term Goals</div>
              <ul className="text-sm space-y-1">
                {insights.improvementSuggestions.longTerm.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Target className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Market Positioning */}
        <div>
          <h4 className="font-medium mb-3">Market Positioning</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span> {insights.marketPositioning.category}
            </div>
            <div>
              <span className="font-medium">Target Audience:</span> {insights.marketPositioning.targetAudience}
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium text-sm">Competitive Advantages:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {insights.marketPositioning.competitiveAdvantage.map((advantage, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {advantage}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Generated on {new Date(insights.generatedAt).toLocaleDateString()} • 
          Cached until {new Date(insights.cacheUntil).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

export function ReputationDashboard({ userId }: ReputationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { 
    reputation, 
    improvement, 
    isLoading, 
    isAnalyzing, 
    analyzeReputation, 
    error,
    cacheAge,
    needsUpdate,
    hasAIInsights,
    tokenUsage
  } = useReputation(userId)

  const { recommendedAction, executeAction, isExecuting } = useReputationActions(userId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-600" />
              <p className="text-muted-foreground">Loading reputation data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !reputation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
              <div>
                <p className="font-medium">Failed to load reputation</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => analyzeReputation()} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Try Again'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with main score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Reputation Score</CardTitle>
              <CardDescription>
                Your Web3 reputation based on social proof and activity
              </CardDescription>
            </div>
            {cacheAge > 0 && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Last updated: {cacheAge < 60 ? `${cacheAge}m ago` : `${Math.round(cacheAge / 60)}h ago`}
                </div>
                {needsUpdate && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Update available
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reputation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center space-y-4">
                <ScoreCircle score={reputation.score} />
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${reputation.level.color} font-medium`}
                    >
                      {reputation.level.level}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {reputation.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {reputation.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {reputation.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reputation.level.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Top {100 - reputation.percentile}% of users
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-4">
                <h3 className="font-medium">Score Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Developer (40%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${reputation.breakdown.developer}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{reputation.breakdown.developer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Social (30%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${reputation.breakdown.social}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{reputation.breakdown.social}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">DeFi (20%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${reputation.breakdown.defi}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{reputation.breakdown.defi}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Verification (10%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${reputation.breakdown.verification}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{reputation.breakdown.verification}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reputation Score Yet</h3>
              <p className="text-muted-foreground mb-6">
                Analyze your profile to get your first reputation score
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={executeAction}
              disabled={isExecuting}
              variant={recommendedAction.variant}
              size="lg"
              className="min-w-[200px]"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {recommendedAction.action === 'analyze' && <Zap className="mr-2 h-4 w-4" />}
                  {recommendedAction.action === 'refresh' && <RefreshCw className="mr-2 h-4 w-4" />}
                  {recommendedAction.action === 'enhance' && <Sparkles className="mr-2 h-4 w-4" />}
                  {recommendedAction.action === 'view' && <Info className="mr-2 h-4 w-4" />}
                  {recommendedAction.label}
                </>
              )}
            </Button>
          </div>

          {recommendedAction.description && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {recommendedAction.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed tabs for AI insights and improvement */}
      {reputation && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="improvement">Improvement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Score</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reputation.score}</div>
                  <p className="text-xs text-muted-foreground">
                    {reputation.level.range} range
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Percentile</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reputation.percentile}th</div>
                  <p className="text-xs text-muted-foreground">
                    Better than {reputation.percentile}% of users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analysis Cost</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tokenUsage}</div>
                  <p className="text-xs text-muted-foreground">
                    {tokenUsage > 0 ? 'AI tokens used' : 'Algorithmic only'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {hasAIInsights && reputation.aiInsights ? (
              <AIInsightsCard insights={reputation.aiInsights} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Brain className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium">AI Insights Available</h3>
                      <p className="text-muted-foreground">
                        Get AI-powered personality analysis and recommendations
                      </p>
                    </div>
                    <Button 
                      onClick={() => analyzeReputation(true)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? 'Generating...' : 'Generate AI Insights'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="improvement" className="space-y-6">
            {improvement ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>Improvement Potential</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        +{improvement.improvement}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        potential score increase
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span>{reputation.score}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Maximum Possible</span>
                        <span>{improvement.maxPossible}</span>
                      </div>
                      <Progress 
                        value={(reputation.score / improvement.maxPossible) * 100} 
                        className="h-2"
                      />
                    </div>

                    <Badge 
                      variant={
                        improvement.effort === 'low' ? 'default' : 
                        improvement.effort === 'medium' ? 'secondary' : 'outline'
                      }
                      className="w-full justify-center"
                    >
                      {improvement.effort} effort required
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Quick Wins</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {improvement.quickWins.map((action, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Target className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium">Improvement Analysis</h3>
                      <p className="text-muted-foreground">
                        Analyze your reputation to see improvement opportunities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
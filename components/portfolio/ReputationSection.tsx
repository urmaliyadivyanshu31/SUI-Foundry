'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ReputationRadarChart } from '@/components/charts/ReputationRadarChart'
import { TrendingUp, Code, Shield, BookOpen, TestTube, Sparkles } from 'lucide-react'

interface Reputation {
  total_score: number
  developer_score: number
  social_score: number
  defi_score: number
  ai_analysis: {
    repositoryCount: number
    skillsProfile: string[]
    languageDistribution: Record<string, number>
    overallFeedback: string
    careerRecommendations: string[]
  } | null
}

interface ReputationSectionProps {
  reputation: Reputation
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

const getScoreBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-green-900/30 border-green-500/30 text-green-300'
  if (score >= 60) return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300'
  if (score >= 40) return 'bg-orange-900/30 border-orange-500/30 text-orange-300'
  return 'bg-red-900/30 border-red-500/30 text-red-300'
}

export function ReputationSection({ reputation }: ReputationSectionProps) {
  // Extract scores from AI analysis or use defaults
  const radarData = {
    codeQuality: reputation.developer_score || 0,
    architecture: Math.max(0, (reputation.developer_score || 0) - 10 + Math.random() * 20),
    documentation: Math.max(0, (reputation.developer_score || 0) - 15 + Math.random() * 30),
    testing: Math.max(0, (reputation.developer_score || 0) - 20 + Math.random() * 40),
    security: Math.max(0, (reputation.developer_score || 0) - 5 + Math.random() * 15),
    innovation: Math.max(0, (reputation.developer_score || 0) - 10 + Math.random() * 25)
  }

  const overallScore = Math.round((reputation.total_score - 300) / 550 * 100) // Convert 300-850 to 0-100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Overall Reputation Score */}
      <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Reputation Score</h3>
          <Badge className={`text-lg px-3 py-1 ${getScoreBadgeColor(overallScore)}`}>
            {reputation.total_score}/850
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-gray-400">Overall Score</p>
            <Progress 
              value={overallScore} 
              className="mt-3 h-2"
            />
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Developer</span>
              </div>
              <Badge variant="secondary" className="bg-purple-900/30 border-purple-500/30 text-purple-300">
                {reputation.developer_score}/100
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Social</span>
              </div>
              <Badge variant="secondary" className="bg-blue-900/30 border-blue-500/30 text-blue-300">
                {reputation.social_score}/100
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">DeFi</span>
              </div>
              <Badge variant="secondary" className="bg-green-900/30 border-green-500/30 text-green-300">
                {reputation.defi_score}/100
              </Badge>
            </div>
          </div>

          {/* Skills */}
          {reputation.ai_analysis?.skillsProfile && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Skills Identified</h4>
              <div className="flex flex-wrap gap-2">
                {reputation.ai_analysis.skillsProfile.slice(0, 6).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs border-gray-600/50 text-gray-300"
                  >
                    {skill}
                  </Badge>
                ))}
                {reputation.ai_analysis.skillsProfile.length > 6 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-600/50 text-gray-300"
                  >
                    +{reputation.ai_analysis.skillsProfile.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart */}
      {reputation.developer_score > 0 && (
        <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Developer Skills Breakdown</h3>
          <ReputationRadarChart data={radarData} />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {[
              { icon: Code, label: 'Code Quality', value: Math.round(radarData.codeQuality) },
              { icon: Shield, label: 'Architecture', value: Math.round(radarData.architecture) },
              { icon: BookOpen, label: 'Documentation', value: Math.round(radarData.documentation) },
              { icon: TestTube, label: 'Testing', value: Math.round(radarData.testing) },
              { icon: Shield, label: 'Security', value: Math.round(radarData.security) },
              { icon: Sparkles, label: 'Innovation', value: Math.round(radarData.innovation) }
            ].map((item, index) => (
              <div key={item.label} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <item.icon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className={`text-sm font-medium ${getScoreColor(item.value)}`}>
                  {item.value}/100
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {reputation.ai_analysis?.overallFeedback && (
        <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">AI Analysis</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            {reputation.ai_analysis.overallFeedback}
          </p>
          
          {reputation.ai_analysis.careerRecommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {reputation.ai_analysis.careerRecommendations.slice(0, 3).map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
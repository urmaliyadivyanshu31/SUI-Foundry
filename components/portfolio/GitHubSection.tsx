'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, GitFork, ExternalLink, Code, Users, MapPin, Calendar } from 'lucide-react'
import { LanguageChart } from '@/components/charts/LanguageChart'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  html_url: string
  created_at: string
  updated_at: string
}

interface GitHubStats {
  public_repos: number
  followers: number
  following: number
  created_at: string
  location: string | null
  bio: string | null
}

interface GitHubSectionProps {
  repositories: Repository[]
  githubStats: GitHubStats | null
  githubUsername?: string
}

export function GitHubSection({ repositories, githubStats, githubUsername }: GitHubSectionProps) {
  if (!githubStats && repositories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">GitHub Profile</h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400">No GitHub connection found</p>
        </div>
      </motion.div>
    )
  }

  // Calculate language distribution from repositories
  const languageDistribution = repositories.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      {/* GitHub Stats Overview */}
      {githubStats && (
        <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">GitHub Profile</h3>
            {githubUsername && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gray-600/50 text-gray-300 hover:text-white hover:border-purple-500/50"
              >
                <a 
                  href={`https://github.com/${githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Profile
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <Code className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubStats.public_repos}</p>
              <p className="text-sm text-gray-400">Repositories</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubStats.followers}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubStats.following}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">
                {formatDate(githubStats.created_at)}
              </p>
              <p className="text-sm text-gray-400">Member since</p>
            </div>
          </div>

          {githubStats.bio && (
            <div className="mb-4">
              <p className="text-gray-300">{githubStats.bio}</p>
            </div>
          )}

          {githubStats.location && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{githubStats.location}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Repositories */}
      {repositories.length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Top Repositories</h3>
          
          <div className="grid gap-4">
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {repo.name}
                      </h4>
                      {repo.language && (
                        <Badge 
                          variant="secondary"
                          className="bg-purple-900/30 border-purple-500/30 text-purple-300 text-xs"
                        >
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                    
                    {repo.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {repo.topics.slice(0, 5).map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="text-xs border-gray-600/50 text-gray-400"
                          >
                            {topic}
                          </Badge>
                        ))}
                        {repo.topics.length > 5 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-600/50 text-gray-400"
                          >
                            +{repo.topics.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{repo.stargazers_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        <span>{repo.forks_count.toLocaleString()}</span>
                      </div>
                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-400 hover:text-white"
                  >
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Language Distribution */}
      {Object.keys(languageDistribution).length > 0 && (
        <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Language Distribution</h3>
          <LanguageChart data={languageDistribution} />
        </div>
      )}
    </motion.div>
  )
}
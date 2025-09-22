export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  visibility: string
  default_branch: string
}

export interface GitHubContributor {
  login: string
  id: number
  avatar_url: string
  html_url: string
  contributions: number
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    id: number
    avatar_url: string
  } | null
  html_url: string
}

export interface GitHubLanguageStats {
  [language: string]: number
}

export interface GitHubProfileAnalysis {
  totalRepos: number
  totalStars: number
  totalForks: number
  totalCommits: number
  languageStats: GitHubLanguageStats
  topRepositories: GitHubRepository[]
  recentActivity: GitHubCommit[]
  accountAge: number // in days
  consistencyScore: number // 0-100 based on activity
  diversityScore: number // 0-100 based on languages/topics
}

export class GitHubService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com'

  // Get user's repositories with detailed information
  static async getUserRepositories(
    username: string,
    accessToken?: string,
    page = 1,
    perPage = 100
  ): Promise<GitHubRepository[]> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SuiDentity-App'
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(
        `${this.GITHUB_API_BASE}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated&type=owner`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error)
      return []
    }
  }

  // Get user's recent commits across all repositories
  static async getUserRecentCommits(
    username: string,
    accessToken?: string,
    limit = 50
  ): Promise<GitHubCommit[]> {
    try {
      const repositories = await this.getUserRepositories(username, accessToken, 1, 30)
      const allCommits: GitHubCommit[] = []

      for (const repo of repositories.slice(0, 10)) { // Check recent repos only
        try {
          const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SuiDentity-App'
          }

          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
          }

          const response = await fetch(
            `${this.GITHUB_API_BASE}/repos/${repo.full_name}/commits?author=${username}&per_page=10`,
            { headers }
          )

          if (response.ok) {
            const commits: GitHubCommit[] = await response.json()
            allCommits.push(...commits)
          }
        } catch (error) {
          console.error(`Error fetching commits for ${repo.name}:`, error)
        }
      }

      // Sort by date and limit
      return allCommits
        .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching GitHub commits:', error)
      return []
    }
  }

  // Analyze user's language usage across repositories
  static async getUserLanguageStats(
    username: string,
    accessToken?: string
  ): Promise<GitHubLanguageStats> {
    try {
      const repositories = await this.getUserRepositories(username, accessToken)
      const languageStats: GitHubLanguageStats = {}

      for (const repo of repositories) {
        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size
        }
      }

      return languageStats
    } catch (error) {
      console.error('Error analyzing GitHub languages:', error)
      return {}
    }
  }

  // Calculate activity consistency score based on commit history
  static calculateConsistencyScore(commits: GitHubCommit[]): number {
    if (commits.length === 0) return 0

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const recentCommits = commits.filter(
      commit => new Date(commit.commit.author.date) >= thirtyDaysAgo
    ).length

    const olderCommits = commits.filter(
      commit => {
        const date = new Date(commit.commit.author.date)
        return date >= ninetyDaysAgo && date < thirtyDaysAgo
      }
    ).length

    // Score based on recent activity and consistency
    const recentScore = Math.min(recentCommits * 10, 60) // Max 60 for recent activity
    const consistencyScore = olderCommits > 0 ? Math.min(olderCommits * 2, 40) : 0 // Max 40 for consistency

    return Math.min(recentScore + consistencyScore, 100)
  }

  // Calculate diversity score based on languages and repository topics
  static calculateDiversityScore(
    languageStats: GitHubLanguageStats,
    repositories: GitHubRepository[]
  ): number {
    const uniqueLanguages = Object.keys(languageStats).length
    const allTopics = repositories.flatMap(repo => repo.topics || [])
    const uniqueTopics = new Set(allTopics).size

    // Score based on language diversity (max 60) and topic diversity (max 40)
    const languageScore = Math.min(uniqueLanguages * 10, 60)
    const topicScore = Math.min(uniqueTopics * 5, 40)

    return Math.min(languageScore + topicScore, 100)
  }

  // Comprehensive profile analysis
  static async analyzeGitHubProfile(
    username: string,
    accessToken?: string
  ): Promise<GitHubProfileAnalysis> {
    try {
      const [repositories, commits, languageStats] = await Promise.all([
        this.getUserRepositories(username, accessToken),
        this.getUserRecentCommits(username, accessToken),
        this.getUserLanguageStats(username, accessToken)
      ])

      const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)

      // Calculate account age from oldest repository
      const oldestRepo = repositories.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]
      const accountAge = oldestRepo
        ? Math.floor((Date.now() - new Date(oldestRepo.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // Get top repositories by stars
      const topRepositories = repositories
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 10)

      const consistencyScore = this.calculateConsistencyScore(commits)
      const diversityScore = this.calculateDiversityScore(languageStats, repositories)

      return {
        totalRepos: repositories.length,
        totalStars,
        totalForks,
        totalCommits: commits.length,
        languageStats,
        topRepositories,
        recentActivity: commits.slice(0, 20),
        accountAge,
        consistencyScore,
        diversityScore
      }
    } catch (error) {
      console.error('Error analyzing GitHub profile:', error)
      return {
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        totalCommits: 0,
        languageStats: {},
        topRepositories: [],
        recentActivity: [],
        accountAge: 0,
        consistencyScore: 0,
        diversityScore: 0
      }
    }
  }

  // Calculate developer score for reputation system (0-100)
  static calculateDeveloperScore(analysis: GitHubProfileAnalysis): number {
    let score = 0

    // Repository quantity score (max 15 points)
    score += Math.min(analysis.totalRepos * 1.5, 15)

    // Quality score based on stars and forks (max 25 points)
    const qualityScore = Math.min(
      analysis.totalStars * 2 + analysis.totalForks * 1.5,
      25
    )
    score += qualityScore

    // Activity consistency (max 30 points)
    score += (analysis.consistencyScore / 100) * 30

    // Language/topic diversity (max 20 points)
    score += (analysis.diversityScore / 100) * 20

    // Account age bonus (max 10 points)
    const ageBonus = Math.min(analysis.accountAge / 365, 3) * 3.33 // 3 years = max bonus
    score += ageBonus

    return Math.min(Math.round(score), 100)
  }
}

// Helper function to format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Helper function to get relative time
export function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInMs = now.getTime() - then.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)} weeks ago`
  } else if (diffInDays < 365) {
    return `${Math.floor(diffInDays / 30)} months ago`
  } else {
    return `${Math.floor(diffInDays / 365)} years ago`
  }
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react'
import { JobApplicationWithDetails, Company } from '@/types'

interface CompanyDashboardStats {
  total_applications: number
  pending_applications: number
  reviewed_applications: number
  hired_candidates: number
  average_reputation: number
}

export default function HRDashboard() {
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reputationFilter, setReputationFilter] = useState<string>('all')

  // Fetch user's companies
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data.companies)
        if (data.data.companies.length > 0) {
          setSelectedCompany(data.data.companies[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  // Fetch applications for selected company
  const fetchApplications = async (companyId: string) => {
    if (!companyId) return

    try {
      const response = await fetch(`/api/job-applications?company_id=${companyId}&limit=100`)
      const data = await response.json()
      
      if (data.success) {
        // Sort by reputation score (highest first)
        const sortedApplications = data.data.applications.sort((a: JobApplicationWithDetails, b: JobApplicationWithDetails) => {
          const aScore = a.applicant?.reputation_scores?.[0]?.total_score || 0
          const bScore = b.applicant?.reputation_scores?.[0]?.total_score || 0
          return bScore - aScore
        })
        setApplications(sortedApplications)
        calculateStats(sortedApplications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard stats
  const calculateStats = (apps: JobApplicationWithDetails[]) => {
    const stats: CompanyDashboardStats = {
      total_applications: apps.length,
      pending_applications: apps.filter(app => app.status === 'pending').length,
      reviewed_applications: apps.filter(app => ['reviewed', 'interview_scheduled', 'hired', 'rejected'].includes(app.status)).length,
      hired_candidates: apps.filter(app => app.status === 'hired').length,
      average_reputation: apps.length > 0 
        ? Math.round(apps.reduce((acc, app) => acc + (app.applicant?.reputation_scores?.[0]?.total_score || 0), 0) / apps.length)
        : 0
    }
    setStats(stats)
  }

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/job-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Refresh applications
        fetchApplications(selectedCompany)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.applicant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    const reputation = app.applicant?.reputation_scores?.[0]?.total_score || 0
    const matchesReputation = reputationFilter === 'all' ||
      (reputationFilter === 'high' && reputation >= 700) ||
      (reputationFilter === 'medium' && reputation >= 500 && reputation < 700) ||
      (reputationFilter === 'low' && reputation < 500)

    return matchesSearch && matchesStatus && matchesReputation
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      setLoading(true)
      fetchApplications(selectedCompany)
    }
  }, [selectedCompany])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReputationColor = (score: number) => {
    if (score >= 700) return 'text-green-600 bg-green-50'
    if (score >= 500) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="max-w-md mx-auto">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Company Found</h2>
          <p className="text-gray-600 mb-4">
            You need to create a company first to view job applications.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/company/create'}>
            Create Company
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-gray-600">Manage job applications and review candidates</p>
        </div>
        
        {companies.length > 1 && (
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_applications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_applications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed_applications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.hired_candidates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Reputation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_reputation}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search candidates, jobs, or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reputationFilter} onValueChange={setReputationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by reputation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reputation</SelectItem>
              <SelectItem value="high">High (700+)</SelectItem>
              <SelectItem value="medium">Medium (500-699)</SelectItem>
              <SelectItem value="low">Low (&lt;500)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          Applications ({filteredApplications.length})
          <span className="text-sm font-normal text-gray-500 ml-2">
            Sorted by reputation score (highest first)
          </span>
        </h2>
        
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {applications.length === 0 
                  ? "No applications received yet for this company."
                  : "No applications match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const reputation = application.applicant?.reputation_scores?.[0]?.total_score || 0
            const socialConnections = application.applicant?.social_connections || []

            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={application.applicant?.profile_picture || ''} />
                        <AvatarFallback>
                          {application.applicant?.username?.slice(0, 2)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {application.applicant?.username || 'Anonymous'}
                          </h3>
                          <Badge className={`${getReputationColor(reputation)} border-0`}>
                            <Star className="w-3 h-3 mr-1" />
                            {reputation}
                          </Badge>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Applied for: <span className="font-medium">{application.job?.title}</span>
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.applicant?.email || 'No email'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Social Connections */}
                        {socialConnections.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500">Verified:</span>
                            {socialConnections.map((connection) => (
                              <Badge key={connection.id} variant="outline" className="text-xs">
                                {connection.platform === 'github' && <Github className="w-3 h-3 mr-1" />}
                                {connection.platform === 'twitter' && <Twitter className="w-3 h-3 mr-1" />}
                                {connection.platform === 'linkedin' && <Linkedin className="w-3 h-3 mr-1" />}
                                {connection.platform}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Cover Letter Preview */}
                        {application.cover_letter && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'interview_scheduled')}
                            variant="outline"
                          >
                            Interview
                          </Button>
                        </>
                      )}
                      
                      {application.status === 'reviewed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'interview_scheduled')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Schedule Interview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            variant="destructive"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {application.status === 'interview_scheduled' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'hired')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Hire
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            variant="destructive"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
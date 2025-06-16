'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  status: 'active' | 'closed' | 'draft'
  applications_count: number
  created_at: string
}

interface Company {
  id: string
  name: string
  description: string
  website: string
  industry: string
  size: string
  location: string
}

export default function CompanyDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    viewsThisMonth: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
        return
      }

      setUser(session.user)

      // Get company data
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single()

      if (!userData?.company_id) {
        router.push('/auth/company-sign-up')
        return
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userData.company_id)
        .single()

      if (companyData) {
        setCompany(companyData)
        await loadJobPostings(userData.company_id)
      }
    } catch (err: any) {
      console.error('Error checking user:', err)
      router.push('/auth/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const loadJobPostings = async (companyId: string) => {
    try {
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select(`
          *,
          applications:job_applications(count)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (jobsData) {
        const jobsWithCounts = jobsData.map(job => ({
          ...job,
          applications_count: job.applications?.length || 0
        }))
        setJobs(jobsWithCounts)

        // Calculate stats
        const totalJobs = jobsWithCounts.length
        const activeJobs = jobsWithCounts.filter(job => job.status === 'active').length
        const totalApplications = jobsWithCounts.reduce((sum, job) => sum + job.applications_count, 0)
        
        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          viewsThisMonth: Math.floor(Math.random() * 1000) + 200 // Mock data
        })
      }
    } catch (error) {
      console.error('Error loading job postings:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading company dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Company Dashboard</h1>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-gray-600 font-medium">{company?.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/company/jobs/new"
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                + Post New Job
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                }}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-lg opacity-90 mb-4">
            Here's what's happening with your job postings at {company?.name}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/company/jobs/new"
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all border border-white/30"
            >
              🚀 Post New Job
            </Link>
            <Link
              href="/company/jobs"
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all border border-white/30"
            >
              📋 View All Jobs
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">
                ↗ All time
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">
                Currently recruiting
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-blue-600 text-sm font-medium">
                Across all jobs
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Views This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.viewsThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-yellow-600 text-sm font-medium">
                Job page views
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Job Postings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Recent Job Postings</h3>
                <Link
                  href="/company/jobs"
                  className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">📋</span>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No job postings yet</h4>
                  <p className="text-gray-600 mb-6">Create your first job posting to start attracting candidates</p>
                  <Link
                    href="/company/jobs/new"
                    className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-block"
                  >
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h4>
                          <p className="text-gray-600 text-sm">
                            {job.department} • {job.location} • {job.type}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.applications_count} applications</span>
                          <span>•</span>
                          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            href={`/company/jobs/${job.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/company/jobs/${job.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-700 font-medium text-sm transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Info & Quick Actions */}
          <div className="space-y-6">
            {/* Company Profile */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Company:</span>
                  <p className="text-gray-900">{company?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Industry:</span>
                  <p className="text-gray-900">{company?.industry}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Size:</span>
                  <p className="text-gray-900">{company?.size}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Location:</span>
                  <p className="text-gray-900">{company?.location}</p>
                </div>
                {company?.website && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Website:</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 block truncate"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
              <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Edit Profile
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/company/jobs/new"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all block text-center"
                >
                  📝 Post New Job
                </Link>
                <Link
                  href="/company/jobs"
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all block text-center"
                >
                  📋 Manage Jobs
                </Link>
                <Link
                  href="/company/applications"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all block text-center"
                >
                  👥 View Applications
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New application received</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">📋</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Job posting published</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

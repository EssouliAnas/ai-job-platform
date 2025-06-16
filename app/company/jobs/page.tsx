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
  salary_range: string
  applications_count: number
  created_at: string
}

export default function CompanyJobsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all')
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
        await loadJobs(userData.company_id)
      }
    } catch (err: any) {
      console.error('Error checking user:', err)
      router.push('/auth/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async (companyId: string) => {
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
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter)

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

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job posting')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading jobs...</p>
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
              <Link
                href="/company/dashboard"
                className="flex items-center text-gray-600 hover:text-yellow-500 transition-colors"
              >
                <span className="text-xl mr-2">←</span>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">All Job Postings</h1>
            </div>
            <Link
              href="/company/jobs/new"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              + Post New Job
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All Jobs', count: jobs.length },
              { key: 'active', label: 'Active', count: jobs.filter(j => j.status === 'active').length },
              { key: 'draft', label: 'Draft', count: jobs.filter(j => j.status === 'draft').length },
              { key: 'closed', label: 'Closed', count: jobs.filter(j => j.status === 'closed').length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-6 block">📋</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {filter === 'all' ? 'No job postings yet' : `No ${filter} jobs`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'Create your first job posting to start attracting candidates'
                  : `You don't have any ${filter} job postings at the moment`
                }
              </p>
              <Link
                href="/company/jobs/new"
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all inline-block"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium mr-2">🏢 Department:</span>
                            <span>{job.department || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium mr-2">📍 Location:</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium mr-2">💼 Type:</span>
                            <span className="capitalize">{job.type}</span>
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center text-gray-700">
                              <span className="font-medium mr-2">💰 Salary:</span>
                              <span>{job.salary_range}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <span className="flex items-center">
                          <span className="font-medium mr-1">👥</span>
                          {job.applications_count} applications
                        </span>
                        <span className="flex items-center">
                          <span className="font-medium mr-1">📅</span>
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Link
                        href={`/company/jobs/${job.id}`}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/company/jobs/${job.id}/edit`}
                        className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors text-center"
                      >
                        Edit Job
                      </Link>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {jobs.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-blue-600">{jobs.filter(j => j.status === 'active').length}</div>
              <div className="text-gray-700 font-medium">Active Jobs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-green-600">{jobs.reduce((sum, job) => sum + job.applications_count, 0)}</div>
              <div className="text-gray-700 font-medium">Total Applications</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-yellow-600">{jobs.filter(j => j.status === 'draft').length}</div>
              <div className="text-gray-700 font-medium">Draft Jobs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-red-600">{jobs.filter(j => j.status === 'closed').length}</div>
              <div className="text-gray-700 font-medium">Closed Jobs</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 

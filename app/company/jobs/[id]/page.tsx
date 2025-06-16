'use client'

import { use, useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import type { JobPosting, JobApplication } from '@/lib/types'

interface JobDetailProps {
  params: Promise<{
    id: string
  }>
}

export default function JobDetail({ params }: JobDetailProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchingInProgress, setMatchingInProgress] = useState(false)

  useEffect(() => {
    loadJobAndApplications()
  }, [resolvedParams.id])

  async function loadJobAndApplications() {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/sign-in')
        return
      }

      // Get user data with company_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id, user_type')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        console.error('User error:', userError)
        router.push('/auth/sign-in')
        return
      }

      if (userData.user_type !== 'company' || !userData.company_id) {
        router.push('/auth/company-sign-up')
        return
      }

      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*, companies(name)')
        .eq('id', resolvedParams.id)
        .eq('company_id', userData.company_id)
        .single()

      if (jobError) {
        console.error('Job error:', jobError)
        setError('Job not found or access denied')
        return
      }
      
      setJob(jobData)

      // Load applications using the API endpoint
      const applicationsResponse = await fetch(`/api/apply-job?jobId=${resolvedParams.id}`)
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        // Map the applications to include candidate names
        const mappedApplications = applicationsData.applications.map((app: any) => ({
          ...app,
          candidate_name: app.candidate_name || app.users?.email || 'Unknown Candidate',
          resume_id: app.resume_id,
          users: {
            email: app.users?.email || 'Unknown Email'
          }
        }))
        setApplications(mappedApplications)
      } else {
        console.error('Applications error:', await applicationsResponse.text())
      }

    } catch (error: any) {
      console.error('Error loading job details:', error)
      setError('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WAITLIST') => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )
    } catch (err: any) {
      console.error('Error updating application status:', err)
      setError(err.message)
    }
  }

  const findMatchingCandidates = async () => {
    if (!job) return
    setMatchingInProgress(true)
    setError(null)

    try {
      const response = await fetch('/api/match-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          description: job.description,
          requiredSkills: job.required_skills
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to match candidates')
      }

      await loadJobAndApplications()
    } catch (err: any) {
      console.error('Error matching candidates:', err)
      setError(err.message)
    } finally {
      setMatchingInProgress(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'SHORTLISTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'HIRED': return 'bg-purple-100 text-purple-800'
      case 'WAITLIST': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h3>
          <p className="text-gray-600 mb-8">The job posting you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/company/jobs"
            className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Back to Jobs
          </Link>
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
                href="/company/jobs"
                className="flex items-center text-gray-600 hover:text-yellow-500 transition-colors"
              >
                <span className="text-xl mr-2">←</span>
                <span className="font-medium">Back to Jobs</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={findMatchingCandidates}
                disabled={matchingInProgress}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {matchingInProgress ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Matching...
                  </span>
                ) : (
                  '🔍 Find Matching Candidates'
                )}
              </button>
              <Link
                href={`/company/jobs/${job.id}/edit`}
                className="bg-white text-gray-700 px-6 py-2 rounded-lg font-medium border border-gray-200 hover:shadow-md transition-all"
              >
                ✏️ Edit Job
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <p className="text-xl text-gray-600">{job.companies?.name}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
              job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Job Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Location:</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Type:</span>
                  <span className="font-medium">{job.job_type.replace('_', ' ')}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center">
                    <span className="w-24 text-gray-600">Salary:</span>
                    <span className="font-medium">{job.salary_range}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-gradient-to-r from-yellow-100 to-pink-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Description</h3>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📋 Applications ({applications.length})
            </h2>
            {applications.length > 0 && (
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-600">
                  New: {applications.filter(app => app.status === 'NEW').length}
                </span>
                <span className="text-green-600">
                  Approved: {applications.filter(app => app.status === 'SHORTLISTED').length}
                </span>
                <span className="text-yellow-600">
                  Waitlisted: {applications.filter(app => app.status === 'WAITLIST').length}
                </span>
                <span className="text-purple-600">
                  Hired: {applications.filter(app => app.status === 'HIRED').length}
                </span>
              </div>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">Applications will appear here when candidates apply to this job.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-semibold text-gray-900">{application.candidate_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        {application.matching_score && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {Math.round(application.matching_score)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <a
                          href={`${application.resume_url}?download=true`}
                          className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          📄 Download Resume
                        </a>
                        {application.cover_letter_url && (
                          <a
                            href={application.cover_letter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                          >
                            📝 Cover Letter
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2 min-w-[180px]">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'SHORTLISTED')}
                          disabled={application.status === 'SHORTLISTED'}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ✅ Approve
                        </button>
                        
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'WAITLIST')}
                          disabled={application.status === 'WAITLIST'}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ⏳ Waitlist
                        </button>
                        
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                          disabled={application.status === 'REJECTED'}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ❌ Reject
                        </button>
                        
                        {application.status === 'SHORTLISTED' && (
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'HIRED')}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            🎉 Hire
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
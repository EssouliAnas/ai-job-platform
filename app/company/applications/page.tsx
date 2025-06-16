'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface Application {
  id: string
  job_id: string
  applicant_id: string
  status: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WAITLIST'
  applied_at: string
  cover_letter: string
  resume_url: string
  candidate_name: string
  resume_id: string
  job_postings: {
    title: string
  }
  users: {
    email: string
  }
}

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<'all' | 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WAITLIST'>('all')
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

      console.log('User data:', userData);
      console.log('Company ID from user data:', userData?.company_id);

      if (!userData?.company_id) {
        router.push('/auth/company-sign-up')
        return
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userData.company_id)
        .single()

      console.log('Company data:', companyData);

      if (companyData) {
        setCompany(companyData)
        await loadApplications(userData.company_id)
      }
    } catch (err: any) {
      console.error('Error checking user:', err)
      router.push('/auth/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async (companyId: string) => {
    try {
      console.log('Loading applications for company:', companyId);
      
      // First, let's debug what's happening
      const debugResponse = await fetch(`/api/debug-applications?companyId=${companyId}`);
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log('Debug data:', debugData);
      }
      
      // Use the API endpoint to get applications for this company
      const response = await fetch(`/api/apply-job?companyId=${companyId}`)
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data);
        
        // Map the applications to match our interface
        const mappedApplications = data.applications.map((app: any) => ({
          ...app,
          status: app.status || 'NEW',
          applied_at: app.created_at,
          candidate_name: app.candidate_name || app.users?.email || 'Unknown Candidate',
          resume_id: app.resume_id,
          job_postings: {
            title: app.job_postings?.title || 'Unknown Position'
          },
          users: {
            email: app.users?.email || 'Unknown Email'
          }
        }))
        
        console.log('Mapped applications:', mappedApplications);
        setApplications(mappedApplications)
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch applications:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading applications:', error)
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
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Error updating application status')
    }
  }

  const filteredApplications = filter === 'all' ? applications : applications.filter(app => app.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'SHORTLISTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'HIRED':
        return 'bg-purple-100 text-purple-800'
      case 'WAITLIST':
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
          <p className="text-gray-600 font-medium">Loading applications...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Job Applications</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All Applications', count: applications.length },
              { key: 'NEW', label: 'New', count: applications.filter(a => a.status === 'NEW').length },
              { key: 'SHORTLISTED', label: 'Shortlisted', count: applications.filter(a => a.status === 'SHORTLISTED').length },
              { key: 'WAITLIST', label: 'Waitlist', count: applications.filter(a => a.status === 'WAITLIST').length },
              { key: 'REJECTED', label: 'Rejected', count: applications.filter(a => a.status === 'REJECTED').length },
              { key: 'HIRED', label: 'Hired', count: applications.filter(a => a.status === 'HIRED').length }
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

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-6 block">👥</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {filter === 'all' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'Applications will appear here once candidates start applying to your jobs'
                  : `You don't have any ${filter.toLowerCase()} applications at the moment`
                }
              </p>
              <Link
                href="/company/jobs"
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all inline-block"
              >
                View Job Postings
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{application.candidate_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <span className="font-medium mr-2">💼 Applied for:</span>
                          <span>{application.job_postings?.title}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">📅 Applied on:</span>
                          <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Cover Letter:</h4>
                          <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 line-clamp-3">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        {application.resume_url && (
                          <a
                            href={`${application.resume_url}?download=true`}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            📄 Download Resume
                          </a>
                        )}
                        <Link
                          href={`/company/jobs/${application.job_id}`}
                          className="flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                        >
                          🔗 View Job Posting
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6 min-w-[200px]">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'SHORTLISTED')}
                          disabled={application.status === 'SHORTLISTED'}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ✅ Approve
                        </button>
                        
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'WAITLIST')}
                          disabled={application.status === 'WAITLIST'}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ⏳ Waitlist
                        </button>
                        
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                          disabled={application.status === 'REJECTED'}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          ❌ Reject
                        </button>
                        
                        {application.status === 'SHORTLISTED' && (
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'HIRED')}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            🎉 Hire
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center">
                        Quick Actions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {applications.length > 0 && (
          <div className="grid md:grid-cols-5 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-blue-600">{applications.filter(a => a.status === 'NEW').length}</div>
              <div className="text-gray-700 font-medium">New Applications</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'SHORTLISTED').length}</div>
              <div className="text-gray-700 font-medium">Approved</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-yellow-600">{applications.filter(a => a.status === 'WAITLIST').length}</div>
              <div className="text-gray-700 font-medium">Waitlisted</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-purple-600">{applications.filter(a => a.status === 'HIRED').length}</div>
              <div className="text-gray-700 font-medium">Hired</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl font-bold text-gray-600">{applications.length}</div>
              <div className="text-gray-700 font-medium">Total Applications</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 

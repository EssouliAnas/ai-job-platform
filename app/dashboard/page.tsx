'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import ResumeSelector from '@/app/components/ResumeSelector'

export default function Dashboard() {
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openJobs, setOpenJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [showResumeSelector, setShowResumeSelector] = useState(false)
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<{id: string, title: string} | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadOpenJobs()
    loadApplications()
  }, [])

  const loadOpenJobs = async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch('/api/jobs?status=open&limit=6')
      if (response.ok) {
        const data = await response.json()
        setOpenJobs(data.jobs || [])
      }
    } catch (err) {
      console.error('Error loading jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const loadApplications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const response = await fetch('/api/my-applications')
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications || [])
        }
      }
    } catch (err) {
      console.error('Error loading applications:', err)
    }
  }

  const handleApplyToJob = async (jobId: string, jobTitle: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/auth/sign-in')
        return
      }

      // Show resume selector instead of applying directly
      setSelectedJobForApplication({ id: jobId, title: jobTitle })
      setSelectedResumeId(null)
      setShowResumeSelector(true)
    } catch (err) {
      console.error('Error preparing job application:', err)
      alert('Failed to prepare job application. Please try again.')
    }
  }

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId)
  }

  const handleConfirmApplication = async (resumeId: string) => {
    if (!selectedJobForApplication) return

    try {
      const response = await fetch('/api/apply-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: selectedJobForApplication.id,
          resumeId: resumeId
        }),
      })

      if (response.ok) {
        alert(`Successfully applied to ${selectedJobForApplication.title}!`)
        loadApplications() // Refresh applications
        setShowResumeSelector(false)
        setSelectedJobForApplication(null)
        setSelectedResumeId(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to apply: ${errorData.error}`)
      }
    } catch (err) {
      console.error('Error applying to job:', err)
      alert('Failed to apply to job. Please try again.')
    }
  }

  const handleCloseResumeSelector = () => {
    setShowResumeSelector(false)
    setSelectedJobForApplication(null)
    setSelectedResumeId(null)
  }

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
        return
      }
      setUser(session.user)
    } catch (err: any) {
      console.error('Error checking user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/sign-in')
    } catch (err: any) {
      console.error('Error signing out:', err)
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
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
              <div className="text-2xl font-extrabold">
                AI Job <span className="text-yellow-400">Platform</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-pink-400 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome Back! 🎉</h2>
            <p className="text-xl text-white/90">Ready to take your career to the next level?</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Resume Reviews</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-500">AI analyses completed</p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Applications</h3>
                <p className="text-3xl font-bold text-green-600">{applications.length}</p>
                <p className="text-sm text-gray-500">Job applications sent</p>
              </div>
              <div className="text-4xl">💼</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Career Score</h3>
                <p className="text-3xl font-bold text-purple-600">--</p>
                <p className="text-sm text-gray-500">Upload resume to see</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Analysis Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">🤖 AI Resume Analysis</h3>
              <p className="text-blue-100">Get professional feedback on your resume instantly</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Detailed section-by-section breakdown</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Grammar and tone assessment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Personalized improvement suggestions</span>
                </div>
              </div>
              <Link
                href="/resume-upload"
                className="mt-6 block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-bold text-center hover:shadow-lg transition-all"
              >
                Upload & Analyze Resume
              </Link>
            </div>
          </div>

          {/* Job Matching Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-pink-400 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">💼 Smart Job Matching</h3>
              <p className="text-yellow-100">Find jobs that perfectly match your skills</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">AI-powered job recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Skill gap analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Application tracking</span>
                </div>
              </div>
              <Link
                href="/job-match"
                className="mt-6 block w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-3 px-6 rounded-lg font-bold text-center hover:shadow-lg transition-all"
              >
                Find Matching Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Open Jobs Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">🎯 Open Job Opportunities</h3>
            <Link
              href="/job-match"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Jobs →
            </Link>
          </div>
          
          {loadingJobs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job opportunities...</p>
            </div>
          ) : openJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg font-medium">No open jobs available at the moment</p>
              <p className="text-sm">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openJobs.map((job: any) => (
                <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h4>
                      <p className="text-gray-600 font-medium">{job.company_name || job.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {job.type || 'Full-time'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">💰</span>
                      <span>{job.salary_range || 'Competitive'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏰</span>
                      <span>Posted {new Date(job.created_at || job.posted).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {job.description || 'Join our team and make an impact!'}
                  </p>
                  
                  {job.requirements && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(job.requirements) ? job.requirements : job.requirements.split(',')).slice(0, 3).map((req: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {req.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleApplyToJob(job.id, job.title)}
                      disabled={applications.some(app => app.job_id === job.id)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        applications.some(app => app.job_id === job.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {applications.some(app => app.job_id === job.id) ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Tools */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Career Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/resume-builder"
              className="group bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 hover:shadow-md transition-all border border-green-100"
            >
              <div className="text-3xl mb-3">📝</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Resume Builder
              </h4>
              <p className="text-gray-600 text-sm">Create professional resumes with our easy-to-use builder</p>
            </Link>

            <Link
              href="/cover-letter"
              className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-md transition-all border border-purple-100"
            >
              <div className="text-3xl mb-3">✉️</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Cover Letter Generator
              </h4>
              <p className="text-gray-600 text-sm">Generate personalized cover letters for any job</p>
            </Link>

            <Link
              href="/saved-resumes"
              className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 hover:shadow-md transition-all border border-yellow-100"
            >
              <div className="text-3xl mb-3">💾</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                Saved Resumes
              </h4>
              <p className="text-gray-600 text-sm">View and edit your saved resumes</p>
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">💡 Pro Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold mb-1">Tailor Your Resume</h4>
                <p className="text-indigo-100 text-sm">Customize your resume for each job application to improve your chances</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold mb-1">Track Your Progress</h4>
                <p className="text-indigo-100 text-sm">Monitor your application success rate and adjust your strategy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Selector Modal */}
      {showResumeSelector && selectedJobForApplication && (
        <ResumeSelector
          selectedResumeId={selectedResumeId}
          onResumeSelect={handleResumeSelect}
          onConfirmApplication={handleConfirmApplication}
          onClose={handleCloseResumeSelector}
          jobTitle={selectedJobForApplication.title}
        />
      )}
    </div>
  )
} 

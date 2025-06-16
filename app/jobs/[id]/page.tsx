'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'
import ResumeSelector from '@/app/components/ResumeSelector'

interface JobDetailProps {
  params: Promise<{
    id: string
  }>
}

interface Job {
  id: string
  title: string
  description: string
  required_skills: string[]
  location: string
  job_type: string
  salary_range: string | null
  company_id: string
  status: string
  created_at: string
  companies?: {
    name: string
    description?: string
    website?: string
    industry?: string
    location?: string
  }
}

export default function JobDetail({ params }: JobDetailProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showResumeSelector, setShowResumeSelector] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  useEffect(() => {
    loadJobDetails()
    checkApplicationStatus()
  }, [resolvedParams.id])

  async function loadJobDetails() {
    try {
      setLoading(true)
      setError(null)
      
      // Load job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select(`
          *,
          companies (
            name,
            description,
            website,
            industry,
            location
          )
        `)
        .eq('id', resolvedParams.id)
        .eq('status', 'PUBLISHED')
        .single()

      if (jobError) {
        console.error('Job error:', jobError)
        setError('Job not found or no longer available')
        return
      }
      
      setJob(jobData)

    } catch (error: any) {
      console.error('Error loading job details:', error)
      setError('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  async function checkApplicationStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: application } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', resolvedParams.id)
        .eq('applicant_id', session.user.id)
        .single()

      setHasApplied(!!application)
    } catch (error) {
      // No application found, which is fine
    }
  }

  async function handleApply() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
        return
      }

      // Show resume selector instead of applying directly
      setSelectedResumeId(null)
      setShowResumeSelector(true)
    } catch (error) {
      console.error('Error preparing job application:', error)
      alert('Failed to prepare job application. Please try again.')
    }
  }

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId)
  }

  const handleConfirmApplication = async (resumeId: string) => {
    try {
      setApplying(true)

      const response = await fetch('/api/apply-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: resolvedParams.id,
          resumeId: resumeId
        }),
      })

      if (response.ok) {
        setHasApplied(true)
        setShowResumeSelector(false)
        setSelectedResumeId(null)
        alert('Application submitted successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to apply: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Failed to apply to job. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleCloseResumeSelector = () => {
    setShowResumeSelector(false)
    setSelectedResumeId(null)
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h3>
          <p className="text-gray-600 mb-8">{error || 'The job you\'re looking for doesn\'t exist or is no longer available.'}</p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Back to Dashboard
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
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-yellow-500 transition-colors"
              >
                <span className="text-xl mr-2">←</span>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Job Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              {!hasApplied ? (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {applying ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Applying...
                    </span>
                  ) : (
                    '📝 Apply Now'
                  )}
                </button>
              ) : (
                <div className="bg-green-100 text-green-800 px-6 py-2 rounded-lg font-medium">
                  ✅ Applied
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Job Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <p className="text-xl text-gray-600 mb-4">{job.companies?.name}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💼</span>
                  <span>{job.job_type.replace('_', ' ')}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center">
                    <span className="mr-2">💰</span>
                    <span>{job.salary_range}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="ml-6">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                Open Position
              </span>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🛠️ Required Skills</h3>
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

          {/* Apply Button */}
          <div className="flex justify-center">
            {!hasApplied ? (
              <button
                onClick={handleApply}
                disabled={applying}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {applying ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Applying...
                  </span>
                ) : (
                  '📝 Apply for this Position'
                )}
              </button>
            ) : (
              <div className="bg-green-100 text-green-800 px-8 py-3 rounded-lg font-bold text-lg">
                ✅ Application Submitted
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">📝 Job Description</h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {job.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Company Information */}
        {job.companies && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🏢 About {job.companies.name}</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {job.companies.description && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Company Overview</h4>
                    <p className="text-gray-700">{job.companies.description}</p>
                  </div>
                )}
                
                {job.companies.industry && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                    <p className="text-gray-700">{job.companies.industry}</p>
                  </div>
                )}
              </div>
              
              <div>
                {job.companies.location && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Headquarters</h4>
                    <p className="text-gray-700">{job.companies.location}</p>
                  </div>
                )}
                
                {job.companies.website && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Website</h4>
                    <a 
                      href={job.companies.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {job.companies.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Selector Modal */}
      {showResumeSelector && job && (
        <ResumeSelector
          selectedResumeId={selectedResumeId}
          onResumeSelect={handleResumeSelect}
          onConfirmApplication={handleConfirmApplication}
          onClose={handleCloseResumeSelector}
          jobTitle={job.title}
        />
      )}
    </div>
  )
} 
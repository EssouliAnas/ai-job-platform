'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface JobData {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary_range: string
  description: string
  requirements: string
  benefits: string
  required_skills: string[]
  nice_to_have_skills: string[]
  status: 'active' | 'closed' | 'draft'
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [jobData, setJobData] = useState<JobData>({
    id: '',
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    salary_range: '',
    description: '',
    requirements: '',
    benefits: '',
    required_skills: [],
    nice_to_have_skills: [],
    status: 'draft'
  })
  const [newRequiredSkill, setNewRequiredSkill] = useState('')
  const [newNiceToHaveSkill, setNewNiceToHaveSkill] = useState('')
  const router = useRouter()

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setJobData(prev => ({ ...prev, id: resolvedParams.id }))
      checkUserAndLoadJob(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  const checkUserAndLoadJob = async (jobId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/auth/sign-in')
        return
      }

      setUser(session.user)

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

      // Get company info
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userData.company_id)
        .single()

      if (companyError || !companyData) {
        router.push('/auth/company-sign-up')
        return
      }

      setCompany(companyData)

      // Load job data
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .eq('company_id', companyData.id)
        .single()

      if (jobError || !jobData) {
        router.push('/company/jobs')
        return
      }

      setJobData({
        ...jobData,
        required_skills: jobData.required_skills || [],
        nice_to_have_skills: jobData.nice_to_have_skills || []
      })

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!jobData.title || !company) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('job_postings')
        .update({
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          type: jobData.type,
          salary_range: jobData.salary_range,
          description: jobData.description,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          required_skills: jobData.required_skills,
          nice_to_have_skills: jobData.nice_to_have_skills,
          status: jobData.status
        })
        .eq('id', jobData.id)

      if (error) throw error

      alert('Job posting updated successfully!')
      router.push('/company/jobs')
    } catch (error) {
      console.error('Error updating job:', error)
      alert('Failed to update job posting. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim() && !jobData.required_skills.includes(newRequiredSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, newRequiredSkill.trim()]
      }))
      setNewRequiredSkill('')
    }
  }

  const removeRequiredSkill = (skill: string) => {
    setJobData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }))
  }

  const addNiceToHaveSkill = () => {
    if (newNiceToHaveSkill.trim() && !jobData.nice_to_have_skills.includes(newNiceToHaveSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        nice_to_have_skills: [...prev.nice_to_have_skills, newNiceToHaveSkill.trim()]
      }))
      setNewNiceToHaveSkill('')
    }
  }

  const removeNiceToHaveSkill = (skill: string) => {
    setJobData(prev => ({
      ...prev,
      nice_to_have_skills: prev.nice_to_have_skills.filter(s => s !== skill)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Edit Job Posting</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={jobData.department}
                  onChange={(e) => setJobData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="e.g., New York, NY or Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={jobData.type}
                  onChange={(e) => setJobData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={jobData.salary_range}
                  onChange={(e) => setJobData(prev => ({ ...prev, salary_range: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={jobData.status}
                  onChange={(e) => setJobData(prev => ({ ...prev, status: e.target.value as 'active' | 'closed' | 'draft' }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  rows={6}
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  rows={6}
                  value={jobData.requirements}
                  onChange={(e) => setJobData(prev => ({ ...prev, requirements: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                  placeholder="List the required qualifications, experience, and skills..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefits
                </label>
                <textarea
                  rows={4}
                  value={jobData.benefits}
                  onChange={(e) => setJobData(prev => ({ ...prev, benefits: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                  placeholder="Health insurance, 401k, flexible work, etc..."
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Requirements</h2>
            
            {/* Required Skills */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Required Skills
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRequiredSkill()
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addRequiredSkill}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Nice to Have Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Nice to Have Skills
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNiceToHaveSkill}
                  onChange={(e) => setNewNiceToHaveSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addNiceToHaveSkill()
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addNiceToHaveSkill}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobData.nice_to_have_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeNiceToHaveSkill(skill)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/company/jobs"
              className="bg-gray-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </span>
              ) : (
                'Update Job Posting'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
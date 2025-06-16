'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface JobFormData {
  title: string
  department: string
  location: string
  job_type: string
  salary_range: string
  description: string
  requirements: string
  benefits: string
  required_skills: string[]
  nice_to_have_skills: string[]
}

export default function NewJobPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    job_type: 'FULL_TIME',
    salary_range: '',
    description: '',
    requirements: '',
    benefits: '',
    required_skills: [],
    nice_to_have_skills: []
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
      }
    } catch (err: any) {
      console.error('Error checking user:', err)
      router.push('/auth/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      console.log('Submitting job with data:', {
        ...formData,
        company_id: company.id
      })

      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: formData.title,
          description: formData.description,
          required_skills: formData.required_skills,
          location: formData.location,
          job_type: formData.job_type,
          salary_range: formData.salary_range || null,
          company_id: company.id,
          status: 'PUBLISHED'
        })
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Job created successfully:', data)
      router.push('/company/dashboard')
    } catch (error: any) {
      console.error('Error creating job:', error)
      alert(`Error creating job posting: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const addSkill = (type: 'required_skills' | 'nice_to_have_skills', skill: string) => {
    if (skill.trim() && !formData[type].includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], skill.trim()]
      }))
    }
  }

  const removeSkill = (type: 'required_skills' | 'nice_to_have_skills', skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(skill => skill !== skillToRemove)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Post New Job</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Job Type *
                  </label>
                  <select
                    required
                    value={formData.job_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="$80,000 - $120,000"
                  />
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900"
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              />
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
              <textarea
                required
                rows={5}
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900"
                placeholder="List the required qualifications, experience, and skills..."
              />
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h3>
              <textarea
                rows={4}
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900"
                placeholder="Health insurance, 401k, flexible work hours, etc..."
              />
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Required Skills */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill('required_skills', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="Type a skill and press Enter"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('required_skills', skill)}
                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Nice to Have Skills */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nice to Have Skills</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill('nice_to_have_skills', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    placeholder="Type a skill and press Enter"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.nice_to_have_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('nice_to_have_skills', skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/company/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.description || !formData.location || formData.required_skills.length === 0}
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Job...
                  </span>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 

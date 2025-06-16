'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface Resume {
  id: string
  content: {
    personalInfo: any
    experiences: any[]
    education: any[]
    skills: any[]
    createdAt: string
  }
  feedback: any
  created_at: string
  updated_at: string
}

export default function SavedResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      loadResumes()
    } catch (err: any) {
      console.error('Error checking user:', err)
      setError(err.message)
    }
  }

  const loadResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (err) {
      console.error('Error loading resumes:', err)
      setError('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setResumes(resumes.filter(resume => resume.id !== resumeId))
        alert('Resume deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to delete resume: ${errorData.error}`)
      }
    } catch (err) {
      console.error('Error deleting resume:', err)
      alert('Failed to delete resume')
    }
  }

  const editResume = (resumeId: string) => {
    // Navigate to resume builder with the resume data
    router.push(`/resume-builder?edit=${resumeId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your resumes...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Saved Resumes</h1>
            </div>
            <Link
              href="/resume-builder"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              + Create New Resume
            </Link>
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

        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <span className="text-8xl">📄</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Saved Resumes</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              You haven't created any resumes yet. Start building your professional resume now!
            </p>
            <Link
              href="/resume-builder"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-all text-lg"
            >
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Resumes ({resumes.length})</h2>
              <div className="text-sm text-gray-600">
                Total: {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div key={resume.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {resume.content.personalInfo?.fullName || 'Untitled Resume'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {resume.content.personalInfo?.email || 'No email provided'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {resume.content.experiences?.length || 0} jobs
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🎓</span>
                      <span>{resume.content.education?.length || 0} education entries</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⚡</span>
                      <span>{resume.content.skills?.length || 0} skills</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📅</span>
                      <span>Updated {formatDate(resume.updated_at)}</span>
                    </div>
                  </div>

                  {resume.content.personalInfo?.summary && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {resume.content.personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {resume.content.skills && resume.content.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Top Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.content.skills.slice(0, 3).map((skill: any, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {skill.name}
                          </span>
                        ))}
                        {resume.content.skills.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{resume.content.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => editResume(resume.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
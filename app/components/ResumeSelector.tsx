'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface Resume {
  id: string
  name: string
  email: string
  skills: string[]
  experience: any[]
  education: any[]
  created_at: string
  updated_at: string
}

interface ResumeSelectorProps {
  selectedResumeId: string | null
  onResumeSelect: (resumeId: string) => void
  onConfirmApplication: (resumeId: string) => void
  onClose: () => void
  jobTitle: string
}

export default function ResumeSelector({
  selectedResumeId,
  onResumeSelect,
  onConfirmApplication,
  onClose,
  jobTitle
}: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: resumesData, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading resumes:', error)
        return
      }

      setResumes(resumesData || [])
    } catch (error) {
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmApplication = async () => {
    if (!selectedResumeId) return
    
    setApplying(true)
    try {
      await onConfirmApplication(selectedResumeId)
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-pink-400 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Resume for Application</h2>
              <p className="text-white/90">Choose which resume to use for: <span className="font-semibold">{jobTitle}</span></p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Resumes Found</h3>
              <p className="text-gray-600 mb-6">You need to create a resume before applying to jobs.</p>
              <Link
                href="/resume-builder"
                className="inline-block bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Create Your First Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Select the resume you'd like to use for this application:</p>
              
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedResumeId === resume.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onResumeSelect(resume.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="radio"
                        checked={selectedResumeId === resume.id}
                        onChange={() => onResumeSelect(resume.id)}
                        className="w-5 h-5 text-yellow-400 border-gray-300 focus:ring-yellow-400"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{resume.name}</h3>
                          <p className="text-gray-600">{resume.email}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Created: {formatDate(resume.created_at)}</p>
                          <p>Updated: {formatDate(resume.updated_at)}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Skills ({resume.skills?.length || 0})</p>
                          <div className="flex flex-wrap gap-1">
                            {(resume.skills || []).slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {(resume.skills?.length || 0) > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{(resume.skills?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Experience</p>
                          <p className="text-gray-600">{resume.experience?.length || 0} positions</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Education</p>
                          <p className="text-gray-600">{resume.education?.length || 0} entries</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {resumes.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedResumeId ? 'Resume selected. Ready to apply!' : 'Please select a resume to continue.'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApplication}
                disabled={!selectedResumeId || applying}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedResumeId && !applying
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {applying ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Applying...
                  </span>
                ) : (
                  'Apply with Selected Resume'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
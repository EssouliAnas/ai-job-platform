'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

interface CoverLetterData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address: string
  }
  jobInfo: {
    position: string
    company: string
    hiringManager: string
    jobSource: string
  }
  content: {
    introduction: string
    bodyParagraph1: string
    bodyParagraph2: string
    closing: string
  }
}

export default function CoverLetterPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('personal')
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [enhancingParagraph, setEnhancingParagraph] = useState<string | null>(null)
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    jobInfo: {
      position: '',
      company: '',
      hiringManager: '',
      jobSource: ''
    },
    content: {
      introduction: '',
      bodyParagraph1: '',
      bodyParagraph2: '',
      closing: ''
    }
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
      // Pre-fill email if available
      setCoverLetterData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          email: session.user.email || ''
        }
      }))
    } catch (err: any) {
      console.error('Error checking user:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async () => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: coverLetterData.personalInfo,
          jobInfo: coverLetterData.jobInfo,
          userBackground: 'Based on my experience and skills, I am seeking a position that allows me to contribute to innovative projects and grow professionally.'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate cover letter with AI')
      }

      const result = await response.json()
      
      if (result.success && result.coverLetter) {
        setCoverLetterData(prev => ({
          ...prev,
          content: result.coverLetter
        }))
      }
    } catch (error) {
      console.error('Error generating cover letter:', error)
      alert('Failed to generate cover letter with AI. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const exportToDOCX = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: coverLetterData,
          type: 'cover-letter',
          personalInfo: coverLetterData.personalInfo
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to export cover letter')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${coverLetterData.personalInfo.fullName || 'cover-letter'}_${coverLetterData.jobInfo.company || 'application'}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting cover letter:', error)
      alert('Failed to export cover letter. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handlePersonalInfoChange = (field: keyof CoverLetterData['personalInfo'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }))
  }

  const handleJobInfoChange = (field: keyof CoverLetterData['jobInfo'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      jobInfo: {
        ...prev.jobInfo,
        [field]: value
      }
    }))
  }

  const handleContentChange = (field: keyof CoverLetterData['content'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }))
  }

  const enhanceParagraph = async (paragraphType: keyof CoverLetterData['content']) => {
    const currentText = coverLetterData.content[paragraphType]
    
    if (!currentText.trim()) {
      alert('Please write some content first before enhancing.')
      return
    }

    setEnhancingParagraph(paragraphType)
    
    try {
      const response = await fetch('/api/enhance-paragraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentText,
          paragraphType: paragraphType,
          jobInfo: coverLetterData.jobInfo
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enhance paragraph')
      }

      const result = await response.json()
      
      if (result.success && result.enhancedText) {
        setCoverLetterData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            [paragraphType]: result.enhancedText
          }
        }))
      }
    } catch (error) {
      console.error('Error enhancing paragraph:', error)
      alert('Failed to enhance paragraph. Please try again.')
    } finally {
      setEnhancingParagraph(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading cover letter generator...</p>
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
              <h1 className="text-xl font-bold text-gray-900">AI Cover Letter Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={generateWithAI}
                disabled={generating || !coverLetterData.jobInfo.position || !coverLetterData.jobInfo.company}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating...
                  </span>
                ) : (
                  '🤖 Generate with AI'
                )}
              </button>
              <button 
                onClick={exportToDOCX}
                disabled={exporting}
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Exporting...
                  </span>
                ) : (
                  '📄 Download DOCX'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'personal', label: 'Personal Info', icon: '👤' },
                  { id: 'job', label: 'Job Details', icon: '💼' },
                  { id: 'content', label: 'Content', icon: '✍️' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={coverLetterData.personalInfo.fullName}
                      onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={coverLetterData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={coverLetterData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={coverLetterData.personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Job Information */}
            {activeSection === 'job' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      value={coverLetterData.jobInfo.position}
                      onChange={(e) => handleJobInfoChange('position', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={coverLetterData.jobInfo.company}
                      onChange={(e) => handleJobInfoChange('company', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="TechCorp Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hiring Manager Name
                    </label>
                    <input
                      type="text"
                      value={coverLetterData.jobInfo.hiringManager}
                      onChange={(e) => handleJobInfoChange('hiringManager', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      placeholder="Jane Smith (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      How did you find this job?
                    </label>
                    <select
                      value={coverLetterData.jobInfo.jobSource}
                      onChange={(e) => handleJobInfoChange('jobSource', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-gray-900"
                    >
                      <option value="">Select source (optional)</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Indeed">Indeed</option>
                      <option value="company website">Company website</option>
                      <option value="a referral">A referral</option>
                      <option value="job fair">Job fair</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">💡</span>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">AI Generation Tips</h3>
                      <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Fill in at least the position and company name for best results</li>
                        <li>• Include the hiring manager's name if you know it</li>
                        <li>• Mention how you found the job to show your proactive approach</li>
                        <li>• The AI will customize content based on the job type you enter</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Cover Letter Content</h2>
                  <span className="text-sm text-gray-500">
                    {coverLetterData.content.introduction || coverLetterData.content.bodyParagraph1 || coverLetterData.content.bodyParagraph2 || coverLetterData.content.closing ? 'Content added' : 'Use AI to generate or write manually'}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Introduction Paragraph
                      </label>
                      <button
                        onClick={() => enhanceParagraph('introduction')}
                        disabled={!coverLetterData.content.introduction.trim() || enhancingParagraph === 'introduction'}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enhancingParagraph === 'introduction' ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                            Enhancing...
                          </span>
                        ) : (
                          '✨ Enhance with AI'
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={coverLetterData.content.introduction}
                      onChange={(e) => handleContentChange('introduction', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                      placeholder="Start with your interest in the position and how you learned about it..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Body Paragraph 1 - Your Experience & Skills
                      </label>
                      <button
                        onClick={() => enhanceParagraph('bodyParagraph1')}
                        disabled={!coverLetterData.content.bodyParagraph1.trim() || enhancingParagraph === 'bodyParagraph1'}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enhancingParagraph === 'bodyParagraph1' ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                            Enhancing...
                          </span>
                        ) : (
                          '✨ Enhance with AI'
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={coverLetterData.content.bodyParagraph1}
                      onChange={(e) => handleContentChange('bodyParagraph1', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                      placeholder="Highlight your relevant experience, skills, and achievements..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Body Paragraph 2 - Why This Company
                      </label>
                      <button
                        onClick={() => enhanceParagraph('bodyParagraph2')}
                        disabled={!coverLetterData.content.bodyParagraph2.trim() || enhancingParagraph === 'bodyParagraph2'}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enhancingParagraph === 'bodyParagraph2' ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                            Enhancing...
                          </span>
                        ) : (
                          '✨ Enhance with AI'
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={coverLetterData.content.bodyParagraph2}
                      onChange={(e) => handleContentChange('bodyParagraph2', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                      placeholder="Explain why you want to work for this specific company and how you can contribute..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Closing Paragraph
                      </label>
                      <button
                        onClick={() => enhanceParagraph('closing')}
                        disabled={!coverLetterData.content.closing.trim() || enhancingParagraph === 'closing'}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enhancingParagraph === 'closing' ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                            Enhancing...
                          </span>
                        ) : (
                          '✨ Enhance with AI'
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={coverLetterData.content.closing}
                      onChange={(e) => handleContentChange('closing', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
                      placeholder="Thank them and express your enthusiasm for next steps..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h3>
                
                {/* Cover Letter Preview */}
                <div className="bg-white rounded-lg p-6 min-h-[600px] text-sm font-serif leading-relaxed text-black border border-gray-200">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="text-right mb-6">
                      <div className="font-semibold text-black">{coverLetterData.personalInfo.fullName || 'Your Name'}</div>
                      {coverLetterData.personalInfo.email && <div className="text-black">{coverLetterData.personalInfo.email}</div>}
                      {coverLetterData.personalInfo.phone && <div className="text-black">{coverLetterData.personalInfo.phone}</div>}
                      {coverLetterData.personalInfo.address && <div className="text-black">{coverLetterData.personalInfo.address}</div>}
                    </div>
                    
                    <div className="text-right text-black text-xs mb-6">
                      {new Date().toLocaleDateString()}
                    </div>

                    {coverLetterData.jobInfo.company && (
                      <div className="mb-6">
                        <div className="font-semibold text-black">{coverLetterData.jobInfo.hiringManager || 'Hiring Manager'}</div>
                        <div className="text-black">{coverLetterData.jobInfo.company}</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-4 text-black">
                    {coverLetterData.content.introduction && (
                      <p className="text-black">{coverLetterData.content.introduction}</p>
                    )}
                    
                    {coverLetterData.content.bodyParagraph1 && (
                      <p className="text-black">{coverLetterData.content.bodyParagraph1}</p>
                    )}
                    
                    {coverLetterData.content.bodyParagraph2 && (
                      <p className="text-black">{coverLetterData.content.bodyParagraph2}</p>
                    )}
                    
                    {coverLetterData.content.closing && (
                      <p className="whitespace-pre-line text-black">{coverLetterData.content.closing}</p>
                    )}
                  </div>

                  {!coverLetterData.content.introduction && !coverLetterData.content.bodyParagraph1 && (
                    <div className="text-center text-gray-400 py-12">
                      <span className="text-4xl block mb-4">✍️</span>
                      <p>Your cover letter content will appear here</p>
                      <p className="text-xs mt-2">Fill in job details and use AI generation or write manually</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

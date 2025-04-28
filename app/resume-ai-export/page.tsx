'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ResumeTemplate {
  id: string;
  name: string;
  previewImage: string; 
  description: string;
}

export default function ResumeAIExportPage() {
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [enhancementLevel, setEnhancementLevel] = useState<string>('moderate');
  const [targetRole, setTargetRole] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState<string | null>(null);
  
  // Mock resume data
  const resumes = [
    { id: 'resume1', name: 'Software Developer Resume' },
    { id: 'resume2', name: 'UI/UX Designer Resume' },
    { id: 'resume3', name: 'Project Manager Resume' },
  ];
  
  // Resume templates
  const templates: ResumeTemplate[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      previewImage: '/modern-resume.png',
      description: 'Clean and contemporary design with a sidebar for skills and contact information'
    },
    {
      id: 'classic',
      name: 'Classic Elegant',
      previewImage: '/classic-resume.png',
      description: 'Traditional format with clear section headers, ideal for corporate environments'
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      previewImage: '/creative-resume.png',
      description: 'Visually striking layout with color accents, perfect for design roles'
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      previewImage: '/minimal-resume.png',
      description: 'Streamlined and efficient design focusing on content over styling'
    }
  ];

  const handleGenerate = async () => {
    if (!selectedResume) {
      alert('Please select a resume');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call to OpenAI for content enhancement and document generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // In a real application, this would be a URL to the generated PDF/DOCX file
    // For this demo, we'll just simulate success
    setGeneratedResumeUrl('https://example.com/generated-resume.pdf');
    
    setIsGenerating(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Export</h1>
          <p className="mt-1 text-sm text-gray-500">
            Transform your resume with AI enhancement and professional formatting
          </p>
        </header>
        
        {!generatedResumeUrl ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <div className="space-y-8">
              {/* Resume Selection */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">1. Select Your Resume</h2>
                <p className="text-sm text-gray-500 mb-4">Choose a resume to enhance and export</p>
                
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a resume</option>
                  {resumes.map(resume => (
                    <option key={resume.id} value={resume.id}>{resume.name}</option>
                  ))}
                </select>
                
                <p className="mt-2 text-sm text-gray-500">
                  Don't have a resume yet?{' '}
                  <Link href="/resume-builder" className="text-blue-600 hover:text-blue-500">
                    Create one now
                  </Link>
                </p>
              </div>
              
              {/* Template Selection */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">2. Choose a Template</h2>
                <p className="text-sm text-gray-500 mb-4">Select a professional design for your resume</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded mb-3">
                        {/* In a real app, this would display the actual template preview image */}
                        <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-400 text-sm">
                          {template.name} Preview
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Enhancement Options */}
              <div>
                <h2 className="text-lg font-medium text-gray-900">3. AI Enhancement Options</h2>
                <p className="text-sm text-gray-500 mb-4">Customize how AI improves your resume</p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="enhancement-level" className="block text-sm font-medium text-gray-700">
                      Enhancement Level
                    </label>
                    <select
                      id="enhancement-level"
                      value={enhancementLevel}
                      onChange={(e) => setEnhancementLevel(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="light">Light - Minor improvements to language and formatting</option>
                      <option value="moderate">Moderate - Rewrite descriptions and improve structure</option>
                      <option value="complete">Complete - Comprehensive rewrite and optimization</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="target-role" className="block text-sm font-medium text-gray-700">
                      Target Role (Optional)
                    </label>
                    <input
                      type="text"
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Software Engineer, Marketing Manager"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      AI will tailor your resume to this specific role if provided
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedResume || isGenerating}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating your enhanced resume...
                    </>
                  ) : (
                    'Generate Enhanced Resume'
                  )}
                </button>
                
                <p className="mt-2 text-xs text-center text-gray-500">
                  This process will use AI to improve your resume content and format it according to the selected template
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-gray-900">Your Enhanced Resume is Ready!</h2>
            <p className="mt-2 text-gray-500">We've enhanced your resume with AI and formatted it professionally</p>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.open(generatedResumeUrl || '#', '_blank')}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Download Resume
              </button>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setGeneratedResumeUrl(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Make Changes
                </button>
                
                <Link
                  href="/job-match"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Find Matching Jobs
                </Link>
              </div>
            </div>
            
            <div className="mt-12 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">AI Improvements Made:</h3>
              <ul className="mt-4 text-sm text-left text-gray-700 max-w-md mx-auto space-y-2">
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rewrote job descriptions to highlight measurable achievements
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Strengthened action verbs and eliminated passive language
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tailored content to match keywords from the target role
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Created a compelling professional summary that highlights your unique value
                </li>
                <li className="flex">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Applied professional formatting and consistent styling throughout
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
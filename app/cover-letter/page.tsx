'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CoverLetterPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set sample cover letter
    setCoverLetter(`
Dear Hiring Manager,

I am excited to apply for the position at your company as described in the job posting. With my background and experience, I believe I would be an excellent fit for this role.

The job description mentions that you're looking for someone with expertise in key areas that align perfectly with my professional experience. Throughout my career, I have consistently demonstrated these skills and qualities.

In my previous role, I successfully led projects that required strong collaboration and technical expertise. I'm particularly proud of my ability to deliver results while maintaining high standards of quality.

I am excited about the opportunity to bring my unique blend of skills and experience to your team. The company's mission and values resonate with me, and I would welcome the chance to contribute to your continued success.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit your organization.

Sincerely,
[Your Name]
    `);
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Cover Letter Generator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate a tailored cover letter based on your resume and the job description
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                      Select your resume
                    </label>
                    <select
                      id="resume"
                      name="resume"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a resume</option>
                      <option value="resume1">My Software Engineer Resume</option>
                      <option value="resume2">My Project Manager Resume</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      <Link href="/resume-builder" className="text-blue-600 hover:text-blue-500">
                        Create a new resume
                      </Link> if you don&apos;t have one yet
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description
                    </label>
                    <textarea
                      id="jobDescription"
                      name="jobDescription"
                      rows={8}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Paste the job description here..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                      Tone
                    </label>
                    <select
                      id="tone"
                      name="tone"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="formal">Formal</option>
                      <option value="conversational">Conversational</option>
                    </select>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Generating...' : 'Generate Cover Letter'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cover Letter</h2>
              
              {coverLetter ? (
                <div className="border rounded-md p-6 bg-gray-50">
                  <div className="whitespace-pre-line font-serif text-gray-800">
                    {coverLetter}
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => alert('Download functionality would be implemented here')}
                    >
                      Download as PDF
                    </button>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => alert('Copy functionality would be implemented here')}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>Your cover letter will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
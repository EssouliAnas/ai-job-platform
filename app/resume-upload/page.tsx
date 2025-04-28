'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate API call for file upload and AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Sample feedback data
    const feedbackData = {
      overallScore: 72,
      summary: "Your resume has many strong points but could use improvements in a few key areas to maximize its impact.",
      sectionFeedback: {
        contact: { score: 90, feedback: "Contact information is clear and comprehensive." },
        summary: { score: 65, feedback: "Your professional summary could be more impactful by highlighting specific achievements." },
        experience: { score: 75, feedback: "Work experience is well-structured, but achievements could be quantified better." },
        education: { score: 85, feedback: "Education section is clear and relevant." },
        skills: { score: 60, feedback: "Consider organizing your skills into categories and highlighting those most relevant to your target role." }
      },
      missingElements: [
        "LinkedIn profile URL",
        "Quantifiable achievements in most recent role"
      ],
      improvementSuggestions: [
        "Use more action verbs at the beginning of bullet points",
        "Quantify achievements with specific metrics where possible",
        "Tailor skills section to match job descriptions in your field"
      ],
      grammarAndTone: { score: 80, feedback: "Generally good writing with clear, professional language. A few minor inconsistencies in tense." }
    };
    
    setFeedback(feedbackData);
    setUploadComplete(true);
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resume Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload your existing resume and get detailed AI feedback
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              {!uploadComplete ? (
                <form onSubmit={handleSubmit}>
                  <div 
                    className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, or DOCX up to 10MB</p>
                    </div>
                  </div>
                  
                  {file && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!file || isUploading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isUploading ? 'Analyzing Resume...' : 'Upload & Analyze'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Resume analyzed successfully!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    See your detailed feedback in the panel to the right
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setUploadComplete(false);
                        setFeedback(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Upload Another Resume
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Feedback</h2>
              
              {feedback ? (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold mr-4">
                      {feedback.overallScore}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Overall Score</h3>
                      <p className="text-sm text-gray-500">out of 100</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{feedback.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Section Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(feedback.sectionFeedback).map(([section, data]: [string, any]) => (
                        <div key={section} className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 text-sm font-medium mr-3">
                            {data.score}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                            <p className="text-sm text-gray-600">{data.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Improvement Suggestions</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {feedback.improvementSuggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      href="/resume-builder"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create New Resume
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Upload a resume to get detailed feedback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
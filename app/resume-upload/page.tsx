'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock parser function for debugging
const parseMockResume = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
John Doe
Software Engineer

SUMMARY
Experienced software engineer with 5 years of experience in full-stack web development using React, Node.js, and AWS.

EXPERIENCE
Senior Software Engineer | ABC Tech (2020-Present)
- Developed and maintained React applications for enterprise clients
- Implemented CI/CD pipelines using GitHub Actions
- Reduced API response time by 40% through caching and optimization

Software Engineer | XYZ Corp (2018-2020)
- Built RESTful APIs using Node.js and Express
- Collaborated with UX designers to implement responsive UI components
- Participated in agile development processes

EDUCATION
Bachelor of Science in Computer Science, University of Technology (2014-2018)

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, AWS, Docker
Soft: Problem-solving, Communication, Teamwork, Time management
      `);
    }, 1000);
  });
};

// Mock AI analysis function
const mockAnalyzeResume = async (resumeContent: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        overallScore: 85,
        summary: "Strong technical resume with good experience progression. Could benefit from more quantified achievements and a stronger professional summary.",
        sectionAnalysis: {
          structure: {
            score: 88,
            feedback: "Well-organized resume with clear sections and logical flow. Good use of headings and consistent formatting.",
            strengths: ["Clear section divisions", "Consistent formatting", "Professional layout"],
            improvements: ["Add more white space", "Consider using bullet points more effectively"]
          },
          language: {
            score: 90,
            feedback: "Professional tone with excellent grammar and clarity throughout the document.",
            strengths: ["Professional tone", "Clear communication", "Error-free grammar"],
            improvements: ["Use more action verbs", "Vary sentence structure"]
          },
          experienceMatch: {
            score: 82,
            feedback: "Strong work experience with good progression, but could benefit from more quantified achievements.",
            strengths: ["Clear job progression", "Relevant experience", "Good company names"],
            improvements: ["Add quantified results", "Include more specific achievements", "Highlight leadership roles"]
          },
          skillsPresentation: {
            score: 85,
            feedback: "Comprehensive technical skills section with relevant technologies listed.",
            strengths: ["Relevant technical skills", "Good categorization", "Current technologies"],
            improvements: ["Add proficiency levels", "Include soft skills", "Prioritize most relevant skills"]
          },
          education: {
            score: 88,
            feedback: "Education section is well-presented with relevant degree and institution.",
            strengths: ["Relevant degree", "Clear formatting", "Proper chronology"],
            improvements: ["Add relevant coursework", "Include GPA if strong", "Mention academic achievements"]
          }
        },
        missingElements: [
          "Professional certifications",
          "Portfolio or project links",
          "Volunteer experience",
          "Professional summary section"
        ],
        improvementSuggestions: [
          {
            category: "High Priority",
            suggestions: [
              "Add quantified achievements (e.g., 'Increased performance by 40%')",
              "Include a compelling professional summary",
              "Add links to GitHub or portfolio projects"
            ]
          },
          {
            category: "Medium Priority",
            suggestions: [
              "Consider adding relevant certifications",
              "Include volunteer or side project experience",
              "Optimize for ATS with relevant keywords"
            ]
          },
          {
            category: "Low Priority",
            suggestions: [
              "Add professional references section",
              "Consider including languages spoken",
              "Add interests/hobbies if relevant to role"
            ]
          }
        ],
        atsCompatibility: {
          score: 78,
          feedback: "Resume is generally ATS-friendly but could be optimized further with better keyword usage and formatting.",
          issues: ["Limited use of industry keywords", "Some formatting may not parse well"],
          recommendations: ["Use standard section headings", "Include more relevant keywords", "Avoid complex formatting"]
        },
        industryRelevance: {
          detectedIndustry: "Software Development",
          relevanceScore: 88,
          feedback: "Resume is well-tailored for software development roles with relevant technical skills and experience.",
          keywords: ["JavaScript", "React", "Node.js", "Python", "AWS", "Git", "Agile"]
        }
      });
    }, 2000);
  });
};

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [useAlternateMode, setUseAlternateMode] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    openaiKey: boolean;
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    openaiKey: false
  });

  // Add debug log function
  const addDebugLog = (message: string) => {
    setDebugLog((prevLogs) => [...prevLogs, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };

  // Check environment variables
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        addDebugLog("Checking environment...");
        const response = await fetch('/api/check-env');
        if (response.ok) {
          const data = await response.json();
          setEnvStatus({
            supabaseUrl: data.supabaseUrl || false,
            supabaseAnonKey: data.supabaseAnonKey || false,
            openaiKey: data.openaiKey || false
          });
          addDebugLog(`Environment check complete: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.error('Failed to check environment:', err);
        addDebugLog(`Environment check failed: ${err}`);
      }
    };

    checkEnvironment();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setDetailedError(null);
      addDebugLog(`File selected: ${e.target.files[0].name}, size: ${e.target.files[0].size} bytes`);
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
      const droppedFile = e.dataTransfer.files[0];
      const fileType = droppedFile.name.split('.').pop()?.toLowerCase();
      
      if (!['pdf', 'doc', 'docx'].includes(fileType || '')) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        addDebugLog(`Invalid file type: ${fileType}`);
        return;
      }
      
      setFile(droppedFile);
      setError(null);
      setDetailedError(null);
      addDebugLog(`File dropped: ${droppedFile.name}, size: ${droppedFile.size} bytes`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setDetailedError(null);
    addDebugLog('Starting upload process...');
    
    if (useAlternateMode) {
      // Use direct method for debugging bypassing the API
      try {
        addDebugLog('Using alternate mode (local processing)');
        // Mock parsing the resume
        const resumeContent = await parseMockResume(file);
        addDebugLog('Resume parsed successfully');
        
        // Mock AI analysis
        const feedbackData = await mockAnalyzeResume(resumeContent);
        addDebugLog('AI analysis complete');
    
        setFeedback(feedbackData);
        setUploadComplete(true);
        addDebugLog('Alternate mode analysis complete');
      } catch (error: any) {
        setError('Error in alternate mode analysis');
        setDetailedError(error.message || 'Unknown error');
        addDebugLog(`Alternate mode error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
      return;
    }
    
    try {
      addDebugLog('Preparing form data for API submission');
      const formData = new FormData();
      formData.append('file', file);
      
      addDebugLog('Sending request to /api/resume-analysis');
      const response = await fetch('/api/resume-analysis', {
        method: 'POST',
        body: formData,
      });
      
      addDebugLog(`API response received: status ${response.status}`);
      const data = await response.json();
      addDebugLog('Response JSON parsed');
      
      if (!response.ok) {
        let errorMessage = data.error || 'Failed to analyze resume';
        let detailedErrorMessage = data.details || null;
        
        addDebugLog(`Error: ${errorMessage}, Details: ${detailedErrorMessage}`);
        throw new Error(errorMessage, { cause: detailedErrorMessage });
      }
      
      addDebugLog('Setting feedback data');
      setFeedback(data.feedback);
      setUploadComplete(true);
      addDebugLog('Upload and analysis complete');
    } catch (error: any) {
      addDebugLog(`Error caught: ${error.message}`);
      setError(error.message || 'Failed to analyze resume');
      setDetailedError(error.cause || 'Please check your API keys and Supabase configuration.');
      console.error('Error during resume analysis:', error);
    } finally {
      setIsUploading(false);
      addDebugLog('Upload process finished');
    }
  };

  // Check if environment is correctly set up
  const isEnvironmentReady = envStatus.supabaseUrl && envStatus.supabaseAnonKey && envStatus.openaiKey;

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
              <h1 className="text-xl font-bold text-gray-900">AI Resume Analysis</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Resume for <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">AI Analysis</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Get detailed AI feedback on your resume content, structure, and optimization suggestions to land your dream job.
          </p>
        </div>
        
        {!isEnvironmentReady && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Configuration Warning</h3>
                <div className="text-yellow-800">
                  <p className="mb-3">The resume analysis feature requires proper configuration to work correctly. Please check:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {!envStatus.supabaseUrl && (
                      <li>Supabase URL is not configured</li>
                    )}
                    {!envStatus.supabaseAnonKey && (
                      <li>Supabase Anonymous Key is not configured</li>
                    )}
                    {!envStatus.openaiKey && (
                      <li>OpenAI API Key is not configured</li>
                    )}
                    <li>Check your .env.local file and ensure all keys are properly set</li>
                    <li>Visit <code className="bg-yellow-100 px-2 py-1 rounded text-xs">/api/create-storage-bucket</code> to create the Supabase storage bucket</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {!uploadComplete ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Resume</h3>
                <form onSubmit={handleSubmit}>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      isDragging ? 'border-yellow-400 bg-yellow-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">📄</span>
                      </div>
                      <div>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all inline-block"
                        >
                          Choose File
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-gray-600 mt-2">or drag and drop your file here</p>
                      </div>
                      <p className="text-sm text-gray-500">Supports PDF, DOC, and DOCX files up to 10MB</p>
                      
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 font-medium">{error}</p>
                          {detailedError && (
                            <p className="text-red-600 text-sm mt-2">{detailedError}</p>
                          )}
                          <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                            <p className="font-medium">Troubleshooting:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Check if your Supabase storage bucket is correctly set up</li>
                              <li>Verify your OpenAI API key is properly configured</li>
                              <li>Make sure the file format is supported (.pdf, .doc, .docx)</li>
                              <li>Try with a smaller file (less than 10MB)</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {file && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600">📄</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setError(null);
                            setDetailedError(null);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      id="use-alternate-mode"
                      name="use-alternate-mode"
                      type="checkbox"
                      checked={useAlternateMode}
                      onChange={(e) => {
                        setUseAlternateMode(e.target.checked);
                        addDebugLog(`Alternate mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                      }}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="use-alternate-mode" className="ml-3 text-sm text-blue-800 font-medium">
                      Use offline mode (bypass API for debugging)
                    </label>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={!file || isUploading || (!isEnvironmentReady && !useAlternateMode)}
                      className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-4 px-6 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                          Analyzing Resume with AI...
                        </span>
                      ) : !isEnvironmentReady && !useAlternateMode ? 'Environment Not Configured' : '🤖 Analyze Resume with AI'}
                    </button>
                  </div>
                  
                  {/* Debug log display */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-700 max-h-48 overflow-y-auto">
                    <div className="font-semibold mb-2 text-gray-900">Debug Log:</div>
                    {debugLog.length === 0 && <div className="text-gray-500">No log entries yet</div>}
                    {debugLog.map((log, index) => (
                      <div key={index} className="font-mono text-xs mb-1">{log}</div>
                    ))}
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analysis Complete!</h3>
                <p className="text-gray-600 mb-8">
                  Your resume has been successfully analyzed. Check the detailed feedback on the right.
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setUploadComplete(false);
                      setFeedback(null);
                      setError(null);
                      setDetailedError(null);
                      addDebugLog('Reset to upload another resume');
                    }}
                    className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Analyze Another Resume
                  </button>
                  <Link
                    href="/resume-builder"
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all text-center"
                  >
                    Create New Resume
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Feedback Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">AI Analysis Results</h3>
            
            {feedback ? (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl border border-yellow-200">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {feedback.overallScore}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Overall Score</h4>
                  <p className="text-gray-600">out of 100</p>
                </div>
                
                {/* Summary */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">📋 Executive Summary</h4>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{feedback.summary}</p>
                </div>

                {/* Industry Relevance */}
                {feedback.industryRelevance && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">🎯 Industry Relevance</h4>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold mr-3">
                        {feedback.industryRelevance.relevanceScore}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Detected Industry: {feedback.industryRelevance.detectedIndustry}</p>
                        <p className="text-gray-700 text-sm">{feedback.industryRelevance.feedback}</p>
                      </div>
                    </div>
                    {feedback.industryRelevance.keywords && feedback.industryRelevance.keywords.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Relevant Keywords Found:</p>
                        <div className="flex flex-wrap gap-2">
                          {feedback.industryRelevance.keywords.map((keyword: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Section Analysis */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Detailed Section Analysis</h4>
                  <div className="space-y-6">
                    {Object.entries(feedback.sectionAnalysis || {}).map(([section, data]: [string, any]) => (
                      <div key={section} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold mr-4">
                            {data.score}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900 capitalize mb-1">
                              {section === 'structure' && '🧱 Structure'}
                              {section === 'language' && '✍️ Language & Grammar'}
                              {section === 'experienceMatch' && '💼 Experience'}
                              {section === 'skillsPresentation' && '🛠️ Skills'}
                              {section === 'education' && '🎓 Education'}
                            </h5>
                            <p className="text-gray-700 text-sm mb-3">{data.feedback}</p>
                            
                            {data.strengths && data.strengths.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-semibold text-green-700 mb-1">Strengths:</p>
                                <ul className="text-xs text-green-600 space-y-1">
                                  {data.strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="flex items-center">
                                      <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {data.improvements && data.improvements.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-orange-700 mb-1">Areas for Improvement:</p>
                                <ul className="text-xs text-orange-600 space-y-1">
                                  {data.improvements.map((improvement: string, idx: number) => (
                                    <li key={idx} className="flex items-center">
                                      <span className="w-1 h-1 bg-orange-500 rounded-full mr-2"></span>
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS Compatibility */}
                {feedback.atsCompatibility && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">🤖 ATS Compatibility</h4>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-3">
                        {feedback.atsCompatibility.score}
                      </div>
                      <p className="text-gray-700">{feedback.atsCompatibility.feedback}</p>
                    </div>
                    
                    {feedback.atsCompatibility.issues && feedback.atsCompatibility.issues.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-red-700 mb-2">Issues Found:</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {feedback.atsCompatibility.issues.map((issue: string, idx: number) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">!</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {feedback.atsCompatibility.recommendations && feedback.atsCompatibility.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-2">Recommendations:</p>
                        <ul className="text-sm text-blue-600 space-y-1">
                          {feedback.atsCompatibility.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-2">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Missing Elements */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">❌ Missing Elements</h4>
                  <ul className="space-y-2">
                    {feedback.missingElements.map((element: string, index: number) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-3">!</span>
                        {element}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Improvement Suggestions */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">💡 Improvement Suggestions</h4>
                  <div className="space-y-4">
                    {feedback.improvementSuggestions.map((category: any, index: number) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {category.category === 'High Priority' && '🔥 High Priority'}
                          {category.category === 'Medium Priority' && '⚡ Medium Priority'}
                          {category.category === 'Low Priority' && '💭 Low Priority'}
                        </h5>
                        <ul className="space-y-1">
                          {category.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="flex items-start text-gray-700 text-sm">
                              <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <p className="text-center text-gray-600">
                  Upload your resume to get detailed AI analysis and feedback
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 

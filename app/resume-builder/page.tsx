'use client';

import { useState } from 'react';
import Link from 'next/link';

type WizardStep = 'basicInfo' | 'education' | 'experience' | 'skills' | 'additional';

// Define the resume data structure
interface Education {
  institution: string;
  degree: string;
  date: string;
}

interface Experience {
  company: string;
  position: string;
  date: string;
  responsibilities: string[];
  achievements: string[];
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ResumeData {
  summary: string;
  contact: {
    name: string;
    title: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skills;
  certifications: string[];
  languages: string[];
  hobbies: string[];
}

export default function ResumeBuilderPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basicInfo');
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    education: [] as string[],
    workExperience: [] as string[],
    skills: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
    hobbies: [] as string[]
  });
  
  // Input states for array fields
  const [newEducation, setNewEducation] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHobby, setNewHobby] = useState('');

  const steps: WizardStep[] = ['basicInfo', 'education', 'experience', 'skills', 'additional'];

  // Add an item to an array field
  const addItem = (key: keyof typeof formData, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [key]: [...(prev[key] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  // Remove an item from an array field
  const removeItem = (key: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((_, i) => i !== index)
    }));
  };

  // Handle navigation between steps
  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      // On last step, generate resume
      handleGenerateResume();
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit the form to generate a resume
  const handleGenerateResume = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create the initial resume data
    const initialResumeData: ResumeData = {
      summary: 'Professional summary would appear here based on your input.',
      contact: { name: formData.fullName, title: formData.jobTitle },
      education: formData.education.map(edu => {
        const parts = edu.split(',');
        return {
          institution: parts[0] || 'Institution',
          degree: parts[1] || 'Degree',
          date: parts[2] || 'Date range'
        };
      }),
      experience: formData.workExperience.map(exp => {
        const parts = exp.split(',');
        return {
          company: parts[0] || 'Company',
          position: parts[1] || 'Position',
          date: parts[2] || 'Date range',
          responsibilities: ['Responsibility details would be generated from your input'],
          achievements: ['Achievements would be generated from your input']
        };
      }),
      skills: {
        technical: formData.skills.filter((_, i) => i % 2 === 0),
        soft: formData.skills.filter((_, i) => i % 2 === 1),
      },
      certifications: formData.certifications,
      languages: formData.languages,
      hobbies: formData.hobbies
    };
    
    setResumeData(initialResumeData);
    setLoading(false);
  };

  // Enhance the resume with AI
  const handleEnhanceResume = async () => {
    if (!resumeData) return;
    
    setEnhancing(true);
    
    // Simulate AI enhancement (in a real app, this would call the OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create an enhanced version of the resume
    const enhancedResume: ResumeData = {
      ...resumeData,
      summary: 'Results-driven professional with a proven track record of success in ' + 
               formData.jobTitle + ' roles. Adept at leveraging ' + 
               resumeData.skills.technical.slice(0, 3).join(', ') + 
               ' to deliver innovative solutions that drive business growth and efficiency.',
      experience: resumeData.experience.map(exp => ({
        ...exp,
        responsibilities: [
          'Led cross-functional teams to deliver high-impact projects on time and under budget',
          'Implemented innovative solutions that increased efficiency by 30%',
          'Collaborated with stakeholders to align technical solutions with business objectives'
        ],
        achievements: [
          'Reduced development time by 25% through implementation of automated testing',
          'Recognized with Excellence Award for outstanding contributions to team success',
          'Mentored junior team members, improving team productivity by 15%'
        ]
      }))
    };
    
    setResumeData(enhancedResume);
    setEnhancing(false);
  };

  // Handle download as PDF or DOCX (in a real app, this would generate a document)
  const handleDownload = (format: 'pdf' | 'docx') => {
    alert(`In a production app, this would download your resume as a ${format.toUpperCase()} file using a document generation API or library.`);
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basicInfo':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Let's start with the basics</h2>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                What's your full name?
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. John Smith"
              />
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                What job title or role are you targeting?
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Software Engineer, Project Manager"
              />
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Tell us about your education</h2>
            
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Add your education history (one at a time)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Stanford University, BS in Computer Science, 2015-2019"
                />
                <button
                  type="button"
                  onClick={() => addItem('education', newEducation, setNewEducation)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added education items */}
              <div className="mt-4 space-y-2">
                {formData.education.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2">
                    <span className="text-sm">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('education', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">What's your work experience?</h2>
            
            <div>
              <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700">
                Add your work experience (one at a time)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Google, Software Engineer, 2019-2022"
                />
                <button
                  type="button"
                  onClick={() => addItem('workExperience', newExperience, setNewExperience)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added work experience items */}
              <div className="mt-4 space-y-2">
                {formData.workExperience.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2">
                    <span className="text-sm">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('workExperience', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">What skills do you have?</h2>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Add your skills (one at a time)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. JavaScript, Project Management, Communication"
                />
                <button
                  type="button"
                  onClick={() => addItem('skills', newSkill, setNewSkill)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added skills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.skills.map((item, index) => (
                  <div key={index} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem('skills', index)}
                      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'additional':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Let's add some final details</h2>
            
            {/* Certifications */}
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                Add certifications or awards (optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
                <button
                  type="button"
                  onClick={() => addItem('certifications', newCertification, setNewCertification)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added certifications */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.certifications.map((item, index) => (
                  <div key={index} className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem('certifications', index)}
                      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-200 text-green-600 hover:bg-green-300"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Languages */}
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                What languages do you speak?
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. English (Native), Spanish (Fluent)"
                />
                <button
                  type="button"
                  onClick={() => addItem('languages', newLanguage, setNewLanguage)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added languages */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.languages.map((item, index) => (
                  <div key={index} className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem('languages', index)}
                      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hobbies */}
            <div>
              <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">
                Any hobbies or interests? (optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Photography, Chess, Marathon Running"
                />
                <button
                  type="button"
                  onClick={() => addItem('hobbies', newHobby, setNewHobby)}
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              
              {/* Show added hobbies */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.hobbies.map((item, index) => (
                  <div key={index} className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem('hobbies', index)}
                      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-200 text-yellow-600 hover:bg-yellow-300"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Answer a few questions and we'll generate a professional resume for you
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="p-8">
                {renderStepContent()}
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 'basicInfo' || loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {currentStep === 'additional' ? (loading ? 'Generating...' : 'Build My Resume') : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Preview</h2>
              
              {resumeData ? (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold">{resumeData.contact.name}</h3>
                  <p className="text-gray-600">{resumeData.contact.title}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-medium">Summary</h4>
                    <p className="text-sm text-gray-700">{resumeData.summary}</p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium">Skills</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resumeData.skills.technical.map((skill, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium">Experience Highlights</h4>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                      {resumeData.experience[0]?.responsibilities.slice(0, 2).map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Fill out the form to see your resume preview</p>
                </div>
              )}
              
              {resumeData && (
                <div className="mt-6 space-y-4">
                  <button 
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    onClick={handleEnhanceResume}
                    disabled={enhancing}
                  >
                    {enhancing ? 'Enhancing with AI...' : 'Enhance with AI'}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => handleDownload('pdf')}
                    >
                      Download as PDF
                    </button>
                    <button 
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleDownload('docx')}
                    >
                      Download as DOCX
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
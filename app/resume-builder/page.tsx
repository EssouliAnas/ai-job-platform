'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [isDownloading, setIsDownloading] = useState(false);

  // Section-specific enhancement states
  const [enhancingSection, setEnhancingSection] = useState<string | null>(null);
  const [enhancingExperienceId, setEnhancingExperienceId] = useState<string | null>(null);
  const [enhancingEducationId, setEnhancingEducationId] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: ''
  });
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsDescription, setSkillsDescription] = useState<string>('');

  // Load saved resume data on component mount
  useEffect(() => {
    // Check if we're editing an existing resume
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      loadResumeForEdit(editId);
    } else {
      // Load draft for new resumes
      const savedData = localStorage.getItem('current-resume-draft');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setPersonalInfo(data.personalInfo || personalInfo);
          setExperiences(data.experiences || []);
          setEducation(data.education || []);
          setSkills(data.skills || []);
          setSkillsDescription(data.skillsDescription || '');
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, []);

  const loadResumeForEdit = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.ok) {
        const data = await response.json();
        const content = data.resume.content;
        
        setPersonalInfo(content.personalInfo || personalInfo);
        setExperiences(content.experiences || []);
        setEducation(content.education || []);
        setSkills(content.skills || []);
        setSkillsDescription(content.skillsDescription || '');
      } else {
        console.error('Failed to load resume for editing');
        alert('Failed to load resume for editing');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      alert('Error loading resume');
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const draftData = {
        personalInfo,
        experiences,
        education,
        skills,
        skillsDescription,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('current-resume-draft', JSON.stringify(draftData));
    }, 30000);

    return () => clearInterval(interval);
  }, [personalInfo, experiences, education, skills, skillsDescription]);

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: '',
      description: ''
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate'
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  // Section-specific AI enhancement functions
  const enhanceSummary = async () => {
    if (!personalInfo.summary.trim()) {
      alert('Please enter a professional summary before enhancing it with AI.');
      return;
    }

    setEnhancingSection('summary');
    try {
      const context = {
        fullName: personalInfo.fullName,
        experienceCount: experiences.length,
        educationLevel: education.length > 0 ? `${education[0].degree} in ${education[0].field}` : 'Not specified',
        topSkills: skills.slice(0, 5).map(s => s.name).join(', ')
      };

      const response = await fetch('/api/enhance-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'summary',
          content: personalInfo.summary,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance summary');
      }

      const { enhancedContent } = await response.json();
      setPersonalInfo(prev => ({ ...prev, summary: enhancedContent }));
    } catch (error) {
      console.error('Error enhancing summary:', error);
      alert(`Failed to enhance summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnhancingSection(null);
    }
  };

  const enhanceExperience = async (experienceId: string) => {
    const experience = experiences.find(exp => exp.id === experienceId);
    if (!experience || !experience.description.trim()) {
      alert('Please enter a description for this experience before enhancing it with AI.');
      return;
    }

    setEnhancingExperienceId(experienceId);
    try {
      const context = {
        position: experience.position,
        company: experience.company,
        duration: `${experience.startDate} - ${experience.current ? 'Present' : experience.endDate}`
      };

      const response = await fetch('/api/enhance-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'experience',
          content: experience.description,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance experience');
      }

      const { enhancedContent } = await response.json();
      updateExperience(experienceId, 'description', enhancedContent);
    } catch (error) {
      console.error('Error enhancing experience:', error);
      alert(`Failed to enhance experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnhancingExperienceId(null);
    }
  };

  const enhanceEducation = async (educationId: string) => {
    const edu = education.find(e => e.id === educationId);
    if (!edu || !edu.description.trim()) {
      alert('Please enter a description for this education before enhancing it with AI.');
      return;
    }

    setEnhancingEducationId(educationId);
    try {
      const context = {
        degree: edu.degree,
        field: edu.field,
        school: edu.school,
        gpa: edu.gpa
      };

      const response = await fetch('/api/enhance-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'education',
          content: edu.description,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance education');
      }

      const { enhancedContent } = await response.json();
      updateEducation(educationId, 'description', enhancedContent);
    } catch (error) {
      console.error('Error enhancing education:', error);
      alert(`Failed to enhance education: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnhancingEducationId(null);
    }
  };

  const enhanceSkillsOverview = async () => {
    if (!skillsDescription.trim()) {
      alert('Please enter a skills overview before enhancing it with AI.');
      return;
    }

    setEnhancingSection('skills');
    try {
      const context = {
        skillsList: skills.map(s => `${s.name} (${s.level})`).join(', '),
        experienceLevel: experiences.length > 0 ? 'Professional level' : 'Entry level',
        industry: experiences.length > 0 ? 'Based on experience' : 'General professional'
      };

      const response = await fetch('/api/enhance-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'skills',
          content: skillsDescription,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance skills overview');
      }

      const { enhancedContent } = await response.json();
      setSkillsDescription(enhancedContent);
    } catch (error) {
      console.error('Error enhancing skills overview:', error);
      alert(`Failed to enhance skills overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnhancingSection(null);
    }
  };



  const downloadDocx = async () => {
    setIsDownloading(true);
    try {
      const resumeData = {
        personalInfo,
        experiences,
        education,
        skills,
        skillsDescription
      };

      const response = await fetch('/api/generate-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${personalInfo.fullName || 'resume'}_resume.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    try {
      const resumeData = {
        personalInfo,
        experiences,
        education,
        skills,
        skillsDescription,
        createdAt: new Date().toISOString()
      };

      // Save to database
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: resumeData
        }),
      });

      if (response.ok) {
        // Also save to localStorage as backup
        const savedResumes = JSON.parse(localStorage.getItem('saved-resumes') || '[]');
        const newResume = {
          id: Date.now().toString(),
          name: personalInfo.fullName || 'Untitled Resume',
          ...resumeData
        };
        savedResumes.push(newResume);
        localStorage.setItem('saved-resumes', JSON.stringify(savedResumes));
        
        // Clear draft
        localStorage.removeItem('current-resume-draft');
        
        alert('Resume saved successfully!');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Failed to save resume: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume. Please try again.');
    }
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'experience', name: 'Experience', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'preview', name: 'Preview', icon: '👁️' }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 font-medium">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">AI-Powered Resume Builder</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadDocx}
                disabled={isDownloading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Download DOCX</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.name}</span>
                  </button>
                ))}
              </nav>
              
              {/* AI Tips Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">💡 AI Features</h3>
                <p className="text-sm text-purple-700 mb-3">
                  Use AI to enhance individual sections of your resume. Look for the "Enhance with AI" buttons next to each section.
                </p>
                <div className="text-xs text-purple-600 space-y-1">
                  <div>• Professional Summary</div>
                  <div>• Work Experience</div>
                  <div>• Education Description</div>
                  <div>• Skills Overview</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <div className="text-sm text-gray-500">
                      Auto-saved • Last updated just now
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website/Portfolio
                      </label>
                      <input
                        type="url"
                        value={personalInfo.website}
                        onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="https://johndoe.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Professional Summary
                        </label>
                        {personalInfo.summary.trim() && (
                          <button
                            onClick={enhanceSummary}
                            disabled={enhancingSection === 'summary'}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            {enhancingSection === 'summary' ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                <span>Enhancing...</span>
                              </>
                            ) : (
                              <>
                                <span>🤖</span>
                                <span>Enhance with AI</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <textarea
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Brief summary of your professional background and key achievements..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSection === 'experience' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                    <button
                      onClick={addExperience}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Experience
                    </button>
                  </div>
                  
                  {experiences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">
                        <span className="text-4xl">💼</span>
                      </div>
                      <p className="text-lg font-medium">No work experience added yet</p>
                      <p className="text-sm">Click "Add Experience" to get started, or use AI to generate content</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {experiences.map((exp, index) => (
                        <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Experience #{index + 1}</h3>
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Company Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                              </label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Job Title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  disabled={exp.current}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-900"
                                />
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-600">Current position</span>
                                </label>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                {exp.description.trim() && (
                                  <button
                                    onClick={() => enhanceExperience(exp.id)}
                                    disabled={enhancingExperienceId === exp.id}
                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                  >
                                    {enhancingExperienceId === exp.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                        <span>Enhancing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>🤖</span>
                                        <span>Enhance with AI</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Describe your responsibilities and achievements..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                    <button
                      onClick={addEducation}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Education
                    </button>
                  </div>
                  
                  {education.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">
                        <span className="text-4xl">🎓</span>
                      </div>
                      <p className="text-lg font-medium">No education added yet</p>
                      <p className="text-sm">Click "Add Education" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <div key={edu.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Education #{index + 1}</h3>
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                School/University
                              </label>
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="University of California"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Degree
                              </label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Bachelor of Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Field of Study
                              </label>
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Graduation Date
                              </label>
                              <input
                                type="month"
                                value={edu.graduationDate}
                                onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                GPA (Optional)
                              </label>
                              <input
                                type="text"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                placeholder="3.8"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Description (Optional)
                                </label>
                                {edu.description.trim() && (
                                  <button
                                    onClick={() => enhanceEducation(edu.id)}
                                    disabled={enhancingEducationId === edu.id}
                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                  >
                                    {enhancingEducationId === edu.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                        <span>Enhancing...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>🤖</span>
                                        <span>Enhance with AI</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <textarea
                                value={edu.description}
                                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                rows={3}
                                placeholder="Relevant coursework, achievements, honors, etc."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                    <button
                      onClick={addSkill}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Skill
                    </button>
                  </div>
                  
                  {/* Skills Description */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Skills Overview (Optional)
                      </label>
                      {skillsDescription.trim() && (
                        <button
                          onClick={enhanceSkillsOverview}
                          disabled={enhancingSection === 'skills'}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {enhancingSection === 'skills' ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              <span>Enhancing...</span>
                            </>
                          ) : (
                            <>
                              <span>🤖</span>
                              <span>Enhance with AI</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <textarea
                      value={skillsDescription}
                      onChange={(e) => setSkillsDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Brief overview of your technical skills, certifications, or areas of expertise..."
                    />
                  </div>
                  
                  {skills.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">
                        <span className="text-4xl">⚡</span>
                      </div>
                      <p className="text-lg font-medium">No skills added yet</p>
                      <p className="text-sm">Click "Add Skill" to get started, or use AI to suggest relevant skills</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Skill name"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="text-red-600 hover:text-red-800 font-bold text-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview Section */}
              {activeSection === 'preview' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Resume Preview</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={downloadDocx}
                        disabled={isDownloading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>📄</span>
                            <span>Download DOCX</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-6 border-b border-gray-200 pb-4">
                      <h1 className="text-3xl font-bold text-gray-900">{personalInfo.fullName || 'Your Name'}</h1>
                      <div className="flex flex-wrap justify-center gap-4 mt-3 text-gray-600">
                        {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                        {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                        {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                        {personalInfo.website && (
                          <a href={personalInfo.website} className="text-blue-600 hover:underline">
                            🌐 {personalInfo.website}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {personalInfo.summary && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Professional Summary
                        </h2>
                        <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {experiences.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Work Experience
                        </h2>
                        {experiences.map((exp) => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                                <p className="text-gray-700 font-medium">{exp.company}</p>
                              </div>
                              <div className="text-right text-gray-600">
                                <p className="font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                              </div>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Education
                        </h2>
                        {education.map((edu) => (
                          <div key={edu.id} className="mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                                <p className="text-gray-700 font-medium">{edu.school}</p>
                              </div>
                              <div className="text-right text-gray-600">
                                <p className="font-medium">{edu.graduationDate}</p>
                                {edu.gpa && <p>GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                            {edu.description && (
                              <p className="text-gray-700 leading-relaxed">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {(skills.length > 0 || skillsDescription) && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Skills
                        </h2>
                        {skillsDescription && (
                          <p className="text-gray-700 leading-relaxed mb-4">{skillsDescription}</p>
                        )}
                        {skills.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {skills.map((skill) => (
                              <div key={skill.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span className="text-gray-700 font-medium">{skill.name}</span>
                                <span className="text-gray-500 text-sm bg-white px-2 py-1 rounded">{skill.level}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-center space-x-4">
                    <button
                      onClick={downloadDocx}
                      disabled={isDownloading}
                      className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? 'Generating DOCX...' : '📄 Download as DOCX'}
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      💾 Save Resume
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
 
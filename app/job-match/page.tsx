'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JobMatchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobKeywords, setJobKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [jobMatches, setJobMatches] = useState<any[]>([]);

  // Mock resume data
  const resumes = [
    { id: 'resume1', name: 'Software Developer Resume' },
    { id: 'resume2', name: 'UI/UX Designer Resume' },
    { id: 'resume3', name: 'Project Manager Resume' },
  ];

  // Mock job data
  const mockJobs = [
    {
      id: 'job1',
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'New York, NY',
      salary: '$120,000 - $150,000',
      posted: '2 days ago',
      description: 'We are looking for an experienced React developer to join our team...',
      skills: ['React', 'TypeScript', 'Redux', 'Node.js'],
      matchScore: 92,
    },
    {
      id: 'job2',
      title: 'Frontend Developer',
      company: 'Digital Solutions',
      location: 'Remote',
      salary: '$90,000 - $110,000',
      posted: '1 week ago',
      description: 'Join our dynamic team creating responsive web applications...',
      skills: ['JavaScript', 'React', 'CSS', 'HTML'],
      matchScore: 87,
    },
    {
      id: 'job3',
      title: 'Full Stack Engineer',
      company: 'Innovative Systems',
      location: 'Boston, MA',
      salary: '$130,000 - $160,000',
      posted: '3 days ago',
      description: 'Looking for a versatile engineer who can work across our entire stack...',
      skills: ['JavaScript', 'Python', 'React', 'Django'],
      matchScore: 78,
    },
    {
      id: 'job4',
      title: 'Frontend Developer',
      company: 'CreativeTech',
      location: 'San Francisco, CA',
      salary: '$100,000 - $130,000',
      posted: '5 days ago',
      description: 'Join our team building beautiful and intuitive user interfaces...',
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'Next.js'],
      matchScore: 73,
    },
    {
      id: 'job5',
      title: 'React Native Developer',
      company: 'MobileFirst Apps',
      location: 'Chicago, IL',
      salary: '$110,000 - $140,000',
      posted: '1 day ago',
      description: 'Help us build cross-platform mobile applications with React Native...',
      skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
      matchScore: 68,
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResume) {
      alert('Please select a resume');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter and sort mock jobs based on inputs
    let filteredJobs = [...mockJobs];
    
    if (jobKeywords) {
      const keywords = jobKeywords.toLowerCase().split(' ');
      filteredJobs = filteredJobs.filter(job => 
        keywords.some(keyword => 
          job.title.toLowerCase().includes(keyword) || 
          job.skills.some(skill => skill.toLowerCase().includes(keyword))
        )
      );
    }
    
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    setJobMatches(filteredJobs);
    setSearchPerformed(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Match</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find the perfect job opportunities matched to your skills and experience
          </p>
        </header>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                  Select Resume
                </label>
                <select
                  id="resume"
                  name="resume"
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Choose a resume</option>
                  {resumes.map(resume => (
                    <option key={resume.id} value={resume.id}>{resume.name}</option>
                  ))}
                </select>
                <Link 
                  href="/resume-builder" 
                  className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500"
                >
                  Create a new resume
                </Link>
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                  Job Title or Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  id="keywords"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                  placeholder="e.g. React, Developer, JavaScript"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, Remote"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Finding matches...' : 'Find Matching Jobs'}
              </button>
            </div>
          </form>
        </div>
        
        {searchPerformed && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Job Matches</h2>
              <p className="text-sm text-gray-500">{jobMatches.length} matches found</p>
            </div>
            
            {jobMatches.length > 0 ? (
              <div className="space-y-6">
                {jobMatches.map(job => (
                  <div key={job.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                          <p className="text-md text-gray-700">{job.company}</p>
                          <p className="text-sm text-gray-500 mt-1">{job.location} • {job.posted}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold">
                            {job.matchScore}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Match</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">{job.description}</p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">Skills:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {job.skills.map((skill: string) => (
                            <span 
                              key={skill}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-900">{job.salary}</p>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No matching jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or uploading a different resume
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
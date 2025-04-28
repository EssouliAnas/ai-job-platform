'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'simple' | 'academic';
  imageUrl: string;
  description: string;
  isPremium: boolean;
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mock template data
  const templates: Template[] = [
    {
      id: 'modern-1',
      name: 'Modern Professional',
      category: 'professional',
      imageUrl: '/modern-1.jpg',
      description: 'Clean and contemporary design with a sidebar for skills and contact information.',
      isPremium: false
    },
    {
      id: 'creative-1',
      name: 'Creative Portfolio',
      category: 'creative',
      imageUrl: '/creative-1.jpg',
      description: 'Bold layout with vibrant accents, perfect for design and creative roles.',
      isPremium: true
    },
    {
      id: 'simple-1',
      name: 'Minimal Clean',
      category: 'simple',
      imageUrl: '/simple-1.jpg',
      description: 'Streamlined and elegant design focusing on clarity and readability.',
      isPremium: false
    },
    {
      id: 'professional-2',
      name: 'Executive Suite',
      category: 'professional',
      imageUrl: '/professional-2.jpg',
      description: 'Sophisticated layout designed for senior leadership and executive positions.',
      isPremium: true
    },
    {
      id: 'academic-1',
      name: 'Academic CV',
      category: 'academic',
      imageUrl: '/academic-1.jpg',
      description: 'Structured format ideal for academic positions, with sections for publications and research.',
      isPremium: false
    },
    {
      id: 'simple-2',
      name: 'Basic Classic',
      category: 'simple',
      imageUrl: '/simple-2.jpg',
      description: 'Traditional chronological layout, suitable for all industries and experience levels.',
      isPremium: false
    },
    {
      id: 'creative-2',
      name: 'Vibrant Showcase',
      category: 'creative',
      imageUrl: '/creative-2.jpg',
      description: 'Eye-catching design with unique layout for showcasing portfolio and achievements.',
      isPremium: true
    },
    {
      id: 'professional-3',
      name: 'Corporate Standard',
      category: 'professional',
      imageUrl: '/professional-3.jpg',
      description: 'Clean and professional design with traditional structure, ideal for corporate roles.',
      isPremium: false
    }
  ];
  
  // Filter templates based on category and search query
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Categories for the filter
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'simple', name: 'Simple' },
    { id: 'academic', name: 'Academic' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse our collection of professional resume templates
          </p>
        </header>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex overflow-x-auto py-2 space-x-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Template Preview Image */}
              <div className="aspect-w-4 aspect-h-5 bg-gray-200 relative">
                {/* In a real app, this would display the actual template preview image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                  {template.name} Preview
                </div>
                
                {template.isPremium && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Premium
                    </span>
                  </div>
                )}
              </div>
              
              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 capitalize">
                    {template.category.replace('-', ' ')}
                  </span>
                  
                  <Link 
                    href={`/resume-builder?template=${template.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or category filters
            </p>
          </div>
        )}
        
        {/* Premium Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Get access to all premium templates, unlimited resume downloads, and advanced AI features
              </p>
            </div>
            <div>
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50"
              >
                See Premium Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';

const templates = [
  {
    id: 1,
    name: 'Professional Classic',
    category: 'Classic',
    description: 'Clean and professional design perfect for corporate environments',
    preview: '📄',
    color: 'blue',
    features: ['ATS-friendly', 'Clean layout', 'Traditional format']
  },
  {
    id: 2,
    name: 'Modern Creative',
    category: 'Creative',
    description: 'Contemporary design with creative elements for design roles',
    preview: '🎨',
    color: 'purple',
    features: ['Visual appeal', 'Modern typography', 'Color accents']
  },
  {
    id: 3,
    name: 'Tech Minimalist',
    category: 'Tech',
    description: 'Minimalist design optimized for tech industry professionals',
    preview: '⚡',
    color: 'green',
    features: ['Tech-focused', 'Minimal design', 'Skills emphasis']
  },
  {
    id: 4,
    name: 'Executive Elite',
    category: 'Executive',
    description: 'Sophisticated design for senior-level positions',
    preview: '👔',
    color: 'gray',
    features: ['Executive style', 'Premium look', 'Leadership focus']
  },
  {
    id: 5,
    name: 'Creative Portfolio',
    category: 'Creative',
    description: 'Portfolio-style resume for creative professionals',
    preview: '🎭',
    color: 'pink',
    features: ['Portfolio style', 'Visual elements', 'Creative layout']
  },
  {
    id: 6,
    name: 'Academic Scholar',
    category: 'Academic',
    description: 'Traditional academic CV format for researchers and educators',
    preview: '🎓',
    color: 'indigo',
    features: ['Academic format', 'Publication focus', 'Research emphasis']
  }
];

const categories = ['All', 'Classic', 'Creative', 'Tech', 'Executive', 'Academic'];

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/sign-in');
        return;
      }
      setUser(session.user);
    } catch (err: any) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 hover:border-blue-400',
      purple: 'border-purple-200 hover:border-purple-400',
      green: 'border-green-200 hover:border-green-400',
      gray: 'border-gray-200 hover:border-gray-400',
      pink: 'border-pink-200 hover:border-pink-400',
      indigo: 'border-indigo-200 hover:border-indigo-400'
    };
    return colorMap[color as keyof typeof colorMap] || 'border-gray-200 hover:border-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading templates...</p>
        </div>
      </div>
    );
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
              <h1 className="text-xl font-bold text-gray-900">Resume Templates</h1>
            </div>
            <div className="text-2xl font-extrabold">
              AI Job <span className="text-yellow-400">Platform</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-6xl">🎨</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Resume Templates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our collection of professionally designed resume templates. 
            Each template is optimized for ATS systems and tailored for different industries.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 ${getColorClasses(template.color)} group`}
            >
              {/* Preview */}
              <div className="aspect-w-3 aspect-h-4 bg-gray-50 rounded-t-2xl p-8 flex items-center justify-center">
                <div className="text-6xl">{template.preview}</div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="space-y-2 mb-6">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-3 px-4 rounded-lg font-bold hover:shadow-lg transition-all">
                    Use This Template
                  </button>
                  <button className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">More Templates Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're constantly adding new templates based on industry trends and user feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-900 mb-2">Mobile-Optimized</h4>
              <p className="text-gray-600 text-sm">Templates that look great on all devices</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Industry-Specific</h4>
              <p className="text-gray-600 text-sm">Specialized templates for different careers</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h4 className="font-semibold text-gray-900 mb-2">International Formats</h4>
              <p className="text-gray-600 text-sm">Templates for global job markets</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Choosing?
          </h3>
          <p className="text-gray-600 mb-6">
            Let our AI analyze your profile and recommend the best template for your industry and experience level.
          </p>
          <Link
            href="/resume-upload"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Get AI Template Recommendation
          </Link>
        </div>
      </div>
    </div>
  );
} 

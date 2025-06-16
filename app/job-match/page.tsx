'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';

export default function JobMatchPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading job matching...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Job Matching</h1>
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
            <span className="text-6xl">🎯</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Job Match
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyzes your skills, experience, and preferences to find job opportunities 
            that are perfectly aligned with your career goals.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
              <p className="text-lg text-gray-600 mb-8">
                We're building an amazing job matching system that will revolutionize how you find your next career opportunity.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="text-left">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">🤖 AI-Powered Matching</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Skills-based job recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Experience level matching
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Location preferences
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Salary range optimization
                  </li>
                </ul>
              </div>

              <div className="text-left">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">📊 Smart Analytics</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Match compatibility scores
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Skill gap analysis
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Application success predictions
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-3">✓</span>
                    Career growth recommendations
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Link
                href="/resume-upload"
                className="block w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-4 px-8 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Upload Your Resume to Get Started
              </Link>
              <p className="text-gray-500 text-sm">
                Upload your resume to enable personalized job matching when this feature launches
              </p>
            </div>
          </div>
        </div>

        {/* Meanwhile Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Meanwhile, explore these features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/resume-upload"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-blue-100"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📄</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Resume Analysis
                </h4>
                <p className="text-gray-600 text-sm">
                  Get AI-powered feedback on your resume to improve your job prospects
                </p>
              </div>
            </Link>

            <Link
              href="/resume-builder"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-green-100"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Resume Builder
                </h4>
                <p className="text-gray-600 text-sm">
                  Create a professional resume with our easy-to-use builder
                </p>
              </div>
            </Link>

            <Link
              href="/cover-letter"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">✉️</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Cover Letters
                </h4>
                <p className="text-gray-600 text-sm">
                  Generate personalized cover letters for any job application
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 

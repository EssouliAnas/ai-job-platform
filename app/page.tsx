'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex items-center text-2xl font-extrabold">
          <span className="text-gray-900">AI Job</span> <span className="text-yellow-400 ml-1">Platform</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Contact
          </Link>
        </nav>
        <Link 
          href="/auth/sign-in"
          className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row justify-center items-center px-10 py-16 lg:py-24 gap-12 lg:gap-16">
        <div className="max-w-lg lg:max-w-xl text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-gray-900">Create professional resumes that</span> <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">stand out</span>
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
            AI Job Platform helps you create, analyze, and manage your resumes professionally and effectively to land your dream job with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              href="/resume-upload"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all text-center"
            >
              ✨ Analyze Resume with AI
            </Link>
            <Link 
              href="/auth/sign-up"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold border-2 border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all text-center"
            >
              🚀 Get Started Free
            </Link>
          </div>
        </div>

        {/* Resume Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 mx-auto lg:mx-0">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sarah Johnson</h2>
            <p className="text-gray-600 text-sm">Senior Software Engineer</p>
          </div>

          <div className="mb-6">
            <h3 className="text-yellow-500 font-bold text-base mb-3">Experience</h3>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">Lead Developer - TechCorp</p>
              <p className="text-gray-600">2021 - Present</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-purple-500 font-bold text-base mb-3">Education</h3>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">Computer Science University</p>
              <p className="text-gray-600">Bachelor's in Computer Science</p>
            </div>
          </div>

          <div>
            <h3 className="text-pink-500 font-bold text-base mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 text-xs px-3 py-1.5 rounded-full font-medium">React</span>
              <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full font-medium">TypeScript</span>
              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">Node.js</span>
              <span className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium">AI/ML</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-10 py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Transform your career with cutting-edge AI technology and professional tools designed for modern job seekers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Analysis</h3>
              <p className="text-gray-700 leading-relaxed">
                Get detailed feedback on your resume with our advanced AI that analyzes content, structure, and ATS compatibility.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Job Matching</h3>
              <p className="text-gray-700 leading-relaxed">
                Find the perfect job opportunities that match your skills and experience with our intelligent job matching system.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Career Insights</h3>
              <p className="text-gray-700 leading-relaxed">
                Track your application progress and get personalized recommendations to improve your job search success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-yellow-500 mb-2">50K+</div>
              <div className="text-gray-700 font-medium">Resumes Analyzed</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-pink-500 mb-2">98%</div>
              <div className="text-gray-700 font-medium">Success Rate</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-gray-700 font-medium">AI Support</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl font-bold text-blue-500 mb-2">15K+</div>
              <div className="text-gray-700 font-medium">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of professionals who have already improved their resumes and landed their dream jobs with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/sign-up"
              className="bg-white text-gray-900 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Free Today
            </Link>
            <Link 
              href="/features"
              className="bg-white/20 backdrop-blur text-white px-10 py-4 rounded-lg font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center text-2xl font-bold mb-6">
                <span className="text-white">AI Job</span> <span className="text-yellow-400 ml-1">Platform</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering your career journey with AI-driven insights and professional tools.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/resume-upload" className="hover:text-white transition-colors">Resume Analysis</Link></li>
                <li><Link href="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link href="/job-match" className="hover:text-white transition-colors">Job Matching</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/setup" className="hover:text-white transition-colors">Setup Guide</Link></li>
                <li><Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Job Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

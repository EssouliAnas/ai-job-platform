'use client'

import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: '🤖',
      title: 'AI Resume Analysis',
      description: 'Advanced AI analyzes your resume for content quality, structure, and ATS compatibility',
      details: [
        'Section-by-section breakdown',
        'Grammar and tone assessment',
        'ATS optimization score',
        'Industry-specific feedback'
      ],
      color: 'yellow'
    },
    {
      icon: '📝',
      title: 'Smart Resume Builder',
      description: 'Create professional resumes with AI-powered suggestions and industry templates',
      details: [
        'Professional templates',
        'Real-time AI suggestions',
        'Multiple export formats',
        'Mobile-responsive design'
      ],
      color: 'blue'
    },
    {
      icon: '💼',
      title: 'Intelligent Job Matching',
      description: 'Find perfect job opportunities that match your skills and experience',
      details: [
        'Skills-based matching',
        'Compatibility scoring',
        'Location filtering',
        'Salary optimization'
      ],
      color: 'purple'
    },
    {
      icon: '✉️',
      title: 'Cover Letter Generator',
      description: 'Generate personalized cover letters tailored to specific job applications',
      details: [
        'Job-specific content',
        'Company research integration',
        'Professional templates',
        'Tone optimization'
      ],
      color: 'pink'
    },
    {
      icon: '📊',
      title: 'Career Analytics',
      description: 'Track your job search progress with detailed insights and recommendations',
      details: [
        'Application tracking',
        'Success rate analysis',
        'Interview preparation',
        'Skill gap identification'
      ],
      color: 'green'
    },
    {
      icon: '🎯',
      title: 'Interview Preparation',
      description: 'Prepare for interviews with AI-generated questions and feedback',
      details: [
        'Common interview questions',
        'Industry-specific scenarios',
        'Answer evaluation',
        'Confidence building tips'
      ],
      color: 'indigo'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      yellow: 'from-yellow-400 to-orange-400',
      blue: 'from-blue-400 to-indigo-400',
      purple: 'from-purple-400 to-pink-400',
      pink: 'from-pink-400 to-rose-400',
      green: 'from-green-400 to-teal-400',
      indigo: 'from-indigo-400 to-purple-400'
    }
    return colorMap[color as keyof typeof colorMap] || 'from-gray-400 to-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex items-center text-2xl font-extrabold">
          <Link href="/" className="flex items-center">
            <span className="text-gray-900">AI Job</span> <span className="text-yellow-400 ml-1">Platform</span>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-yellow-500 font-medium">
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
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Powerful Features for Your <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Career Success</span>
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            Discover how our AI-powered tools can transform your job search and help you land your dream career with cutting-edge technology and professional insights.
          </p>
          <Link
            href="/auth/sign-up"
            className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-10 py-4 rounded-lg font-bold hover:shadow-lg transition-all inline-block"
          >
            Try All Features Free
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-10 py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(feature.color)} rounded-full flex items-center justify-center mr-6`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm mr-3">
                        ✓
                      </div>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Get started with our AI-powered platform in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Resume</h3>
              <p className="text-gray-700 leading-relaxed">
                Upload your existing resume or create a new one using our professional templates and builder tools.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get AI Analysis</h3>
              <p className="text-gray-700 leading-relaxed">
                Our advanced AI analyzes your resume and provides detailed feedback, suggestions, and optimization tips.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Land Your Dream Job</h3>
              <p className="text-gray-700 leading-relaxed">
                Apply to matched job opportunities with your optimized resume and track your application success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-10 py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Professionals Choose Us</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Join thousands of successful professionals who have transformed their careers with our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-yellow-500 mb-2">95%</div>
              <div className="text-gray-700 font-medium">Interview Success Rate</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-pink-500 mb-2">50K+</div>
              <div className="text-gray-700 font-medium">Resumes Optimized</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-purple-500 mb-2">3x</div>
              <div className="text-gray-700 font-medium">Faster Job Placement</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
              <div className="text-gray-700 font-medium">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Start your free trial today and see how our AI-powered tools can accelerate your career growth
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/sign-up"
              className="bg-white text-gray-900 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing"
              className="bg-white/20 backdrop-blur text-white px-10 py-4 rounded-lg font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              View Pricing
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

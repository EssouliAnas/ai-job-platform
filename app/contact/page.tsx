'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
          <Link href="/features" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-yellow-500 font-medium">
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
            Get in <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            Have questions about our platform? Want to discuss enterprise solutions? We're here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-10 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">✅</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                    <p className="text-gray-700 mb-8">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          company: '',
                          subject: 'general',
                          message: ''
                        })
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                          Company (Optional)
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="enterprise">Enterprise Solutions</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-4 px-6 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">support@aijobplatform.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Office</h4>
                      <p className="text-gray-600">
                        123 Innovation Drive<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">🕒</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">
                        Mon - Fri: 9:00 AM - 6:00 PM PST<br />
                        Weekend: Emergency support only
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Response Times</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">General Inquiries</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Technical Support</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Enterprise Sales</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Emergency Support</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">1 hour</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/setup" className="block text-yellow-500 hover:text-yellow-600 font-medium transition-colors">
                    📚 Setup Guide
                  </Link>
                  <Link href="/features" className="block text-yellow-500 hover:text-yellow-600 font-medium transition-colors">
                    ⭐ Features Overview
                  </Link>
                  <Link href="/pricing" className="block text-yellow-500 hover:text-yellow-600 font-medium transition-colors">
                    💰 Pricing Plans
                  </Link>
                  <Link href="/auth/sign-up" className="block text-yellow-500 hover:text-yellow-600 font-medium transition-colors">
                    🚀 Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-10 py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-700">
              Quick answers to common questions before you reach out
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How do I get started?</h3>
              <p className="text-gray-700">
                Simply sign up for a free account and upload your resume. Our AI will analyze it immediately and provide detailed feedback.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Is my data secure?</h3>
              <p className="text-gray-700">
                Yes! We use enterprise-grade encryption and security measures to protect your personal information and resume data.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Do you offer enterprise solutions?</h3>
              <p className="text-gray-700">
                Absolutely! We provide custom solutions for companies, HR departments, and career coaching services. Contact our sales team.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What file formats do you support?</h3>
              <p className="text-gray-700">
                We support PDF, DOC, and DOCX formats for resume uploads. Our AI can analyze resumes in multiple languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Don't wait to transform your career. Start analyzing your resume with AI today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/sign-up"
              className="bg-white text-gray-900 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/resume-upload"
              className="bg-white/20 backdrop-blur text-white px-10 py-4 rounded-lg font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              Analyze Resume
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

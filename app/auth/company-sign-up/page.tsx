'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

export default function CompanySignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyIndustry, setCompanyIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for active session on page load and redirect if found
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    
    checkSession()
  }, [router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'company',
          },
          emailRedirectTo: `${window.location.origin}/auth/verification`,
        },
      })

      if (authError) throw authError

      // 2. Create company record
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            website: companyWebsite || null,
            industry: companyIndustry || null,
            size: companySize || null,
            location: companyLocation || null,
            description: companyDescription || null,
          }
        ])
        .select()
        .single()

      if (companyError) throw companyError

      // 3. Update user with company_id and user_type
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          company_id: companyData.id,
          user_type: 'company'
        })
        .eq('id', authData.user?.id)

      if (updateError) throw updateError

      // Redirect to verification page
      router.push('/auth/verification')
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left side with image */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-800 relative">
        <div className="absolute inset-0 bg-blue-900 z-10"></div>
        <div className="relative w-full h-full flex items-center justify-center z-20">
          <div className="px-12 text-white">
            <h1 className="text-4xl font-bold mb-6">Join Our Platform</h1>
            <p className="text-xl mb-8">Create your company account to start finding the best talent</p>
            <div className="flex space-x-3 mb-8">
              <div className="h-2 w-8 rounded-full bg-white"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full bg-white opacity-60"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create your company account
            </h2>
            <p className="mt-2 text-gray-700">
              Or{' '}
              <Link
                href="/auth/sign-in"
                className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-red-600">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Sign-up failed</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-800">
                  Company Name *
                </label>
                <input
                  id="company-name"
                  name="company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="company-website" className="block text-sm font-medium text-gray-800">
                  Company Website
                </label>
                <input
                  id="company-website"
                  name="company-website"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="company-industry" className="block text-sm font-medium text-gray-800">
                  Industry
                </label>
                <input
                  id="company-industry"
                  name="company-industry"
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="e.g. Technology, Healthcare, Finance"
                />
              </div>

              <div>
                <label htmlFor="company-size" className="block text-sm font-medium text-gray-800">
                  Company Size
                </label>
                <select
                  id="company-size"
                  name="company-size"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  <option value="">Select company size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-location" className="block text-sm font-medium text-gray-800">
                  Location
                </label>
                <input
                  id="company-location"
                  name="company-location"
                  type="text"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label htmlFor="company-description" className="block text-sm font-medium text-gray-800">
                  Company Description
                </label>
                <textarea
                  id="company-description"
                  name="company-description"
                  rows={3}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="Brief description of your company"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-800">
                  Email address *
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-800">
                  Confirm Password *
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-blue-700 py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:bg-blue-300 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create company account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 

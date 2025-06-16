'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@/lib/supabase/client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for active session on page load and redirect if found
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Get user from database to check user_type
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
        
        const userType = userData?.user_type || 'individual'
        router.push(userType === 'company' ? '/company/dashboard' : '/dashboard')
      }
    }
    
    checkSession()
  }, [router])

  // Check for saved credentials on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail')
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true'
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Save or remove credentials based on remember me checkbox
      if (rememberMe) {
        localStorage.setItem('savedEmail', email)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('savedEmail')
        localStorage.removeItem('rememberMe')
      }

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Get user type from database
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single()
      
      const userType = userData?.user_type || 'individual'
      router.push(userType === 'company' ? '/company/dashboard' : '/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50 flex">
      {/* Left side with gradient and content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500"></div>
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <div className="text-white text-center">
            <div className="mb-8">
              <div className="text-4xl font-extrabold mb-2">
                AI Job <span className="text-yellow-200">Platform</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">Welcome Back! 👋</h1>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Sign in to access your AI-powered resume analysis, job matching, and career tools.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold mb-1">AI Resume Review</h3>
                <p className="text-sm text-white/80">Get instant feedback on your resume</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">💼</div>
                <h3 className="font-semibold mb-1">Smart Job Matching</h3>
                <p className="text-sm text-white/80">Find jobs that fit your skills</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Career Insights</h3>
                <p className="text-sm text-white/80">Track your application progress</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-semibold mb-1">Resume Builder</h3>
                <p className="text-sm text-white/80">Create professional resumes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-extrabold mb-4">
              AI Job <span className="text-yellow-400">Platform</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-800">Sign in failed</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm font-medium text-gray-600 hover:text-yellow-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-white py-3 px-4 rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <div className="space-y-3">
                <Link
                  href="/auth/sign-up"
                  className="block w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border-2 border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all"
                >
                  👤 Create Individual Account
                </Link>
                <Link
                  href="/auth/company-sign-up"
                  className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  🏢 Register Your Company
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-yellow-500 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 

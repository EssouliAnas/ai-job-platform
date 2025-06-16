'use client'

import Link from 'next/link'

export default function VerificationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h2>
          <div className="mt-8">
            <svg
              className="mx-auto h-12 w-12 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="mt-4 text-center text-lg text-gray-600">
            We've sent you a verification email. Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <p className="text-sm text-gray-500">
            Didn't receive an email? Check your spam folder or{' '}
            <Link href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
              try signing up again
            </Link>
            .
          </p>

          <div>
            <Link
              href="/auth/sign-in"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SetupPage() {
  const [isCheckingTables, setIsCheckingTables] = useState(false)
  const [isSettingUpData, setIsSettingUpData] = useState(false)
  const [isGettingPolicyReset, setIsGettingPolicyReset] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSql, setShowSql] = useState(false)

  const checkAndCreateTables = async () => {
    try {
      setIsCheckingTables(true)
      setError(null)
      
      const response = await fetch('/api/check-and-create-tables')
      const data = await response.json()
      
      setResult(data)
      
      if (!data.success) {
        setError(data.error || 'Failed to check/create tables')
        if (data.instructionsForSQL) {
          setShowSql(true)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsCheckingTables(false)
    }
  }

  const setupTestData = async () => {
    try {
      setIsSettingUpData(true)
      setError(null)
      
      const response = await fetch('/api/setup-test-data')
      const data = await response.json()
      
      setResult(data)
      
      if (!data.success) {
        setError(data.error || 'Failed to set up test data')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSettingUpData(false)
    }
  }

  const getPolicyReset = async () => {
    try {
      setIsGettingPolicyReset(true)
      setError(null)
      
      const response = await fetch('/api/reset-policies', { method: 'POST' })
      const data = await response.json()
      
      setResult(data)
      setShowSql(true)
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsGettingPolicyReset(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Job Platform Setup</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-medium">
              Infinite Recursion Error Fix
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              If you're getting "infinite recursion detected in policy for relation 'users'" errors, 
              use the Policy Reset button below to get the corrected SQL.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
        <p className="mb-4 text-gray-600">
          This will check if all required tables exist. Since we cannot create tables directly through the API,
          you may need to run SQL commands in the Supabase dashboard.
        </p>
        <button
          onClick={checkAndCreateTables}
          disabled={isCheckingTables}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isCheckingTables ? 'Checking...' : 'Check Tables'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Fix Policy Issues</h2>
        <p className="mb-4 text-gray-600">
          If you're experiencing infinite recursion errors, click this button to get the correct RLS policies 
          that need to be run in the Supabase SQL Editor.
        </p>
        <button
          onClick={getPolicyReset}
          disabled={isGettingPolicyReset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isGettingPolicyReset ? 'Getting SQL...' : 'Get Policy Reset SQL'}
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Set Up Test Data</h2>
        <p className="mb-4 text-gray-600">
          This will create test users, companies, and job postings for testing purposes.
          Make sure you have created the tables first!
        </p>
        <button
          onClick={setupTestData}
          disabled={isSettingUpData}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSettingUpData ? 'Setting Up...' : 'Set Up Test Data'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {showSql && (result?.instructionsForSQL || result?.sql) && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {result?.instructionsForSQL ? 'SQL Instructions' : 'Policy Reset SQL'}
          </h2>
          <p className="mb-4 text-gray-600">
            {result?.instructionsForSQL 
              ? 'To create the required tables, you need to execute the following SQL in the Supabase SQL Editor:'
              : 'To fix the infinite recursion error, copy and paste this SQL in the Supabase SQL Editor:'
            }
          </p>
          <div className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{result?.instructionsForSQL || result?.sql}</pre>
          </div>
          <div className="mt-4">
            <a 
              href={result?.supabaseUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/sql`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Open Supabase SQL Editor (opens in new tab)
            </a>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <p className="mb-4 text-gray-600">
          After setting up the database and test data, you can:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>
            <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
              Sign in with a test account
            </Link>
          </li>
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Go to the home page
            </Link>
          </li>
        </ul>
        <p className="text-sm text-gray-500">
          Test accounts (after setting up test data):
          <br />
          Company: company@example.com / password123
          <br />
          Individual: individual@example.com / password123
        </p>
      </div>
    </div>
  )
} 

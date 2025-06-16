'use client'

import { useState } from 'react'

export default function ResetPage() {
  const [isResetting, setIsResetting] = useState(false)
  const [isSettingUpData, setIsSettingUpData] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const resetDatabase = async () => {
    try {
      setIsResetting(true)
      setError(null)
      
      const response = await fetch('/api/reset-database')
      const data = await response.json()
      
      setResult(data)
      
      if (!data.success) {
        setError(data.error || 'Failed to reset database')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsResetting(false)
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Database Management</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Reset Database</h2>
        <p className="mb-4 text-gray-600">
          This will drop all tables and recreate them. All existing data will be permanently deleted.
        </p>
        <button
          onClick={resetDatabase}
          disabled={isResetting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isResetting ? 'Resetting...' : 'Reset Database'}
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Set Up Test Data</h2>
        <p className="mb-4 text-gray-600">
          This will create test users, companies, and job postings for testing purposes.
        </p>
        <button
          onClick={setupTestData}
          disabled={isSettingUpData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 

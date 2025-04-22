import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your job platform dashboard
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Resumes</h3>
              <p className="mt-1 text-3xl font-semibold">0</p>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <Link href="/resume-builder" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Create a new resume
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Cover Letters</h3>
              <p className="mt-1 text-3xl font-semibold">0</p>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <Link href="/cover-letter" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Generate a cover letter
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">You have not created any resumes yet.</p>
          <Link 
            href="/resume-builder"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create your first resume
          </Link>
        </div>
      </div>
    </div>
  );
} 
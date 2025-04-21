import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            AI-Powered Job Platform
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Supercharge your job search with AI-powered resume building, feedback, and cover letters
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-in"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Smart Resume Builder</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create professional resumes with AI assistance. Just answer a few questions and get a polished resume instantly.
                </p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Resume Feedback</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload your existing resume and get detailed AI feedback to make it more effective.
                </p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Cover Letter Generator</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate tailored cover letters for any job posting in seconds, perfectly matched to your resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

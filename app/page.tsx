export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Shorten Link
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Welcome to our URL shortener service
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Get Started
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}
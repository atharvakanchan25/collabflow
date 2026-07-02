import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-indigo-500 text-6xl font-bold mb-4">404</p>
        <h1 className="text-white text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

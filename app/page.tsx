import { Suspense } from 'react';

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main page component
export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            🚀 IDEA E-commerce Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Modern B2B marketplace powered by Next.js 15.2 + React 19
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              🔥 Stack Cutting-Edge 2024/2025
            </h2>
            <ul className="text-left space-y-2">
              <li>✅ Next.js 15.2 (Latest)</li>
              <li>✅ React 19 (Stable)</li>
              <li>✅ TypeScript 5.7</li>
              <li>✅ Node.js 22 Support</li>
              <li>✅ Vercel Edge Runtime</li>
              <li>✅ Turbopack (57.6% faster builds)</li>
              <li>✅ Web Standard APIs</li>
              <li>✅ Streaming Metadata</li>
            </ul>
          </div>

          <div className="mt-8">
            <a
              href="/api/health"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test API Health
            </a>
          </div>
        </div>
      </main>
    </Suspense>
  );
} 
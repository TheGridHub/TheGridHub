"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-7 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-200 rounded mb-2" />
          <div className="h-10 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="h-40 bg-gray-100 rounded" />
            <div className="h-40 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}


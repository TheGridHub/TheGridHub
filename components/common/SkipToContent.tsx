"use client"

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-purple-700 px-3 py-1 rounded border border-purple-200 shadow-sm"
    >
      Skip to main content
    </a>
  )
}


'use client'

import { Bell, HelpCircle, MessageSquare, Calendar, Sliders } from 'lucide-react'
import Image from 'next/image'

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Weekly/Customize buttons */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900">
              <Sliders className="w-4 h-4 mr-2" />
              Customize
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-gray-600">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 relative">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">B</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
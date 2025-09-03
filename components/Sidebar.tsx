'use client'

import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Target, 
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react'

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: CheckSquare, label: 'My tasks' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Users, label: 'My workspace' },
    { icon: Target, label: 'Goals', count: 2 },
    { icon: Settings, label: 'Settings' },
  ]

  const projects = [
    { name: 'Aerotech Web Design', color: 'bg-green-500' },
    { name: 'Clintown App Redesign', color: 'bg-cyan-500' },
    { name: 'Uvo Dashboard Design', color: 'bg-purple-500' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">TaskWork</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘F</span>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">CC</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Creative core</div>
              <div className="text-xs text-gray-500">23 Members</div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              item.active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 ${
                item.active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.label}
            {item.count && (
              <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Projects */}
      <div className="px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            PROJECT
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          {projects.map((project, index) => (
            <a
              key={index}
              href="#"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${project.color}`}></div>
              {project.name}
            </a>
          ))}
        </div>
      </div>

      {/* Trial Banner */}
      <div className="px-3 pb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-sm font-medium mb-2">TaskWork trial plan</div>
          <div className="text-xs opacity-90 mb-3">
            Your plan only left 12-days, we will upgrade big plan soon
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <div className="bg-white rounded-full h-2" style={{ width: '70%' }}></div>
          </div>
          <button className="text-xs underline hover:no-underline">
            View plan →
          </button>
        </div>
      </div>
    </div>
  )
}

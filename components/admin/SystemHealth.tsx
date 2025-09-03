'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Database, 
  Globe, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Eye,
  Settings,
  AlertCircle,
  BarChart3,
  Monitor,
  Cloud
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

interface SystemMetric {
  id: string
  name: string
  value: string | number
  unit?: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  threshold?: number
  trend?: 'up' | 'down' | 'stable'
  lastUpdated: string
}

interface DatabaseMetrics {
  connectionCount: number
  maxConnections: number
  queryTime: number
  slowQueries: number
  locksWaiting: number
  tableSize: number
  indexSize: number
  uptime: string
}

interface APIMetrics {
  requestsPerMinute: number
  avgResponseTime: number
  errorRate: number
  p95ResponseTime: number
  activeConnections: number
  rateLimitHits: number
  cacheHitRatio: number
  queueSize: number
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  source: string
}

interface SystemHealthProps {
  onRefreshMetrics?: () => void
  onResolveAlert?: (alertId: string) => void
}

export default function SystemHealth({ onRefreshMetrics, onResolveAlert }: SystemHealthProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // System metrics data
  const [systemMetrics] = useState<SystemMetric[]>([
    {
      id: '1',
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      threshold: 80,
      trend: 'stable',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      status: 'warning',
      threshold: 85,
      trend: 'up',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Disk Usage',
      value: 32,
      unit: '%',
      status: 'healthy',
      threshold: 90,
      trend: 'stable',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Network I/O',
      value: 125,
      unit: 'Mbps',
      status: 'healthy',
      trend: 'down',
      lastUpdated: new Date().toISOString()
    }
  ])

  const [databaseMetrics] = useState<DatabaseMetrics>({
    connectionCount: 23,
    maxConnections: 100,
    queryTime: 45,
    slowQueries: 2,
    locksWaiting: 0,
    tableSize: 2.4,
    indexSize: 0.8,
    uptime: '15 days, 6 hours'
  })

  const [apiMetrics] = useState<APIMetrics>({
    requestsPerMinute: 1247,
    avgResponseTime: 145,
    errorRate: 0.02,
    p95ResponseTime: 280,
    activeConnections: 156,
    rateLimitHits: 23,
    cacheHitRatio: 94.5,
    queueSize: 5
  })

  const [alerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Memory usage has exceeded 65% for the past 10 minutes',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      resolved: false,
      source: 'System Monitor'
    },
    {
      id: '2',
      type: 'error',
      title: 'Database Connection Pool Full',
      description: 'All database connections are in use, new requests are queuing',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved: false,
      source: 'Database Monitor'
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance Complete',
      description: 'Database optimization completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true,
      source: 'Maintenance System'
    }
  ])

  // Performance data for charts
  const performanceData = [
    { time: '00:00', cpu: 35, memory: 45, disk: 20, network: 80 },
    { time: '04:00', cpu: 42, memory: 52, disk: 22, network: 95 },
    { time: '08:00', cpu: 65, memory: 68, disk: 28, network: 120 },
    { time: '12:00', cpu: 78, memory: 75, disk: 32, network: 140 },
    { time: '16:00', cpu: 58, memory: 62, disk: 30, network: 110 },
    { time: '20:00', cpu: 45, memory: 58, disk: 28, network: 85 },
    { time: '24:00', cpu: 38, memory: 48, disk: 25, network: 75 }
  ]

  const apiPerformanceData = [
    { time: '00:00', requests: 800, responseTime: 120, errors: 2 },
    { time: '04:00', requests: 450, responseTime: 95, errors: 1 },
    { time: '08:00', requests: 1200, responseTime: 140, errors: 5 },
    { time: '12:00', requests: 1800, responseTime: 180, errors: 8 },
    { time: '16:00', requests: 1650, responseTime: 165, errors: 6 },
    { time: '20:00', requests: 1400, responseTime: 155, errors: 4 },
    { time: '24:00', requests: 900, responseTime: 125, errors: 2 }
  ]

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
        onRefreshMetrics?.()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, onRefreshMetrics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />
      default:
        return null
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
            <p className="text-gray-600">Monitor system performance and infrastructure health</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                id="autoRefresh"
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
            </div>
            
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            
            <button
              onClick={() => {
                setLastUpdated(new Date())
                onRefreshMetrics?.()
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'system', label: 'System', icon: Server },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'api', label: 'API', icon: Globe },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric) => (
              <div key={metric.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </p>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusIcon(metric.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {metric.name.includes('CPU') && <Cpu className="h-6 w-6 text-blue-600" />}
                    {metric.name.includes('Memory') && <MemoryStick className="h-6 w-6 text-blue-600" />}
                    {metric.name.includes('Disk') && <HardDrive className="h-6 w-6 text-blue-600" />}
                    {metric.name.includes('Network') && <Wifi className="h-6 w-6 text-blue-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance (24h)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance (24h)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={apiPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="responseTime" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Source: {alert.source}</p>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => onResolveAlert?.(alert.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="memory" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                <Area type="monotone" dataKey="disk" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
                <Area type="monotone" dataKey="network" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Server Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Operating System</span>
                  <span className="text-sm font-medium text-gray-900">Ubuntu 22.04 LTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kernel Version</span>
                  <span className="text-sm font-medium text-gray-900">5.15.0-56-generic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-gray-900">15 days, 6 hours, 32 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Load Average</span>
                  <span className="text-sm font-medium text-gray-900">0.45, 0.52, 0.48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Processes</span>
                  <span className="text-sm font-medium text-gray-900">156</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Hardware Resources</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU Cores</span>
                  <span className="text-sm font-medium text-gray-900">8 cores @ 2.4GHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Memory</span>
                  <span className="text-sm font-medium text-gray-900">32 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Memory</span>
                  <span className="text-sm font-medium text-gray-900">10.2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Disk Space</span>
                  <span className="text-sm font-medium text-gray-900">500 GB SSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Network Interfaces</span>
                  <span className="text-sm font-medium text-gray-900">eth0 (1 Gbps)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Database Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {databaseMetrics.connectionCount}/{databaseMetrics.maxConnections}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((databaseMetrics.connectionCount / databaseMetrics.maxConnections) * 100).toFixed(1)}% used
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
                  <p className="text-2xl font-bold text-gray-900">{databaseMetrics.queryTime}ms</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                    -5% from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Slow Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{databaseMetrics.slowQueries}</p>
                  <p className="text-xs text-red-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +1 from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Locks Waiting</p>
                  <p className="text-2xl font-bold text-gray-900">{databaseMetrics.locksWaiting}</p>
                  <p className="text-xs text-green-600 mt-1">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Healthy
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Database Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Database Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database Type</span>
                  <span className="text-sm font-medium text-gray-900">PostgreSQL 15.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-gray-900">{databaseMetrics.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Table Size</span>
                  <span className="text-sm font-medium text-gray-900">{databaseMetrics.tableSize} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Index Size</span>
                  <span className="text-sm font-medium text-gray-900">{databaseMetrics.indexSize} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(databaseMetrics.tableSize + databaseMetrics.indexSize).toFixed(1)} GB
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Performance Settings</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Connections</span>
                  <span className="text-sm font-medium text-gray-900">{databaseMetrics.maxConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shared Buffers</span>
                  <span className="text-sm font-medium text-gray-900">2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Work Memory</span>
                  <span className="text-sm font-medium text-gray-900">64 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenance Work Memory</span>
                  <span className="text-sm font-medium text-gray-900">512 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Checkpoint Segments</span>
                  <span className="text-sm font-medium text-gray-900">32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* API Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requests/min</p>
                  <p className="text-2xl font-bold text-gray-900">{apiMetrics.requestsPerMinute.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{apiMetrics.avgResponseTime}ms</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                    -8% from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{apiMetrics.errorRate}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Within target
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cache Hit Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">{apiMetrics.cacheHitRatio}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Excellent
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* API Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance (24h)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={apiPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#3b82f6" />
                <Bar dataKey="responseTime" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional API Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Connection Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Connections</span>
                  <span className="text-sm font-medium text-gray-900">{apiMetrics.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">P95 Response Time</span>
                  <span className="text-sm font-medium text-gray-900">{apiMetrics.p95ResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rate Limit Hits</span>
                  <span className="text-sm font-medium text-gray-900">{apiMetrics.rateLimitHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Queue Size</span>
                  <span className="text-sm font-medium text-gray-900">{apiMetrics.queueSize}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">API Endpoints</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">/api/tasks</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">/api/users</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">/api/auth</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">/api/payments</span>
                  <span className="text-sm font-medium text-yellow-600">Slow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{alerts.filter(a => !a.resolved).length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">{alerts.filter(a => a.resolved).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.type === 'error' && !a.resolved).length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  alert.resolved 
                    ? 'bg-gray-50 border-gray-200' 
                    : alert.type === 'error' 
                      ? 'bg-red-50 border-red-200'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {alert.resolved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500">Source: {alert.source}</p>
                      {!alert.resolved && (
                        <button
                          onClick={() => onResolveAlert?.(alert.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-300 hover:bg-blue-50"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


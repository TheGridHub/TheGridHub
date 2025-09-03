'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  MousePointer
} from 'lucide-react'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ComposedChart
} from 'recharts'

interface UserBehaviorData {
  date: string
  activeUsers: number
  sessions: number
  pageViews: number
  avgSessionDuration: number
  bounceRate: number
}

interface RevenueData {
  date: string
  revenue: number
  transactions: number
  mrr: number
  churn: number
}

interface FeatureUsageData {
  feature: string
  users: number
  usage: number
  trend: 'up' | 'down' | 'stable'
}

interface GeoData {
  country: string
  users: number
  sessions: number
  revenue: number
}

interface DeviceData {
  device: string
  users: number
  percentage: number
  color: string
}

interface ConversionFunnelData {
  step: string
  users: number
  conversionRate: number
}

interface AnalyticsProps {
  onExportReport?: (reportType: string, dateRange: string) => void
}

export default function Analytics({ onExportReport }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30')
  const [selectedMetric, setSelectedMetric] = useState('users')

  // Sample analytics data
  const userBehaviorData: UserBehaviorData[] = [
    { date: '2024-01-01', activeUsers: 1250, sessions: 2150, pageViews: 8500, avgSessionDuration: 145, bounceRate: 35 },
    { date: '2024-01-02', activeUsers: 1380, sessions: 2380, pageViews: 9200, avgSessionDuration: 152, bounceRate: 32 },
    { date: '2024-01-03', activeUsers: 1200, sessions: 2050, pageViews: 8100, avgSessionDuration: 138, bounceRate: 38 },
    { date: '2024-01-04', activeUsers: 1450, sessions: 2650, pageViews: 10200, avgSessionDuration: 165, bounceRate: 28 },
    { date: '2024-01-05', activeUsers: 1650, sessions: 2950, pageViews: 11800, avgSessionDuration: 172, bounceRate: 25 },
    { date: '2024-01-06', activeUsers: 1580, sessions: 2850, pageViews: 11200, avgSessionDuration: 168, bounceRate: 27 },
    { date: '2024-01-07', activeUsers: 1420, sessions: 2420, pageViews: 9800, avgSessionDuration: 158, bounceRate: 31 }
  ]

  const revenueData: RevenueData[] = [
    { date: '2024-01-01', revenue: 12500, transactions: 45, mrr: 85000, churn: 2.1 },
    { date: '2024-01-02', revenue: 15200, transactions: 52, mrr: 86200, churn: 1.8 },
    { date: '2024-01-03', revenue: 11800, transactions: 38, mrr: 87100, churn: 2.3 },
    { date: '2024-01-04', revenue: 18900, transactions: 67, mrr: 88500, churn: 1.5 },
    { date: '2024-01-05', revenue: 22300, transactions: 78, mrr: 89800, churn: 1.2 },
    { date: '2024-01-06', revenue: 19600, transactions: 72, mrr: 91200, churn: 1.4 },
    { date: '2024-01-07', revenue: 16800, transactions: 58, mrr: 92500, churn: 1.6 }
  ]

  const featureUsageData: FeatureUsageData[] = [
    { feature: 'Task Creation', users: 2450, usage: 95, trend: 'up' },
    { feature: 'Project Management', users: 1890, usage: 78, trend: 'up' },
    { feature: 'AI Suggestions', users: 1650, usage: 68, trend: 'up' },
    { feature: 'Time Tracking', users: 1420, usage: 58, trend: 'stable' },
    { feature: 'Team Collaboration', users: 1280, usage: 52, trend: 'down' },
    { feature: 'Reporting', users: 980, usage: 40, trend: 'stable' },
    { feature: 'Integrations', users: 750, usage: 31, trend: 'up' },
    { feature: 'Mobile App', users: 1950, usage: 80, trend: 'up' }
  ]

  const geoData: GeoData[] = [
    { country: 'United States', users: 8500, sessions: 15200, revenue: 125000 },
    { country: 'United Kingdom', users: 3200, sessions: 5800, revenue: 45000 },
    { country: 'Canada', users: 2800, sessions: 4900, revenue: 38000 },
    { country: 'Germany', users: 2400, sessions: 4200, revenue: 32000 },
    { country: 'Australia', users: 1900, sessions: 3400, revenue: 28000 },
    { country: 'France', users: 1600, sessions: 2800, revenue: 22000 },
    { country: 'Netherlands', users: 1200, sessions: 2100, revenue: 18000 },
    { country: 'Other', users: 4200, sessions: 7500, revenue: 42000 }
  ]

  const deviceData: DeviceData[] = [
    { device: 'Desktop', users: 12500, percentage: 62, color: '#3b82f6' },
    { device: 'Mobile', users: 6800, percentage: 34, color: '#10b981' },
    { device: 'Tablet', users: 800, percentage: 4, color: '#f59e0b' }
  ]

  const conversionFunnelData: ConversionFunnelData[] = [
    { step: 'Visitors', users: 25000, conversionRate: 100 },
    { step: 'Sign Ups', users: 3500, conversionRate: 14 },
    { step: 'Email Verified', users: 2800, conversionRate: 80 },
    { step: 'First Task Created', users: 2100, conversionRate: 75 },
    { step: 'Paid Subscription', users: 420, conversionRate: 20 }
  ]

  const calculateKPIs = () => {
    const totalUsers = userBehaviorData.reduce((sum, day) => sum + day.activeUsers, 0) / userBehaviorData.length
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0)
    const avgSessionDuration = userBehaviorData.reduce((sum, day) => sum + day.avgSessionDuration, 0) / userBehaviorData.length
    const avgBounceRate = userBehaviorData.reduce((sum, day) => sum + day.bounceRate, 0) / userBehaviorData.length
    const conversionRate = (conversionFunnelData[4].users / conversionFunnelData[0].users) * 100
    const mrr = revenueData[revenueData.length - 1].mrr

    return {
      totalUsers: Math.round(totalUsers),
      totalRevenue: Math.round(totalRevenue),
      avgSessionDuration: Math.round(avgSessionDuration),
      avgBounceRate: Math.round(avgBounceRate),
      conversionRate: Math.round(conversionRate * 100) / 100,
      mrr
    }
  }

  const kpis = calculateKPIs()

  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    if (change > 5) return { icon: <TrendingUp className="h-3 w-3" />, color: 'text-green-600', change }
    if (change < -5) return { icon: <TrendingDown className="h-3 w-3" />, color: 'text-red-600', change }
    return { icon: <ArrowUpRight className="h-3 w-3" />, color: 'text-gray-600', change }
  }

  const getFeatureTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
            <p className="text-gray-600">Comprehensive insights into user behavior and business performance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            
            <button
              onClick={() => onExportReport?.(activeTab, dateRange)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Behavior', icon: Users },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'features', label: 'Feature Usage', icon: Activity },
              { id: 'geography', label: 'Geography', icon: Globe },
              { id: 'conversion', label: 'Conversion', icon: Target }
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% vs last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${kpis.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18.2% vs last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.conversionRate}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1% vs last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${kpis.mrr.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15.8% vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Combined Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={userBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Legend />
                <Bar yAxisId="left" dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
                <Line yAxisId="right" type="monotone" dataKey="avgSessionDuration" stroke="#10b981" strokeWidth={2} name="Avg Session (min)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Device & Geography Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="users"
                    label={({ device, percentage }) => `${device}: ${percentage}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
              <div className="space-y-4">
                {geoData.slice(0, 5).map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center">
                        <Globe className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{country.users.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">${country.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Behavior Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.avgSessionDuration}min</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.avgBounceRate}%</p>
                </div>
                <MousePointer className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userBehaviorData.reduce((sum, day) => sum + day.pageViews, 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* User Behavior Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={userBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Session Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Quality Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={userBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Line type="monotone" dataKey="avgSessionDuration" stroke="#8b5cf6" strokeWidth={2} name="Session Duration (min)" />
                <Line type="monotone" dataKey="bounceRate" stroke="#f59e0b" strokeWidth={2} name="Bounce Rate (%)" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${kpis.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenueData.reduce((sum, day) => sum + day.transactions, 0)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Math.round(kpis.totalRevenue / revenueData.reduce((sum, day) => sum + day.transactions, 0))}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">MRR Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+15.8%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & MRR Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Daily Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={3} name="MRR" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Area type="monotone" dataKey="churn" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Feature Usage Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Adoption</h3>
            <div className="space-y-4">
              {featureUsageData.map((feature) => (
                <div key={feature.feature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getFeatureTrendIcon(feature.trend)}
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.feature}</h4>
                      <p className="text-sm text-gray-500">{feature.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${feature.usage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{feature.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Usage Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featureUsageData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Geography Tab */}
      {activeTab === 'geography' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
            <div className="space-y-4">
              {geoData.map((country) => (
                <div key={country.country} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{country.country}</h4>
                      <p className="text-sm text-gray-500">{country.sessions.toLocaleString()} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{country.users.toLocaleString()} users</div>
                    <div className="text-sm text-green-600">${country.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Country</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geoData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Country</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geoData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Tab */}
      {activeTab === 'conversion' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              {conversionFunnelData.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{step.step}</h4>
                        <p className="text-sm text-gray-500">{step.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{step.conversionRate}%</div>
                      {index > 0 && (
                        <div className="text-sm text-gray-500">
                          from previous step
                        </div>
                      )}
                    </div>
                  </div>
                  {index < conversionFunnelData.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowDownRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel Visualization</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={conversionFunnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}


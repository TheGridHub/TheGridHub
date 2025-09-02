'use client'

import { useState, useEffect } from 'react'
import AdminDashboard from '../../components/admin/AdminDashboard'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminSidebar from '../../components/admin/AdminSidebar'
import UserManagement from '../../components/admin/UserManagement'
import PaymentManagement from '../../components/admin/PaymentManagement'
import UserProfileManager from '../../components/admin/UserProfileManager'
import SystemHealth from '../../components/admin/SystemHealth'
import Analytics from '../../components/admin/Analytics'
import AdminSettings from '../../components/admin/AdminSettings'
import ActivityLogs from '../../components/admin/ActivityLogs'

// Sample data - in production this would come from your backend
const sampleData = {
  stats: {
    totalUsers: 25847,
    activeUsers: 18234,
    totalRevenue: 342580,
    paidUsers: 4567
  },
  users: [],
  payments: [],
  subscriptions: [],
  systemMetrics: {
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    activeConnections: 156
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(sampleData)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Initialize data on component mount
  useEffect(() => {
    // In production, you would fetch real data here
    setData(sampleData)
  }, [])

  // Handler functions for various admin actions
  const handleUserUpdate = async (userId: string, updates: any) => {
    setLoading(true)
    try {
      // In production, make API call to update user
      console.log('Updating user:', userId, updates)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state or refetch data
      // setData(prev => ({ ...prev, users: updatedUsers }))
      
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (userId: string) => {
    setLoading(true)
    try {
      // In production, make API call to initiate password reset
      console.log('Initiating password reset for user:', userId)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to reset password:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (userId: string, newEmail: string) => {
    setLoading(true)
    try {
      // In production, make API call to change email
      console.log('Changing email for user:', userId, 'to:', newEmail)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to change email:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentUpdate = async (paymentId: string, updates: any) => {
    setLoading(true)
    try {
      // In production, make API call to update payment
      console.log('Updating payment:', paymentId, updates)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to update payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionUpdate = async (subscriptionId: string, updates: any) => {
    setLoading(true)
    try {
      // In production, make API call to update subscription
      console.log('Updating subscription:', subscriptionId, updates)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to update subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshMetrics = async () => {
    setLoading(true)
    try {
      // In production, fetch fresh metrics from your monitoring system
      console.log('Refreshing system metrics')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update metrics in state
      setData(prev => ({
        ...prev,
        systemMetrics: {
          ...prev.systemMetrics,
          lastUpdated: new Date().toISOString()
        }
      }))
      
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true)
    try {
      // In production, mark alert as resolved in your system
      console.log('Resolving alert:', alertId)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (reportType: string, dateRange: string) => {
    setLoading(true)
    try {
      // In production, generate and download report
      console.log('Exporting report:', reportType, 'for date range:', dateRange)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate file download
      const blob = new Blob(['Sample report data'], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}_report_${dateRange}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Failed to export report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (settingId: string, value: any) => {
    setLoading(true)
    try {
      // In production, update setting in your backend
      console.log('Updating setting:', settingId, 'to:', value)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Failed to update setting:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureFlagToggle = async (flagId: string, enabled: boolean) => {
    setLoading(true)
    try {
      // In production, toggle feature flag in your system
      console.log('Toggling feature flag:', flagId, 'to:', enabled)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Failed to toggle feature flag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceSchedule = async (maintenance: any) => {
    setLoading(true)
    try {
      // In production, schedule maintenance window
      console.log('Scheduling maintenance:', maintenance)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Failed to schedule maintenance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportLogs = async (filters: any) => {
    setLoading(true)
    try {
      // In production, export activity logs with applied filters
      console.log('Exporting activity logs with filters:', filters)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate CSV download
      const blob = new Blob(['Sample activity log data'], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Failed to export logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewLogDetails = (logId: string) => {
    // In production, you might want to track which logs are being viewed
    console.log('Viewing log details for:', logId)
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard data={data} />
        
      case 'users':
        return (
          <UserManagement 
            users={data.users} 
            onUserUpdate={handleUserUpdate} 
          />
        )
        
      case 'user-profile':
        return selectedUser ? (
          <UserProfileManager
            userId={selectedUser}
            onUserUpdate={handleUserUpdate}
            onPasswordReset={handlePasswordReset}
            onEmailChange={handleEmailChange}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Select a user from User Management to view their profile</p>
          </div>
        )
        
      case 'payments':
        return (
          <PaymentManagement
            payments={data.payments}
            subscriptions={data.subscriptions}
            onPaymentUpdate={handlePaymentUpdate}
            onSubscriptionUpdate={handleSubscriptionUpdate}
          />
        )
        
      case 'system':
        return (
          <SystemHealth
            onRefreshMetrics={handleRefreshMetrics}
            onResolveAlert={handleResolveAlert}
          />
        )
        
      case 'analytics':
        return (
          <Analytics
            onExportReport={handleExportReport}
          />
        )
        
      case 'settings':
        return (
          <AdminSettings
            onSettingChange={handleSettingChange}
            onFeatureFlagToggle={handleFeatureFlagToggle}
            onMaintenanceSchedule={handleMaintenanceSchedule}
          />
        )
        
      case 'activity':
        return (
          <ActivityLogs
            onExportLogs={handleExportLogs}
            onViewDetails={handleViewLogDetails}
          />
        )
        
      default:
        return <AdminDashboard data={data} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <AdminHeader stats={data.stats} />
      
      <div className="flex h-screen pt-16"> {/* pt-16 to account for fixed header */}
        {/* Admin Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {loading && (
            <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          )}
          
          {renderActiveTab()}
        </main>
      </div>
    </div>
  )
}

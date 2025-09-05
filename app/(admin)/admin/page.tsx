'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import dynamic from 'next/dynamic'
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), { ssr: false })
const UserManagement = dynamic(() => import('@/components/admin/UserManagement'), { ssr: false })
const PaymentManagement = dynamic(() => import('@/components/admin/PaymentManagement'), { ssr: false })
const SystemHealth = dynamic(() => import('@/components/admin/SystemHealth'), { ssr: false })
const Analytics = dynamic(() => import('@/components/admin/Analytics'), { ssr: false })
const Settings = dynamic(() => import('@/components/admin/Settings'), { ssr: false })

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch initial admin data
    const fetchAdminData = async () => {
      try {
        const [usersRes, paymentsRes, systemRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/payments'),
          fetch('/api/admin/system-health')
        ])

        const [users, payments, systemHealth] = await Promise.all([
          usersRes.json(),
          paymentsRes.json(),
          systemRes.json()
        ])

        setAdminData({
          users,
          payments,
          systemHealth,
          stats: {
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
            totalRevenue: payments.reduce((sum: number, p: any) => sum + p.amount, 0),
            paidUsers: users.filter((u: any) => u.subscription !== 'personal').length
          }
        })
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard data={adminData} />
      case 'users':
        return <UserManagement users={adminData?.users || []} onUserUpdate={handleUserUpdate} />
      case 'payments':
        return (
          <PaymentManagement 
            payments={adminData?.payments || []} 
            subscriptions={adminData?.subscriptions || []}
            onPaymentUpdate={() => {}}
            onSubscriptionUpdate={() => {}}
          />
        )
      case 'system':
        return <SystemHealth />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <Settings />
      default:
        return <AdminDashboard data={adminData} />
    }
  }

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        // Refresh admin data
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <AdminHeader stats={adminData?.stats} />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface Payment {
  id: string
  userId: string
  userEmail: string
  userName: string
  amount: number
  currency: string
  status: 'successful' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  subscriptionPlan: 'personal' | 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  transactionDate: string
  subscriptionId?: string
  invoiceId: string
  refundAmount?: number
  refundReason?: string
}

interface Subscription {
  id: string
  userId: string
  userEmail: string
  userName: string
  plan: 'personal' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  billingCycle: 'monthly' | 'yearly'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  amount: number
  currency: string
  paymentMethod: string
}

interface PaymentManagementProps {
  payments: Payment[]
  subscriptions: Subscription[]
  onPaymentUpdate: (paymentId: string, updates: any) => void
  onSubscriptionUpdate: (subscriptionId: string, updates: any) => void
}

export default function PaymentManagement({ 
  payments, 
  subscriptions, 
  onPaymentUpdate, 
  onSubscriptionUpdate 
}: PaymentManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [dateRange, setDateRange] = useState('30')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)

  // Sample data (replace with actual data from your backend)
  const samplePayments: Payment[] = [
    {
      id: 'pay_1',
      userId: '1',
      userEmail: 'john@example.com',
      userName: 'John Doe',
      amount: 12.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'Visa ending in 4242',
      subscriptionPlan: 'pro',
      billingCycle: 'monthly',
      transactionDate: '2024-01-15T10:30:00Z',
      subscriptionId: 'sub_1',
      invoiceId: 'inv_001'
    },
    {
      id: 'pay_2',
      userId: '2',
      userEmail: 'sarah@company.com',
      userName: 'Sarah Smith',
      amount: 50.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'Mastercard ending in 5555',
      subscriptionPlan: 'enterprise',
      billingCycle: 'monthly',
      transactionDate: '2024-01-14T14:20:00Z',
      subscriptionId: 'sub_2',
      invoiceId: 'inv_002'
    },
    {
      id: 'pay_3',
      userId: '3',
      userEmail: 'mike@startup.co',
      userName: 'Mike Wilson',
      amount: 144.00,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'Visa ending in 1234',
      subscriptionPlan: 'pro',
      billingCycle: 'yearly',
      transactionDate: '2024-01-13T09:15:00Z',
      subscriptionId: 'sub_3',
      invoiceId: 'inv_003'
    }
  ]

  const sampleSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      userId: '1',
      userEmail: 'john@example.com',
      userName: 'John Doe',
      plan: 'pro',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: '2024-01-15',
      currentPeriodEnd: '2024-02-15',
      cancelAtPeriodEnd: false,
      amount: 12.00,
      currency: 'USD',
      paymentMethod: 'Visa ending in 4242'
    },
    {
      id: 'sub_2',
      userId: '2',
      userEmail: 'sarah@company.com',
      userName: 'Sarah Smith',
      plan: 'enterprise',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: '2024-01-14',
      currentPeriodEnd: '2024-02-14',
      cancelAtPeriodEnd: false,
      amount: 50.00,
      currency: 'USD',
      paymentMethod: 'Mastercard ending in 5555'
    }
  ]

  // Use sample data if none provided
  const displayPayments = payments.length > 0 ? payments : samplePayments
  const displaySubscriptions = subscriptions.length > 0 ? subscriptions : sampleSubscriptions

  // Revenue chart data
  const revenueData = [
    { name: 'Jan', revenue: 12400, transactions: 42 },
    { name: 'Feb', revenue: 15600, transactions: 54 },
    { name: 'Mar', revenue: 18900, transactions: 67 },
    { name: 'Apr', revenue: 22300, transactions: 78 },
    { name: 'May', revenue: 26800, transactions: 89 },
    { name: 'Jun', revenue: 31200, transactions: 104 }
  ]

  const subscriptionDistribution = [
    { name: 'Personal', value: 45, amount: 0, color: '#94a3b8' },
    { name: 'Pro', value: 35, amount: 4200, color: '#3b82f6' },
    { name: 'Enterprise', value: 20, amount: 10000, color: '#8b5cf6' }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      successful: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-orange-100 text-orange-800',
      trialing: 'bg-blue-100 text-blue-800'
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      personal: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return badges[plan as keyof typeof badges] || badges.personal
  }

  const handleRefund = async (paymentId: string, amount: number, reason: string) => {
    try {
      onPaymentUpdate(paymentId, { 
        status: 'refunded', 
        refundAmount: amount, 
        refundReason: reason 
      })
      setShowRefundModal(false)
    } catch (error) {
      console.error('Refund failed:', error)
    }
  }

  const calculateMetrics = () => {
    const totalRevenue = displayPayments
      .filter(p => p.status === 'successful')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const monthlyRevenue = displayPayments
      .filter(p => p.status === 'successful' && new Date(p.transactionDate).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + p.amount, 0)
    
    const activeSubscriptions = displaySubscriptions.filter(s => s.status === 'active').length
    const churnRate = (displaySubscriptions.filter(s => s.status === 'cancelled').length / displaySubscriptions.length * 100) || 0

    return { totalRevenue, monthlyRevenue, activeSubscriptions, churnRate }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600">Manage subscriptions, payments, and billing</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Sync Stripe</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'payments', label: 'Payments' },
              { id: 'subscriptions', label: 'Subscriptions' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last month
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
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.monthlyRevenue.toFixed(2)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +8% vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeSubscriptions}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    {((metrics.activeSubscriptions / displaySubscriptions.length) * 100).toFixed(1)}% active
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.churnRate.toFixed(1)}%</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -2% from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Plans</option>
                <option value="personal">Personal</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>

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
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.invoiceId}</div>
                          <div className="text-sm text-gray-500">{payment.paymentMethod}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                          <div className="text-sm text-gray-500">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">{payment.billingCycle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(payment.status)}`}>
                          {payment.status === 'successful' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPlanBadge(payment.subscriptionPlan)}`}>
                          {payment.subscriptionPlan === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                          {payment.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Subscription Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600">
                {displaySubscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Cancelled This Month</p>
              <p className="text-2xl font-bold text-red-600">
                {displaySubscriptions.filter(s => s.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                ${displaySubscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displaySubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.userName}</div>
                          <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPlanBadge(subscription.plan)}`}>
                          {subscription.plan === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                          {subscription.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${subscription.amount.toFixed(2)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="transactions" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional analytics components would go here */}
        </div>
      )}
    </div>
  )
}

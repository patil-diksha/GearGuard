import { useState, useEffect } from 'react'
import { Wrench, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    openRequests: 0,
    overdueRequests: 0,
    completedRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [equipmentRes, requestsRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/requests'),
      ])

      const requests = requestsRes.data
      setStats({
        totalEquipment: equipmentRes.data.length,
        openRequests: requests.filter(r => r.stage_id.name !== 'Repaired' && r.stage_id.name !== 'Scrap').length,
        overdueRequests: requests.filter(r => r.is_overdue).length,
        completedRequests: requests.filter(r => r.stage_id.name === 'Repaired').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: Wrench,
      color: 'bg-blue-500',
    },
    {
      title: 'Open Requests',
      value: stats.openRequests,
      icon: FileText,
      color: 'bg-yellow-500',
    },
    {
      title: 'Overdue Requests',
      value: stats.overdueRequests,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Completed Requests',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to GearGuard</h2>
        <p className="text-gray-600">
          GearGuard is your comprehensive maintenance management system. Track equipment, 
          manage maintenance teams, and monitor repair requests all in one place.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Equipment</h3>
            <p className="text-sm text-blue-600">
              Manage and track all your company assets
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Teams</h3>
            <p className="text-sm text-green-600">
              Organize maintenance teams and assign technicians
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Requests</h3>
            <p className="text-sm text-purple-600">
              Track and manage all maintenance requests
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

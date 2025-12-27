'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface Equipment {
  id: number
  name: string
  serialNumber: string
  category: string
  assignedMaintenanceTeamId?: number
}

interface MaintenanceRequest {
  id: number
  subject: string
  status: string
  type: string
  createdAt: string
  equipmentId: number
  duration?: number
  equipment: Equipment
}

interface Team {
  id: number
  teamName: string
  specialization: string
}

export default function DashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [equipRes, reqRes, teamRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/requests'),
        fetch('/api/teams')
      ])

      const [equipData, reqData, teamData] = await Promise.all([
        equipRes.json(),
        reqRes.json(),
        teamRes.json()
      ])

      setEquipment(equipData)
      setRequests(reqData)
      setTeams(teamData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Calculate KPIs
  const totalEquipment = equipment.length
  const activeRequests = requests.filter(r => r.status !== 'REPAIRED' && r.status !== 'SCRAP').length
  const completedThisWeek = requests.filter(r => {
    const createdAt = new Date(r.createdAt)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return (r.status === 'REPAIRED' || r.status === 'SCRAP') && createdAt >= oneWeekAgo
  }).length

  // Calculate average repair time (in hours)
  const completedRequests = requests.filter(r => r.status === 'REPAIRED' && r.duration)
  const avgRepairTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) / completedRequests.length
    : 0

  // Prepare data for charts
  const requestsByTeam = teams.map(team => ({
    name: team.teamName,
    count: requests.filter(r => r.equipment?.assignedMaintenanceTeamId === team.id).length
  }))

  const requestsByCategory = equipment.reduce((acc, equip) => {
    const category = equip.category || 'Other'
    acc[category] = (acc[category] || 0) + requests.filter(r => r.equipmentId === equip.id).length
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(requestsByCategory).map(([name, count]) => ({
    name,
    count
  }))

  // Timeline data (last 30 days)
  const timelineData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const count = requests.filter(r => {
      const reqDate = new Date(r.createdAt)
      return reqDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr
    }).length
    return { date: dateStr, count }
  })

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Maintenance Management Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalEquipment}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeRequests}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed This Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedThisWeek}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Repair Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgRepairTime.toFixed(1)}h</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests per Team - Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requests per Team</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsByTeam}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Requests per Equipment Category - Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Requests per Equipment Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Request Timeline - Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Timeline (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team Workload - Horizontal Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Workload</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teams.map(team => ({
              name: team.teamName,
              new: requests.filter(r => r.equipment?.assignedMaintenanceTeamId === team.id && r.status === 'NEW').length,
              inProgress: requests.filter(r => r.equipment?.assignedMaintenanceTeamId === team.id && r.status === 'IN_PROGRESS').length,
              repaired: requests.filter(r => r.equipment?.assignedMaintenanceTeamId === team.id && r.status === 'REPAIRED').length
            }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="new" stackId="a" fill="#ef4444" name="New" />
              <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
              <Bar dataKey="repaired" stackId="a" fill="#10b981" name="Repaired" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Fetch stats data (always call hooks before conditional returns)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const [equipRes, reqRes, teamRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/requests'),
        fetch('/api/teams')
      ])

      const [equipment, requests, teams] = await Promise.all([
        equipRes.json(),
        reqRes.json(),
        teamRes.json()
      ])

      const activeRequests = requests.filter((r: any) => 
        !['REPAIRED', 'SCRAP'].includes(r.status)
      ).length

      const overdueRequests = requests.filter((r: any) => 
        !['REPAIRED', 'SCRAP'].includes(r.status) &&
        r.scheduledDate &&
        new Date(r.scheduledDate) < new Date()
      ).length

      return {
        totalEquipment: equipment.length,
        totalTeams: teams.length,
        activeRequests,
        overdueRequests,
        completedRequests: requests.filter((r: any) => 
          r.status === 'REPAIRED'
        ).length
      }
    },
    enabled: !!user // Only fetch data when user is authenticated
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render content if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GearGuard</h1>
                <p className="text-sm text-gray-600">Maintenance Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Dashboard
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to GearGuard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your equipment maintenance operations with intelligent tracking, 
            team management, and preventive maintenance scheduling.
          </p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold text-gray-900">{stats?.totalEquipment || 0}</p>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold text-gray-900">{stats?.activeRequests || 0}</p>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow border-l-4 border-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold text-red-600">{stats?.overdueRequests || 0}</p>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Maintenance Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold text-gray-900">{stats?.totalTeams || 0}</p>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/kanban">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <CardTitle>Kanban Board</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage maintenance requests with drag & drop workflow. Track progress through stages: New → In Progress → Repaired/Scrap.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Open Kanban
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardTitle>Analytics Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View comprehensive analytics including KPIs, team workload, request trends, and equipment category breakdowns.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/equipment">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <CardTitle>Equipment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Browse and manage all equipment. View maintenance history, check status, and access smart features.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Equipment
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <CardTitle>Calendar</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Schedule and view preventive maintenance on a calendar. Plan ahead and avoid equipment failures.
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/parts">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <CardTitle>Parts Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage spare parts inventory, track usage, and monitor costs across work centers.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Manage Parts
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work-orders">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <CardTitle>Work Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate and track work orders from maintenance requests. Assign technicians and monitor progress.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  View Work Orders
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/activities">
            <Card className="bg-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 rounded-lg p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <CardTitle>Activity Log</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Log and track maintenance activities, including OEE metrics, parts used, and costs.
                </p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  View Activities
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2 mt-1">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Equipment</h4>
                    <p className="text-blue-100 text-sm">
                      Go to Equipment page and add your equipment with details like category, location, and default maintenance team.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2 mt-1">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Request</h4>
                    <p className="text-blue-100 text-sm">
                      From the Kanban board, create a new maintenance request. Equipment selection auto-fills team and category.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2 mt-1">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Track Progress</h4>
                    <p className="text-blue-100 text-sm">
                      Drag and drop requests between stages. Overdue items are marked with red indicators.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 rounded-full p-2 mt-1">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Analyze Data</h4>
                    <p className="text-blue-100 text-sm">
                      Visit the Dashboard to view analytics, team workload, and identify patterns in maintenance requests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-gray-600 text-sm">
            GearGuard Maintenance Management System • Built with Next.js, Prisma, and PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  )
}

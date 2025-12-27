'use client'

import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type EquipmentDetail = {
  id: string
  name: string
  serialNumber: string
  department: string | null
  owner: string | null
  location: string
  category: string | null
  purchaseDate: string | null
  warrantyEnd: string | null
  isScrapped: boolean
  assignedMaintenanceTeam: {
    id: string
    name: string
    members: string[]
  } | null
  maintenanceRequests: Array<{
    id: string
    subject: string
    description?: string
    type: string
    status: string
    assignedTechnician: string | null
    scheduledDate: string | null
    duration: number | null
    createdAt: string
    equipment: {
      name: string
      category: string | null
    }
  }>
  activities?: Array<{
    id: string
    action: string
    timestamp: string
    team: {
      teamName: string
    }
  }>
}

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'details'

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id, tab],
    queryFn: async () => {
      const response = await fetch(`/api/equipment/${id}?tab=${tab}`)
      if (!response.ok) throw new Error('Failed to fetch equipment')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Equipment not found</div>
      </div>
    )
  }

  const openRequests = equipment.maintenanceRequests.filter(
    (r: { status: string }) => !['REPAIRED', 'SCRAP'].includes(r.status)
  )

  const overdueRequests = equipment.maintenanceRequests.filter(
    (r: { status: string; scheduledDate: string | null }) =>
      !['REPAIRED', 'SCRAP'].includes(r.status) &&
      r.scheduledDate &&
      new Date(r.scheduledDate) < new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-sm text-gray-500">{equipment.serialNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/equipment">
              <Button variant="outline">Back to Equipment</Button>
            </Link>
            <Link href="/kanban">
              <Button variant="outline">Kanban Board</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              window.location.href = `/equipment/${id}`
            }}
            className={`px-4 py-3 text-sm font-medium ${
              tab === 'details'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => {
              window.location.href = `/equipment/${id}?tab=maintenance`
            }}
            className={`px-4 py-3 text-sm font-medium ${
              tab === 'maintenance'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Maintenance ({openRequests.length})
            {overdueRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {overdueRequests.length} overdue
              </span>
            )}
          </button>
          <button
            onClick={() => {
              window.location.href = `/equipment/${id}?tab=activities`
            }}
            className={`px-4 py-3 text-sm font-medium ${
              tab === 'activities'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity Log
          </button>
        </div>
      </div>

      <main className="p-6">
        {tab === 'details' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Badge */}
            {equipment.isScrapped && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800 font-medium">
                    This equipment has been marked as scrapped
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Smart Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/kanban?equipmentId=${equipment.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View {openRequests.length} Active Requests
                    </Button>
                  </Link>
                  {overdueRequests.length > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ {overdueRequests.length} overdue request(s)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/calendar">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View Scheduled Maintenance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Equipment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-lg">{equipment.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg">{equipment.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {equipment.department ? 'Department' : 'Owner'}
                  </p>
                  <p className="text-lg">{equipment.department || equipment.owner || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Date</p>
                  <p className="text-lg">
                    {equipment.purchaseDate
                      ? new Date(equipment.purchaseDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Warranty End</p>
                  <p className="text-lg">
                    {equipment.warrantyEnd
                      ? new Date(equipment.warrantyEnd).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                {equipment.assignedMaintenanceTeam && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned Maintenance Team</p>
                    <p className="text-lg">{equipment.assignedMaintenanceTeam.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Members: {equipment.assignedMaintenanceTeam.members.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'maintenance' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.maintenanceRequests.map((request: any) => {
                    const isOverdue =
                      request.scheduledDate &&
                      new Date(request.scheduledDate) < new Date() &&
                      !['REPAIRED', 'SCRAP'].includes(request.status)

                    return (
                      <Card 
                        key={request.id} 
                        className={`p-4 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
                      >
                        {isOverdue && (
                          <div className="flex items-center text-red-600 text-sm font-medium mb-2">
                            <span className="mr-1">⚠️</span>
                            <span>Overdue by {Math.floor((new Date().getTime() - new Date(request.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{request.subject}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge
                                variant={
                                  request.type === 'PREVENTIVE' ? 'secondary' : 'default'
                                }
                              >
                                {request.type === 'PREVENTIVE'
                                  ? 'Preventive'
                                  : 'Corrective'}
                              </Badge>
                              <Badge
                                variant={
                                  request.status === 'REPAIRED'
                                    ? 'default'
                                    : request.status === 'SCRAP'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {request.status
                                  .toLowerCase()
                                  .split('_')
                                  .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                                  .join(' ')}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {request.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {request.description}
                          </p>
                        )}
                        {request.assignedTechnician && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-6 h-6">
                              <div className="w-full h-full bg-gray-500 text-white flex items-center justify-center text-xs">
                                {request.assignedTechnician
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')}
                              </div>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {request.assignedTechnician}
                            </span>
                          </div>
                        )}
                        {request.scheduledDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                          </p>
                        )}
                        {request.duration && (
                          <p className="text-sm text-gray-500">
                            Duration: {request.duration} hours
                          </p>
                        )}
                      </Card>
                    )
                  })}
                  {equipment.maintenanceRequests.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No maintenance requests found</p>
                      <Link href="/kanban">
                        <Button>Create New Request</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'activities' && equipment.activities && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No activity recorded yet
                    </p>
                  ) : (
                    equipment.activities.map((activity: any) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 rounded-full p-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{activity.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.team?.teamName}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

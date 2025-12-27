'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorkCenter {
  id: string
  name: string
}

interface Part {
  id: string
  name: string
  serialNo: string
}

interface Equipment {
  id: string
  name: string
  serialNumber: string
}

interface Activity {
  id: string
  requestId: string
  workOrderId?: string
  name: string
  description?: string
  workCenterId?: string
  technician?: string
  startDate?: string
  endDate?: string
  status: string
  partsUsed: string[]
  cost?: number
  oeeAchieved?: number
  createdAt: string
  updatedAt: string
  request: {
    id: string
    subject: string
    equipment: Equipment
  }
  workOrder?: {
    id: string
    workCenter: WorkCenter
  }
  workCenter?: WorkCenter
  parts: Part[]
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    requestId: '',
    workOrderId: '',
    name: '',
    description: '',
    workCenterId: '',
    technician: '',
    startDate: '',
    endDate: '',
    status: 'PENDING',
    partsUsed: '',
    cost: '',
    oeeAchieved: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchActivities()
    fetchWorkCenters()
    fetchRequests()
    fetchWorkOrders()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/activities')
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setActivities(data)
      } else {
        setActivities([])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkCenters = async () => {
    try {
      const response = await fetch('/api/work-centers')
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setWorkCenters(data)
      } else {
        setWorkCenters([])
      }
    } catch (error) {
      console.error('Error fetching work centers:', error)
      setWorkCenters([])
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setRequests(data)
      } else {
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      setRequests([])
    }
  }

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/work-orders')
      const data = await response.json()
      if (response.ok && Array.isArray(data)) {
        setWorkOrders(data)
      } else {
        setWorkOrders([])
      }
    } catch (error) {
      console.error('Error fetching work orders:', error)
      setWorkOrders([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          partsUsed: formData.partsUsed ? formData.partsUsed.split(',').map(s => s.trim()) : [],
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          oeeAchieved: formData.oeeAchieved ? parseFloat(formData.oeeAchieved) : undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create activity')
      }

      await fetchActivities()
      
      setFormData({
        requestId: '',
        workOrderId: '',
        name: '',
        description: '',
        workCenterId: '',
        technician: '',
        startDate: '',
        endDate: '',
        status: 'PENDING',
        partsUsed: '',
        cost: '',
        oeeAchieved: ''
      })
      setIsDialogOpen(false)
    } catch (error: any) {
      alert(error.message || 'Failed to create activity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-2">Track maintenance activities and performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestId">Request *</Label>
                  <select
                    id="requestId"
                    required
                    value={formData.requestId}
                    onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select request...</option>
                    {requests.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="workOrderId">Work Order</Label>
                  <select
                    id="workOrderId"
                    value={formData.workOrderId}
                    onChange={(e) => setFormData({ ...formData, workOrderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select work order...</option>
                    {workOrders.map((wo) => (
                      <option key={wo.id} value={wo.id}>
                        {wo.workCenter.name} - {wo.priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Activity Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Replace Conveyor Belt"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the activity..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workCenterId">Work Center</Label>
                  <select
                    id="workCenterId"
                    value={formData.workCenterId}
                    onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select work center...</option>
                    {workCenters.map(wc => (
                      <option key={wc.id} value={wc.id}>{wc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="technician">Technician</Label>
                  <Input
                    id="technician"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Technician name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="partsUsed">Parts Used (comma-separated)</Label>
                <Input
                  id="partsUsed"
                  value={formData.partsUsed}
                  onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
                  placeholder="e.g., Motor M-2024-X1, Bearing B-123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="oeeAchieved">OEE Achieved (%)</Label>
                  <Input
                    id="oeeAchieved"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.oeeAchieved}
                    onChange={(e) => setFormData({ ...formData, oeeAchieved: e.target.value })}
                    placeholder="e.g., 85.5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setFormData({
                      requestId: '',
                      workOrderId: '',
                      name: '',
                      description: '',
                      workCenterId: '',
                      technician: '',
                      startDate: '',
                      endDate: '',
                      status: 'PENDING',
                      partsUsed: '',
                      cost: '',
                      oeeAchieved: ''
                    })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Logging...' : 'Log Activity'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No activities logged</p>
              <p className="text-sm text-gray-400 mt-2">Log an activity to track maintenance work</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OEE</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                        {activity.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">{activity.description}</div>
                        )}
                        {activity.partsUsed.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {activity.partsUsed.length} part(s) used
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.request.subject}</div>
                        <div className="text-xs text-gray-500">{activity.request.equipment.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.workCenter?.name || activity.workOrder?.workCenter.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.technician || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.startDate && new Date(activity.startDate).toLocaleDateString()}
                        {activity.startDate && activity.endDate && ' - '}
                        {activity.endDate && new Date(activity.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.cost ? `$${activity.cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.oeeAchieved ? `${activity.oeeAchieved.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

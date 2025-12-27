'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import Link from 'next/link'

type MaintenanceRequest = {
  id: string
  subject: string
  type: string
  status: string
  scheduledDate?: string
  equipment: {
    id: string
    name: string
    serialNumber: string
  }
}

type Activity = {
  id: string
  name: string
  status: string
  startDate?: string
  endDate?: string
  request: {
    id: string
    subject: string
    equipment: {
      id: string
      name: string
      serialNumber: string
    }
  }
  workCenter?: {
    name: string
  }
  technician?: string
}

type CalendarEvent = {
  id: string
  title: string
  date: Date
  type: 'request' | 'activity'
  status: string
  equipment: string
  technician?: string
  workCenter?: string
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await fetch('/api/requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      return response.json()
    },
  })

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    },
  })

  const isLoading = isLoadingRequests || isLoadingActivities

  // Filter for preventive maintenance requests with scheduled dates
  const preventiveRequests = (requests as MaintenanceRequest[]).filter(
    (r: MaintenanceRequest) => r.type === 'PREVENTIVE' && r.scheduledDate
  )

  // Create calendar events from requests and activities
  const calendarEvents: CalendarEvent[] = []

  preventiveRequests.forEach((req: MaintenanceRequest) => {
    if (req.scheduledDate) {
      calendarEvents.push({
        id: req.id,
        title: req.subject,
        date: new Date(req.scheduledDate),
        type: 'request',
        status: req.status,
        equipment: `${req.equipment.name} (${req.equipment.serialNumber})`,
      })
    }
  })

  activities.forEach((activity: Activity) => {
    if (activity.startDate) {
      calendarEvents.push({
        id: activity.id,
        title: activity.name,
        date: new Date(activity.startDate),
        type: 'activity',
        status: activity.status,
        equipment: `${activity.request.equipment.name} (${activity.request.equipment.serialNumber})`,
        technician: activity.technician,
        workCenter: activity.workCenter?.name,
      })
    }
  })

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? calendarEvents.filter((event: CalendarEvent) => {
        return (
          event.date.getDate() === selectedDate.getDate() &&
          event.date.getMonth() === selectedDate.getMonth() &&
          event.date.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  // Get unique dates with events
  const datesWithEvents = Array.from(
    new Set(calendarEvents.map((e: CalendarEvent) => e.date.toDateString()))
  ).map((dateStr) => new Date(dateStr))

  const isDateDisabled = (date: Date) => {
    return !datesWithEvents.some((d: Date) => {
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear()
    })
  }

  const getStatusColor = (status: string, type: string) => {
    if (type === 'request') {
      switch (status) {
        case 'REPAIRED':
          return 'bg-green-100 text-green-800'
        case 'SCRAP':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-blue-100 text-blue-800'
      }
    } else {
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
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Calendar</h1>
            <p className="text-sm text-gray-500">
              Preventive maintenance schedule
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            scheduled: datesWithEvents,
          }}
          modifiersStyles={{
            scheduled: {
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
            },
          }}
          disabled={isDateDisabled}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">
              Scheduled Events ({datesWithEvents.length} days)
            </span>
          </div>
        </div>
      </CardContent>
            </Card>
          </div>

          {/* Scheduled Requests */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? `Scheduled for ${selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : 'Select a date to view scheduled maintenance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event: CalendarEvent) => (
                      <Card key={event.id} className="p-4 border-l-4" style={{
                        borderLeftColor: event.type === 'request' ? '#3b82f6' : '#10b981'
                      }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={event.type === 'request' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                {event.type === 'request' ? 'Request' : 'Activity'}
                              </Badge>
                              <h4 className="font-semibold">{event.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Equipment: {event.equipment}
                            </p>
                            {event.technician && (
                              <p className="text-sm text-gray-600">
                                Technician: {event.technician}
                              </p>
                            )}
                            {event.workCenter && (
                              <p className="text-sm text-gray-600">
                                Work Center: {event.workCenter}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(event.status, event.type)}>
                            {event.status
                              .toLowerCase()
                              .split('_')
                              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')}
                          </Badge>
                        </div>
                        {event.type === 'request' ? (
                          <Link href="/">
                            <Button variant="outline" size="sm" className="mt-2">
                              View Details
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/activities">
                            <Button variant="outline" size="sm" className="mt-2">
                              View Activity
                            </Button>
                          </Link>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {selectedDate
                        ? 'No maintenance scheduled for this date'
                        : 'Select a date from calendar'}
                    </p>
                    {selectedDate && (
                      <div className="flex gap-3 justify-center">
                        <Link href="/">
                          <Button>Create Request</Button>
                        </Link>
                        <Link href="/activities">
                          <Button variant="outline">Log Activity</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

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
  scheduledDate: string
  equipment: {
    id: string
    name: string
    serialNumber: string
  }
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await fetch('/api/requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      return response.json()
    },
  })

  // Filter for preventive maintenance requests
  const preventiveRequests = requests.filter(
    (r: MaintenanceRequest) => r.type === 'PREVENTIVE' && r.scheduledDate
  )

  // Get requests for selected date
  const selectedDateRequests = selectedDate
    ? preventiveRequests.filter((r: MaintenanceRequest) => {
        const requestDate = new Date(r.scheduledDate)
        return (
          requestDate.getDate() === selectedDate.getDate() &&
          requestDate.getMonth() === selectedDate.getMonth() &&
          requestDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : []

  // Get dates with preventive maintenance
  const datesWithMaintenance = preventiveRequests.map((r: MaintenanceRequest) =>
    new Date(r.scheduledDate)
  )

  // Function to get count of requests for a specific date
  const getRequestCountForDate = (date: Date) => {
    return preventiveRequests.filter((r: MaintenanceRequest) => {
      const requestDate = new Date(r.scheduledDate)
      return (
        requestDate.getDate() === date.getDate() &&
        requestDate.getMonth() === date.getMonth() &&
        requestDate.getFullYear() === date.getFullYear()
      )
    }).length
  }

  const isDateDisabled = (date: Date) => {
    return !datesWithMaintenance.some((d: Date) => {
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      )
    })
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
                    scheduled: datesWithMaintenance,
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
                      Scheduled Maintenance ({datesWithMaintenance.length} days)
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
                    ? `Maintenance for ${selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : 'Select a date to view scheduled maintenance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateRequests.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateRequests.map((request: MaintenanceRequest) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{request.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Equipment: {request.equipment.name} ({request.equipment.serialNumber})
                            </p>
                          </div>
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
                        <Link href="/">
                          <Button variant="outline" size="sm" className="mt-2">
                            View Details
                          </Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {selectedDate
                        ? 'No preventive maintenance scheduled for this date'
                        : 'Select a date from the calendar'}
                    </p>
                    {selectedDate && (
                      <Link href="/">
                        <Button>Schedule New Preventive Maintenance</Button>
                      </Link>
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

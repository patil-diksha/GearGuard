import { useState, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('en-GB')
const localizer = momentLocalizer(moment)

const CalendarView = ({ requests, onEdit, onDelete }) => {
  const [view, setView] = useState(Views.MONTH)

  const events = requests
    .filter(r => r.scheduled_date && r.request_type === 'preventive')
    .map(request => ({
      id: request.id,
      title: request.subject,
      start: new Date(request.scheduled_date),
      end: new Date(request.scheduled_date),
      resource: request,
    }))

  const handleSelectEvent = useCallback((event) => {
    onEdit(event.resource)
  }, [onEdit])

  const eventStyleGetter = useCallback((event) => {
    const request = event.resource
    const backgroundColor = request.is_overdue ? '#ef4444' : '#0ea5e9'
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        padding: '2px 4px',
      },
    }
  }, [])

  const dayPropGetter = useCallback((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)
    
    return {
      className: eventDate.getTime() === today.getTime() ? 'bg-blue-50' : '',
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800">Preventive Maintenance Calendar</h3>
        <p className="text-sm text-blue-600">Click on any event to view or edit details</p>
      </div>
      
      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          tooltipAccessor={(event) => event.resource.description}
        />
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No preventive maintenance scheduled</p>
          <p className="text-sm">Requests with "Preventive" type and scheduled dates will appear here</p>
        </div>
      )}
    </div>
  )
}

export default CalendarView

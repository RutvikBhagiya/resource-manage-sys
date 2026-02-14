"use client"

import { Calendar, dateFnsLocalizer, Views, View, ToolbarProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: string
  user: string
  status: string
}

interface BookingCalendarProps {
  events: CalendarEvent[]
}

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent, object>) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 p-1">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')} className="h-8">
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold ml-2">{label}</h2>
      </div>

      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
        <Button
          variant={view === Views.MONTH ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onView(Views.MONTH)}
          className="h-7 text-xs"
        >
          Month
        </Button>
        <Button
          variant={view === Views.WEEK ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onView(Views.WEEK)}
          className="h-7 text-xs"
        >
          Week
        </Button>
        <Button
          variant={view === Views.DAY ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onView(Views.DAY)}
          className="h-7 text-xs"
        >
          Day
        </Button>
      </div>
    </div>
  )
}

export function BookingCalendar({ events }: BookingCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  // Custom styling for events based on status
  const eventPropGetter = (event: CalendarEvent) => {
    let backgroundColor = '#8b5cf6' // violet-500 default
    let borderColor = '#7c3aed'

    // Status colors matching our theme
    if (event.status === 'APPROVED') {
      backgroundColor = '#10b981' // emerald-500
      borderColor = '#059669'
    } else if (event.status === 'PENDING') {
      backgroundColor = '#f59e0b' // amber-500
      borderColor = '#d97706'
    } else if (event.status === 'REJECTED' || event.status === 'CANCELLED') {
      backgroundColor = '#ef4444' // red-500
      borderColor = '#b91c1c'
    }

    // Industrial clean look for events
    return {
      style: {
        backgroundColor: backgroundColor,
        borderColor,
        borderLeftWidth: '4px',
        borderTopWidth: '0',
        borderRightWidth: '0',
        borderBottomWidth: '0',
        borderRadius: '2px',
        color: '#ffffff',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '2px 4px',
        opacity: 0.9
      }
    }
  }

  return (
    <div className="h-[650px] w-full bg-background border rounded-xl shadow-sm p-4">
      <Calendar<CalendarEvent, object>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: CustomToolbar
        }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        popup
        selectable
      />
    </div>
  )
}

"use client"

import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useTheme } from 'next-themes'
import { useState } from 'react'

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

export function BookingCalendar({ events }: BookingCalendarProps) {
    const { theme } = useTheme()
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

        // Glassmorphism effect for events
        return {
            style: {
                backgroundColor: `${backgroundColor}dd`, // 88 = ~53% opacity, dd = ~87%
                borderColor,
                borderWidth: '1px',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 500
            }
        }
    }

    return (
        <div className="h-[600px] w-full bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
            <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-toolbar button {
          color: inherit;
          border-radius: 0.5rem; 
          border: 1px solid rgba(139, 92, 246, 0.2); /* violet-500/20 */
        }
        .rbc-toolbar button:hover {
          background-color: rgba(139, 92, 246, 0.1);
        }
        .rbc-toolbar button.rbc-active {
          background-color: #8b5cf6; /* violet-500 */
          color: white;
          border-color: #8b5cf6;
        }
        .rbc-toolbar button.rbc-active:hover {
          background-color: #7c3aed; /* violet-600 */
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          border-color: rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .rbc-header {
           padding: 8px;
           font-weight: 600;
           border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }
        .rbc-off-range-bg {
          background-color: transparent;
          opacity: 0.3;
        }
        .dark .rbc-off-range-bg {
          background-color: rgba(0,0,0,0.2);
        }
        .rbc-today {
           background-color: rgba(139, 92, 246, 0.05);
        }
        /* Grid lines color */
        .rbc-month-row, .rbc-day-bg, .rbc-time-header-content {
           border-color: rgba(139, 92, 246, 0.1) !important;
        }
      `}</style>
            <Calendar
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
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                popup
                selectable
                messages={{
                    next: 'Next',
                    previous: 'Prev',
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    agenda: 'List'
                }}
            />
        </div>
    )
}

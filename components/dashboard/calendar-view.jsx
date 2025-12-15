"use client"

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card } from "@/components/ui/card"
import { updatePostSchedule } from '@/app/actions/calendar'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

export function CalendarView({ posts = [] }) {
    const { toast } = useToast()
    const router = useRouter()

    // Transform posts to FullCalendar events
    const events = posts.map(post => ({
        id: post.id,
        title: post.caption.substring(0, 20) + (post.caption.length > 20 ? '...' : ''),
        date: post.scheduledAt || post.createdAt,
        // Add visual cues based on status
        backgroundColor: post.status === 'PUBLISHED' ? '#10b981' : '#3b82f6',
        borderColor: post.status === 'PUBLISHED' ? '#10b981' : '#3b82f6',
        extendedProps: {
            imageUrl: post.imageUrls?.[0],
            status: post.status
        }
    }))

    const handleEventDrop = async (info) => {
        // Optimistic update handled by FullCalendar automatically for the UI
        // We just need to sync with server

        const newDate = info.event.start.toISOString()

        toast({
            title: "Rescheduling...",
            description: "Moving post to new date."
        })

        const result = await updatePostSchedule(info.event.id, newDate)

        if (result.error) {
            info.revert() // Revert change in UI if server fails
            toast({
                title: "Error",
                description: "Failed to reschedule post.",
                variant: "destructive"
            })
        } else {
            toast({
                title: "Success",
                description: "Post rescheduled successfully."
            })
            router.refresh()
        }
    }

    const handleEventClick = (info) => {
        // For now, just show a simple alert or log. 
        // In future, this could open a detailed edit modal
        toast({
            title: "Post Details",
            description: `${info.event.title} - ${info.event.extendedProps.status}`
        })
    }

    return (
        <Card className="p-6 bg-card border-border">
            <div className="calendar-wrapper">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    events={events}
                    eventDrop={handleEventDrop}
                    eventClick={handleEventClick}
                    height="auto"
                    aspectRatio={1.5}
                />
            </div>
            <style jsx global>{`
        .fc {
            --fc-border-color: hsl(var(--border));
            --fc-button-bg-color: hsl(var(--primary));
            --fc-button-border-color: hsl(var(--primary));
            --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
            --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
            --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
            --fc-button-active-border-color: hsl(var(--primary) / 0.8);
            --fc-event-bg-color: hsl(var(--primary));
            --fc-event-border-color: hsl(var(--primary));
            --fc-today-bg-color: hsl(var(--accent) / 0.1);
            --fc-neutral-bg-color: hsl(var(--background));
            --fc-page-bg-color: hsl(var(--card));
            --fc-list-event-hover-bg-color: hsl(var(--muted));
            color: hsl(var(--foreground));
        }
        .fc-theme-standard td, .fc-theme-standard th {
            border-color: hsl(var(--border));
        }
        .fc-col-header-cell-cushion, .fc-daygrid-day-number {
            color: hsl(var(--foreground));
            text-decoration: none !important;
        }
        .fc-daygrid-day-number:hover {
            color: hsl(var(--primary));
        }
      `}</style>
        </Card>
    )
}

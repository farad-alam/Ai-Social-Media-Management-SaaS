"use client"

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updatePostSchedule, updateScheduledPost } from '@/app/actions/calendar'
import { deletePost } from '@/app/actions/post'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
export function CalendarView({ posts = [], onRefresh }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [newImageFile, setNewImageFile] = useState(null)
    const [newImagePreview, setNewImagePreview] = useState(null)

    // New scheduling states matching create page
    const [date, setDate] = useState(null)
    const [scheduleHour, setScheduleHour] = useState("12")
    const [scheduleMinute, setScheduleMinute] = useState("00")
    const [scheduleAmPm, setScheduleAmPm] = useState("PM")
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    // Transform posts to FullCalendar events
    const events = posts.map(post => ({
        id: post.id,
        title: post.caption.substring(0, 20) + (post.caption.length > 20 ? '...' : ''),
        date: post.scheduledAt || post.createdAt,
        // Add visual cues based on status
        backgroundColor: post.status === 'PUBLISHED' ? '#10b981' : '#3b82f6',
        borderColor: post.status === 'PUBLISHED' ? '#10b981' : '#3b82f6',
        classNames: post.status === 'PUBLISHED' ? ['published-event'] : ['scheduled-event'],
        extendedProps: {
            imageUrl: post.imageUrls?.[0],
            status: post.status,
            caption: post.caption,
            scheduledAt: post.scheduledAt
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
            if (onRefresh) {
                onRefresh()
            }
        }
    }

    const handleDeletePost = async () => {
        if (!selectedPost) return
        if (!confirm("Are you sure you want to delete this scheduled post?")) return

        setIsDeleting(true)
        const result = await deletePost(selectedPost.id)
        setIsDeleting(false)

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        } else {
            toast({ title: "Success", description: "Post deleted successfully." })
            setIsEditModalOpen(false)
            setSelectedPost(null)
            if (onRefresh) onRefresh()
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleEventClick = (info) => {
        const status = info.event.extendedProps.status

        // Only allow editing SCHEDULED posts
        if (status === 'PUBLISHED') {
            toast({
                title: "Cannot Edit",
                description: "Published posts cannot be edited.",
                variant: "destructive"
            })
            return
        }

        // Open edit modal for scheduled posts
        const postDate = info.event.extendedProps.scheduledAt ? new Date(info.event.extendedProps.scheduledAt) : new Date()
        
        setDate(postDate)
        
        let hr = postDate.getHours()
        const ampm = hr >= 12 ? "PM" : "AM"
        hr = hr % 12 || 12
        
        setScheduleHour(hr.toString())
        setScheduleMinute(postDate.getMinutes().toString().padStart(2, "0"))
        setScheduleAmPm(ampm)

        setSelectedPost({
            id: info.event.id,
            caption: info.event.extendedProps.caption,
            scheduledAt: info.event.extendedProps.scheduledAt,
            imageUrl: info.event.extendedProps.imageUrl
        })
        setNewImageFile(null)
        setNewImagePreview(null)
        setIsEditModalOpen(true)
    }

    const handleUpdatePost = async (e) => {
        e.preventDefault()
        setIsUpdating(true)

        const formData = new FormData(e.target)
        const caption = formData.get('caption')

        if (!date) {
            toast({ title: "Error", description: "Please select a date", variant: "destructive" })
            setIsUpdating(false)
            return
        }

        let hourNum = parseInt(scheduleHour, 10);
        if (scheduleAmPm === "PM" && hourNum !== 12) hourNum += 12;
        if (scheduleAmPm === "AM" && hourNum === 12) hourNum = 0;
        const formattedHour = hourNum.toString().padStart(2, '0');
        
        const scheduleTimeStr = `${formattedHour}:${scheduleMinute}`
        const scheduleDateStr = format(date, "yyyy-MM-dd")
        const scheduledAt = `${scheduleDateStr}T${scheduleTimeStr}:00`

        let finalImageUrl = null

        if (newImageFile) {
            // Upload to Supabase first
            const ext = newImageFile.name.split('.').pop()
            const cleanFileName = `update-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('posts')
                .upload(cleanFileName, newImageFile)

            if (uploadError) {
                toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" })
                setIsUpdating(false)
                return
            }

            const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(cleanFileName)
            finalImageUrl = publicUrl
        }

        const result = await updateScheduledPost(selectedPost.id, caption, scheduledAt, finalImageUrl, timezone)

        setIsUpdating(false)

        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive"
            })
        } else {
            toast({
                title: "Success",
                description: "Scheduled post updated successfully."
            })
            setIsEditModalOpen(false)
            setSelectedPost(null)

            // Trigger data refresh
            if (onRefresh) {
                onRefresh()
            }
        }
    }

    // Format date for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
    }

    const formatTimeForInput = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toTimeString().slice(0, 5)
    }

    // Get minimum datetime (current time)
    const getMinDateTime = () => {
        const now = new Date()
        return now.toISOString().split('T')[0]
    }

    return (
        <>
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
                    />
                </div>
                <style jsx global>{`
        .fc {
            --fc-border-color: #1f2937;
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
        
        /* Modern calendar with rounded corners and spacing */
        .fc .fc-scrollgrid {
            border: none !important;
        }
        
        .fc .fc-scrollgrid-section > * {
            border: none !important;
        }
        
        .fc .fc-scrollgrid table {
            border-collapse: separate !important;
            border-spacing: 8px !important;
        }
        
        .fc-theme-standard td,
        .fc-theme-standard th {
            border: none !important;
        }
        
        .fc .fc-col-header-cell {
            border: none !important;
            padding: 12px 8px !important;
        }
        
        
        /* Modern calendar with rounded corners and spacing */
        .fc .fc-scrollgrid {
            border: none !important;
        }
        
        .fc .fc-scrollgrid-section > * {
            border: none !important;
        }
        
        .fc .fc-scrollgrid table {
            border-collapse: separate !important;
            border-spacing: 8px !important;
        }
        
        .fc-theme-standard td,
        .fc-theme-standard th {
            border: none !important;
        }
        
        .fc .fc-col-header-cell {
            border: none !important;
            padding: 12px 8px !important;
        }
        
        /* Calendar day cells with rounded corners and spacing */
        .fc .fc-daygrid-day {
            border: 1px solid #2d3748 !important;
            border-radius: 8px !important;
            transition: border-color 0.2s ease, background-color 0.2s ease;
            min-height: 100px !important;
        }
        
        /* Hover effect on calendar cells */
        .fc .fc-daygrid-day:hover {
            border-color: hsl(var(--primary)) !important;
            background-color: hsl(var(--primary) / 0.05) !important;
        }
        
        .fc .fc-daygrid-day-frame {
            border: none !important;
            padding: 8px !important;
        }
        
        /* Day numbers with more spacing */
        .fc .fc-daygrid-day-top {
            padding: 4px 8px !important;
        }
        
        .fc-col-header-cell-cushion, 
        .fc-daygrid-day-number {
            color: hsl(var(--foreground));
            text-decoration: none !important;
            padding: 4px !important;
        }
        
        .fc-daygrid-day-number:hover {
            color: hsl(var(--primary));
        }

        /* Published events - disabled appearance */
        .fc-event.published-event {
            opacity: 0.6;
            cursor: not-allowed !important;
        }

        .fc-event.published-event .fc-event-title {
            text-decoration: line-through;
        }

        /* Scheduled events - clickable */
        .fc-event.scheduled-event {
            cursor: pointer;
        }
      `}</style>
            </Card>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Scheduled Post</DialogTitle>
                        <DialogDescription>
                            Update the caption and scheduled time for this post.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePost}>
                        <div className="space-y-4 py-4">
                            {/* Image Preview & Upload */}
                            <div className="flex flex-col items-center justify-center space-y-4 mb-4">
                                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center">
                                    {(newImagePreview || selectedPost?.imageUrl) ? (
                                        <Image 
                                            src={newImagePreview || selectedPost?.imageUrl} 
                                            alt="Post image" 
                                            fill 
                                            className="object-contain"
                                        />
                                    ) : (
                                        <span className="text-muted-foreground text-sm">No image</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <Label htmlFor="imageUpload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
                                        Change Image / Video
                                    </Label>
                                    <Input 
                                        id="imageUpload" 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        className="hidden" 
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caption">Caption</Label>
                                <Textarea
                                    id="caption"
                                    name="caption"
                                    defaultValue={selectedPost?.caption}
                                    placeholder="Enter your caption..."
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Date</Label>
                                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-xs h-9", !date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-3 w-3" />
                                                {date ? format(date, "PPP") : "Pick date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={date}
                                                onSelect={(d) => {
                                                    setDate(d)
                                                    if (d) setIsDatePickerOpen(false)
                                                }}
                                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Time</Label>
                                    <div className="flex items-center gap-1">
                                        <Select value={scheduleHour} onValueChange={setScheduleHour}>
                                            <SelectTrigger className="h-9 text-xs w-[60px] bg-background border-border px-2">
                                                <SelectValue placeholder="Hr" />
                                            </SelectTrigger>
                                            <SelectContent className="min-w-[60px] max-h-[200px]">
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <span>:</span>
                                        <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                                            <SelectTrigger className="h-9 text-xs w-[60px] bg-background border-border px-2">
                                                <SelectValue placeholder="Min" />
                                            </SelectTrigger>
                                            <SelectContent className="min-w-[60px] max-h-[200px]">
                                                {Array.from({ length: 60 }).map((_, i) => {
                                                    const min = i.toString().padStart(2, '0')
                                                    return <SelectItem key={min} value={min}>{min}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <Select value={scheduleAmPm} onValueChange={setScheduleAmPm}>
                                            <SelectTrigger className="h-9 text-xs w-[65px] bg-background border-border px-2">
                                                <SelectValue placeholder="AM/PM" />
                                            </SelectTrigger>
                                            <SelectContent className="min-w-[65px]">
                                                <SelectItem value="AM">AM</SelectItem>
                                                <SelectItem value="PM">PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-2">
                                <Label className="text-xs">Timezone</Label>
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="h-9 text-xs w-full bg-background border-border">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                                        <SelectItem value="America/Halifax">Atlantic Time (Canada)</SelectItem>
                                        <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                        <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                                        <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                                        <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                                        <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between items-center w-full">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeletePost}
                                disabled={isUpdating || isDeleting}
                                className="mr-auto"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isUpdating || isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdating || isDeleting}>
                                    {isUpdating ? "Updating..." : "Update Post"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

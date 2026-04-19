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

export function CalendarView({ posts = [], onRefresh }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [newImageFile, setNewImageFile] = useState(null)
    const [newImagePreview, setNewImagePreview] = useState(null)

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
        const scheduleDate = formData.get('scheduleDate')
        const scheduleTime = formData.get('scheduleTime')

        // Combine date and time
        const scheduledAt = `${scheduleDate}T${scheduleTime}:00`

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

        const result = await updateScheduledPost(selectedPost.id, caption, scheduledAt, finalImageUrl)

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
                                    <Label htmlFor="scheduleDate">Date</Label>
                                    <Input
                                        id="scheduleDate"
                                        name="scheduleDate"
                                        type="date"
                                        defaultValue={formatDateForInput(selectedPost?.scheduledAt)}
                                        min={getMinDateTime()}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scheduleTime">Time</Label>
                                    <Input
                                        id="scheduleTime"
                                        name="scheduleTime"
                                        type="time"
                                        defaultValue={formatTimeForInput(selectedPost?.scheduledAt)}
                                        required
                                    />
                                </div>
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

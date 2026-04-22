"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Sparkles, Hash, Calendar, Clock, ImageIcon, X, Layers, Plus, Check, Clapperboard, Smile, MapPin, ChevronUp, ChevronDown, Settings, Calendar as CalendarIcon, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { supabase } from "@/lib/supabase"
import { createPost, getMediaLibrary } from "@/app/actions/post"
import { getInstagramStatus, searchInstagramLocations } from "@/app/actions/instagram"
import { generateCaption } from "@/app/actions/ai"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const suggestedHashtags = [
  "#instagram",
  "#instagood",
  "#photooftheday",
  "#fashion",
  "#beautiful",
  "#happy",
  "#cute",
  "#like4like",
  "#followme",
  "#picoftheday",
  "#art",
  "#style",
  "#instadaily",
  "#repost",
  "#summer",
]

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const value = `${hour.toString().padStart(2, "0")}:${minute}`
  const period = hour >= 12 ? "PM" : "AM"
  const visualHour = hour % 12 === 0 ? 12 : hour % 12
  const label = `${visualHour}:${minute} ${period}`
  return { value, label }
})

export default function CreatePostPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [caption, setCaption] = useState("")
  const [topic, setTopic] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [locationResults, setLocationResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null) // { id, name }
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [userTags, setUserTags] = useState([]) // [{ username, x: 0.5, y: 0.5 }]
  const [tagInput, setTagInput] = useState("")
  const [tone, setTone] = useState("professional")
  const [selectedHashtags, setSelectedHashtags] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [date, setDate] = useState(null)
  const [scheduleHour, setScheduleHour] = useState("12")
  const [scheduleMinute, setScheduleMinute] = useState("00")
  const [scheduleAmPm, setScheduleAmPm] = useState("PM")
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const formattedHour = () => {
    let hourNum = parseInt(scheduleHour, 10);
    if (scheduleAmPm === "PM" && hourNum !== 12) hourNum += 12;
    if (scheduleAmPm === "AM" && hourNum === 12) hourNum = 0;
    return hourNum.toString().padStart(2, '0');
  }
  const scheduleTime = `${formattedHour()}:${scheduleMinute}`;

  // Specific Loading States
  const [isScheduling, setIsScheduling] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Derived state for general disabling
  const isAnySubmitting = isScheduling || isSavingDraft || isGeneratingAI
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [instagramProfile, setInstagramProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // New State for Reels
  const [mediaType, setMediaType] = useState("IMAGE") // IMAGE, REEL, STORY, CAROUSEL
  const [carouselItems, setCarouselItems] = useState([]) // { id, url, file }
  const [coverImage, setCoverImage] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(null)

  // Video Cover Selection State
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentFrameTime, setCurrentFrameTime] = useState(0)
  const hiddenVideoRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { toBlobURL } = await import('@ffmpeg/util')

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg()
    }

    const ffmpeg = ffmpegRef.current
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    setFfmpegLoaded(true)

    // Load Instagram Profile
    try {
      const status = await getInstagramStatus()
      if (status.isConnected) {
        setInstagramProfile({
          username: status.username,
          picture: status.picture
        })
      }
    } catch (error) {
      console.error("Failed to load Instagram profile", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationQuery.length > 2) {
        setIsSearchingLocation(true)
        const res = await searchInstagramLocations(locationQuery)
        if (res.data) setLocationResults(res.data)
        setIsSearchingLocation(false)
      } else {
        setLocationResults([])
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [locationQuery])

  useEffect(() => {
    if (isMediaLibraryOpen) {
      async function loadMedia() {
        const result = await getMediaLibrary(mediaType) // Pass mediaType to filter
        if (result.images) {
          setMediaLibrary(result.images)
        }
      }
      loadMedia()
    }
  }, [isMediaLibraryOpen, mediaType]) // Add mediaType dependency

  // Utility to compress image using Canvas
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1920
        const scaleSize = MAX_WIDTH / img.width
        const width = scaleSize < 1 ? MAX_WIDTH : img.width
        const height = scaleSize < 1 ? img.height * scaleSize : img.height

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile)
          } else {
            reject(new Error('Canvas is empty'))
          }
        }, 'image/jpeg', 0.7) // 0.7 quality
      }
      img.onerror = (error) => reject(error)
    })
  }

  const compressVideo = async (file) => {
    setIsCompressing(true)

    try {
      if (!ffmpegLoaded) {
        await load()
      }
      const ffmpeg = ffmpegRef.current
      const { fetchFile } = await import('@ffmpeg/util')

      const inputName = 'input.mp4'
      const outputName = 'output.mp4'

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      // Compress video: scale to 720p height, crf 30 (faster), preset ultrafast
      await ffmpeg.exec(['-i', inputName, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-crf', '30', '-preset', 'ultrafast', outputName])

      const data = await ffmpeg.readFile(outputName)
      const compressedBlob = new Blob([data], { type: 'video/mp4' })
      const compressedFile = new File([compressedBlob], file.name, { type: 'video/mp4' })

      setIsCompressing(false)
      return compressedFile
    } catch (error) {
      console.error("Video compression error:", error)
      setIsCompressing(false)
      throw error
    }
  }

  const handleImageUpload = async (e) => {
    // Handle validation for Carousel limit
    if (mediaType === 'CAROUSEL') {
      const files = Array.from(e.target.files || [])
      if (carouselItems.length + files.length > 20) {
        toast({ title: "Limit Reached", description: "Max 20 images allowed.", variant: "destructive" })
        return
      }

      setIsMediaLibraryOpen(false)
      const newItems = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue

        // Simple compression or direct use
        let fileToUse = file
        try {
          fileToUse = await compressImage(file)
        } catch (err) { console.error(err) }

        const url = URL.createObjectURL(fileToUse)
        newItems.push({ id: Math.random().toString(36), url, file: fileToUse })
      }

      if (newItems.length > 0) {
        setCarouselItems(prev => [...prev, ...newItems])
        setUploadedImage(newItems[0].url) // Set first as preview
      }
      return
    }

    const file = e.target.files?.[0]
    if (file) {
      setIsMediaLibraryOpen(false)

      if (mediaType === 'IMAGE' && file.type.startsWith('image/')) {
        try {
          // Optimistic UI update
          const reader = new FileReader()
          reader.onloadend = () => {
            setUploadedImage(reader.result)
          }
          reader.readAsDataURL(file)

          // Compress in background
          const compressed = await compressImage(file)
          setFileToUpload(compressed)
          toast({ title: "Image optimized", description: "Image compressed for faster upload." })
        } catch (error) {
          console.error("Compression failed", error)
          setFileToUpload(file) // Fallback to original
        }
      } else if (mediaType === 'STORY') {
        // STORIES can be Image or Video
        if (file.type.startsWith('image/')) {
          // Treat as Image
          const reader = new FileReader()
          reader.onloadend = () => {
            setUploadedImage(reader.result)
          }
          reader.readAsDataURL(file)
          setFileToUpload(file) // No compression for now or reuse compressImage
        } else if (file.type.startsWith('video/')) {
          // Treat as Video (limit 60s)
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.onloadedmetadata = async function () {
            window.URL.revokeObjectURL(video.src)
            if (video.duration > 60) {
              toast({
                title: "Story too long",
                description: "Stories must be 60 seconds or less.",
                variant: "destructive"
              })
              setFileToUpload(null)
              setUploadedImage(null)
              return
            }
            const url = URL.createObjectURL(file)
            setUploadedImage(url)
            setFileToUpload(file) // No compression for now
          }
          video.src = URL.createObjectURL(file)
        } else {
          toast({ title: "Invalid File Type", description: "Stories can be images or videos.", variant: "destructive" })
        }

      } else if (mediaType === 'REEL' && file.type.startsWith('video/')) {
        // Check Video Duration
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = async function () {
          window.URL.revokeObjectURL(video.src)
          if (video.duration > 180) { // 3 minutes limit
            toast({
              title: "Video too long",
              description: "Reels generally must be 90 seconds or less (we allow up to 3 mins). Please trim your video.",
              variant: "destructive"
            })
            setFileToUpload(null)
            setUploadedImage(null)
            return
          }

          try {
            // Show preview immediately with blob url (no reader needed for video usually, but for upload preview)
            const url = URL.createObjectURL(file)
            setUploadedImage(url)

            // Compress Video only if > 20MB
            if (file.size > 20 * 1024 * 1024) {
              toast({ title: "Compressing Video", description: "Large video detected. Optimizing..." })
              const compressed = await compressVideo(file)
              setFileToUpload(compressed)
              toast({ title: "Video Optimized", description: "Ready for upload!" })
            } else {
              setFileToUpload(file)
              toast({ title: "Video Ready", description: "Small video, skipping compression." })
            }

          } catch (error) {
            console.error("Video compression failed", error)
            setFileToUpload(file) // Fallback
            toast({ title: "Compression Failed", description: "Using original video file.", variant: "destructive" })
          }
        }
        video.src = URL.createObjectURL(file)

      } else {
        toast({ title: "Invalid File Type", description: `Please upload a valid file for ${mediaType}.`, variant: "destructive" })
      }
    }
  }


  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImage(reader.result)
      }
      reader.readAsDataURL(file)

      // Compress cover
      try {
        const compressed = await compressImage(file)
        setCoverFile(compressed)
      } catch (error) {
        console.error("Cover compression failed", error)
        setCoverFile(file)
      }
    } else if (file) {
      toast({ title: "Invalid File", description: "Please upload an image for the cover.", variant: "destructive" })
    }
  }

  // Handle Video Metadata for Cover Selection
  const onVideoMetadataLoaded = (e) => {
    setVideoDuration(e.target.duration)
    setCurrentFrameTime(0)
  }

  // Handle Video Time Update / Slider Change
  const handleVideoTimeChange = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentFrameTime(time)
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.currentTime = time
    }
  }

  // Capture Frame when seek completes
  const handleSeeked = () => {
    const video = hiddenVideoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cover-frame.jpg", { type: "image/jpeg" })
        setCoverFile(file)
        setCoverImage(URL.createObjectURL(blob))
      }
    }, 'image/jpeg', 0.8)
  }

  const handleGenerateCaption = async () => {
    if (!topic) {
      toast({ title: "Topic Required", description: "Please enter a topic or title for the AI.", variant: "destructive" })
      return
    }

    setIsGeneratingAI(true)
    const result = await generateCaption(topic, tone)
    setIsGeneratingAI(false)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      setCaption(result.caption)
      toast({ title: "Magic!", description: "AI generated your caption successfully." })
    }
  }

  const toggleHashtag = (hashtag) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag))
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag])
    }
  }

  const handleSaveDraft = async () => {
    if (isAnySubmitting) return
    if (!checkConnection()) return
    if (isCompressing) {
      toast({ title: "Wait!", description: "Video is still compressing.", variant: "destructive" })
      return
    }

    const hasMedia = mediaType === 'CAROUSEL' ? carouselItems.length > 0 : !!uploadedImage;

    if (!hasMedia) {
      toast({ title: "Error", description: "Please upload or select media first", variant: "destructive" })
      return
    }

    setIsSavingDraft(true)
    try {
      await submitPost(false)
      toast({
        title: "Draft Saved",
        description: "Your post has been saved as a draft.",
      })
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const submitPost = async (isScheduled) => {
    let finalImageUrl = uploadedImage
    let finalImageUrls = []

    if (mediaType === 'CAROUSEL') {
      for (const item of carouselItems) {
        let itemUrl = item.url
        if (item.file) {
          const ext = item.file.name.split('.').pop()
          const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(cleanFileName, item.file)

          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(cleanFileName)
          itemUrl = publicUrl
        }
        finalImageUrls.push(itemUrl)
      }
      finalImageUrl = finalImageUrls[0]
    } else {
      // 1. Upload Main Media to Supabase ONLY if it's a new local file
      if (fileToUpload) {
        const ext = fileToUpload.name.split('.').pop()
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(cleanFileName, fileToUpload)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(cleanFileName)

        finalImageUrl = publicUrl
      }
    }

    // 2. Upload Cover Image (if exists)
    let finalCoverUrl = null
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const cleanFileName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(cleanFileName, coverFile)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(cleanFileName)
        finalCoverUrl = publicUrl
      }
    }

    // 3. Create Post in DB
    const formData = new FormData()
    formData.append('caption', caption + " " + selectedHashtags.join(" "))

    if (mediaType === 'CAROUSEL') {
      finalImageUrls.forEach(url => formData.append('imageUrl', url))
    } else {
      formData.append('imageUrl', finalImageUrl)
    }

    if (finalCoverUrl) {
      formData.append('coverUrl', finalCoverUrl)
    }

    if (isScheduled && date && scheduleTime) {
      const scheduleDateStr = format(date, "yyyy-MM-dd")
      formData.append('scheduleDate', scheduleDateStr)
      formData.append('scheduleTime', scheduleTime)
      formData.append('timezone', timezone)
    }

    formData.append('mediaType', mediaType)

    if (selectedLocation) {
      formData.append('locationId', selectedLocation.id)
      formData.append('locationName', selectedLocation.name)
    }
    
    if (userTags.length > 0 && (mediaType === 'IMAGE' || mediaType === 'CAROUSEL')) {
      formData.append('userTags', JSON.stringify(userTags))
    }

    const result = await createPost(formData)

    if (result.error) {
      throw new Error(result.error)
    } else {
      // Reset form
      setCaption("")
      setTopic("")
      setUploadedImage(null)
      setFileToUpload(null)
      setCoverImage(null)
      setCoverFile(null)
      setDate(null)
      setScheduleHour("12")
      setScheduleMinute("00")
      setScheduleAmPm("PM")
      setSelectedHashtags([])
      setCarouselItems([])
      setSelectedLocation(null)
      setLocationQuery("")
      setUserTags([])
      setTagInput("")
    }
  }

  const checkConnection = () => {
    if (!instagramProfile) {
      toast({
        title: "Instagram Not Connected",
        description: "Please connect your Instagram account first.",
        variant: "destructive",
        action: <ToastAction altText="Connect" onClick={() => router.push('/connect-instagram')}>Connect</ToastAction>
      })
      return false
    }
    return true
  }

  const handleSchedulePost = async () => {
    if (isAnySubmitting) return
    if (!checkConnection()) return
    if (isCompressing) {
      toast({ title: "Wait!", description: "Video is still compressing.", variant: "destructive" })
      return
    }

    const hasMedia = mediaType === 'CAROUSEL' ? carouselItems.length > 0 : !!uploadedImage;

    if (!hasMedia) {
      toast({ title: "Error", description: "Please upload or select media first", variant: "destructive" })
      return
    }
    if (!date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" })
      return
    }
    if (!scheduleTime) {
      toast({ title: "Error", description: "Please select a time", variant: "destructive" })
      return
    }

    const scheduleDateStr = format(date, "yyyy-MM-dd")
    const combinedDateTime = new Date(`${scheduleDateStr}T${scheduleTime}:00`)

    if (combinedDateTime <= new Date()) {
      toast({
        title: "Error",
        description: "Scheduled time must be in the future",
        variant: "destructive"
      })
      return
    }

    setIsScheduling(true)
    try {
      await submitPost(true)
      toast({
        title: "Success! Post Created",
        description: "Your post has been scheduled successfully.",
        variant: "default"
      })
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: error.message || "Failed to create post.", variant: "destructive" })
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <Card className="flex flex-col lg:flex-row w-full max-w-5xl h-[85vh] overflow-hidden bg-background border-border shadow-2xl rounded-xl">

          {/* LEFT COLUMN: Media Preview / Upload */}
          <div className="lg:w-[60%] flex flex-col bg-black/5 relative justify-center items-center border-r border-border overflow-hidden">

            {/* Empty State / Upload Trigger */}
            {(!uploadedImage && carouselItems.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="relative bg-background p-6 rounded-full shadow-lg border border-border">
                    {mediaType === 'REEL' ? <Clapperboard className="w-10 h-10 text-primary" /> :
                      mediaType === 'STORY' ? <Clock className="w-10 h-10 text-primary" /> :
                        mediaType === 'CAROUSEL' ? <Layers className="w-10 h-10 text-primary" /> :
                          <ImageIcon className="w-10 h-10 text-primary" />}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create new post</h3>
                <p className="text-muted-foreground mb-6 max-w-xs">{mediaType === 'CAROUSEL' ? 'Select multiple images for your carousel' : 'Drag photos and videos here or click to select from your library'}</p>

                <Button
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-6 text-base font-semibold"
                >
                  Select from computer
                </Button>
                <p className="text-xs text-muted-foreground mt-8 opacity-50">
                  {mediaType === 'REEL' && "Reels: 9:16, Max 3 min"}
                  {mediaType === 'STORY' && "Stories: 9:16, Max 60s"}
                  {mediaType === 'CAROUSEL' && "Carousel: up to 20 images"}
                  {mediaType === 'IMAGE' && "Posts: 1:1 or 4:5"}
                </p>
              </div>
            ) : (
              /* Media Preview State */
              <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                {/* Media Display */}
                {mediaType === 'CAROUSEL' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={uploadedImage}
                      alt="Current slide"
                      className="max-h-full max-w-full object-contain"
                    />
                    {/* Carousel Controls Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90%] p-2 bg-black/50 backdrop-blur-sm rounded-xl">
                      {carouselItems.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setUploadedImage(item.url)}
                          className={cn(
                            "w-10 h-10 relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all",
                            uploadedImage === item.url ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                          )}
                        >
                          <Image src={item.url} fill className="object-cover" alt="thumb" />
                        </div>
                      ))}
                      {carouselItems.length < 20 && (
                        <label className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-md cursor-pointer hover:bg-white/10 text-white">
                          <Plus className="w-5 h-5" />
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Layers className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-medium">{carouselItems.length}/20</span>
                    </div>
                  </div>
                ) : (
                  mediaType === 'REEL' || (mediaType === 'STORY' && uploadedImage?.toString().startsWith('blob:') && fileToUpload?.type?.startsWith('video/')) ? (
                    <video
                      key={uploadedImage}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      preload="metadata"
                    >
                      <source src={uploadedImage} />
                    </video>
                  ) : (typeof uploadedImage === 'string' && uploadedImage.startsWith('http') && mediaType === 'REEL') ? (
                    <video
                      key={uploadedImage}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      preload="metadata"
                    >
                      <source src={uploadedImage} />
                    </video>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={uploadedImage}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )
                )}

                {/* Quick remove/reset action */}
                <div className="absolute top-4 left-4 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                    onClick={() => {
                      setUploadedImage(null)
                      setCarouselItems([])
                      setFileToUpload(null)
                      setCoverImage(null)
                      setCoverFile(null)
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {isCompressing && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
                    <p className="text-white font-medium">Optimizing media...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Details & Settings */}
          <div className="lg:w-[40%] flex flex-col bg-background h-full">

            {/* Header / Top Bar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative rounded-full bg-muted overflow-hidden border border-border">
                  <Image src={instagramProfile?.picture || "/placeholder.svg"} fill className="object-cover" alt="Profile" />
                </div>
                <span className="font-semibold text-sm">{instagramProfile?.username || "Not Connected"}</span>
                {!instagramProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => router.push('/connect-instagram')}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">

              {/* 1. Post Type Selector */}
              <div className="bg-muted/50 p-1 rounded-lg grid grid-cols-4 gap-1">
                {['IMAGE', 'REEL', 'STORY', 'CAROUSEL'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setMediaType(type)
                      // Only reset if switching between drastically different types if needed, 
                      // but for now we keep it simple or maybe verify compatibility? 
                      // Let's simplify: reset strictly if moving to carousel or standard.
                      if (type === 'CAROUSEL' && mediaType !== 'CAROUSEL') setCarouselItems([])
                      if (mediaType === 'CAROUSEL' && type !== 'CAROUSEL') setCarouselItems([])
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-md text-[10px] font-medium transition-all gap-1",
                      mediaType === type ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    {type === 'IMAGE' && <ImageIcon className="w-4 h-4" />}
                    {type === 'REEL' && <Clapperboard className="w-4 h-4" />}
                    {type === 'STORY' && <Clock className="w-4 h-4" />}
                    {type === 'CAROUSEL' && <Layers className="w-4 h-4" />}
                    {type === 'IMAGE' ? 'Post' : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* 2. Caption Area */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <Label className="text-xs font-medium opacity-70 mb-1.5 block">Write topic to generate caption</Label>
                      <Input
                        placeholder="e.g. Summer sale announcement..."
                        className="h-8 text-xs bg-muted/30"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
                      onClick={handleGenerateCaption}
                      disabled={isGeneratingAI}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGeneratingAI ? "Writing..." : "Generate"}
                    </Button>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    className="min-h-[140px] resize-none border-0 focus-visible:ring-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/40 leading-relaxed"
                  />
                  <div className="absolute bottom-0 right-0 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{caption.length}/2200</span>
                  </div>
                </div>

              </div>

              {/* Tagging and Location */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1 relative">
                  <Label className="text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Add Location</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Search location..." 
                      className="h-9 text-sm" 
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value)
                        if (!e.target.value) setSelectedLocation(null)
                      }}
                    />
                    {isSearchingLocation && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>}
                    
                    {locationQuery.length > 2 && !selectedLocation && locationResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {locationResults.map(loc => (
                          <div 
                            key={loc.id} 
                            className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedLocation({ id: loc.id, name: loc.name })
                              setLocationQuery(loc.name)
                            }}
                          >
                            <div className="font-medium">{loc.name}</div>
                            {loc.location && <div className="text-xs text-muted-foreground">{loc.location.city}{loc.location.country ? `, ${loc.location.country}` : ''}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(mediaType === 'IMAGE' || mediaType === 'CAROUSEL') && (
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1.5"><Smile className="w-3 h-3"/> Tag People</Label>
                    <div className="flex flex-col gap-2">
                        <Input 
                          placeholder="Type username and press Enter" 
                          className="h-9 text-sm"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                              e.preventDefault()
                              let cleanTag = tagInput.trim().replace(/^@/, '')
                              if (!userTags.find(t => t.username === cleanTag)) {
                                setUserTags([...userTags, { username: cleanTag, x: 0.5, y: 0.5 }])
                              }
                              setTagInput("")
                            }
                          }}
                        />
                        {userTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userTags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                                @{tag.username}
                                <X className="w-3 h-3 cursor-pointer ml-1 text-primary/70 hover:text-destructive transition-colors" onClick={() => setUserTags(userTags.filter(t => t.username !== tag.username))} />
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-border my-2" />

              {/* 3. Settings Accordions */}
              <div className="space-y-0 divide-y divide-border">
                {/* Schedule Accordion */}
                <div className="py-2">
                  <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Schedule for later</span>
                    </div>
                    {isCalendarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isCalendarOpen && (
                    <div className="pt-4 pb-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                      <div className="space-y-1">
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
                      {date && scheduleTime && (
                        <p className="text-xs text-muted-foreground bg-primary/10 p-2 rounded flex items-center gap-2">
                          <Clock className="w-3 h-3 text-primary" />
                          Will post on {format(date, "MMM d")} at {scheduleTime} ({timezone})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced Settings Checkbox / Accordion */}
                <div className="py-2">
                  <div className="flex items-center justify-between py-2 text-sm text-muted-foreground cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Advanced Settings</span>
                    </div>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Coming Soon</span>
                  </div>
                </div>
              </div>

              {/* Reel Cover specific */}
              {mediaType === 'REEL' && uploadedImage && (
                <div className="bg-muted/30 p-3 rounded-lg border border-border mt-4">
                  <Label className="text-xs font-semibold mb-2 block">Cover Photo</Label>

                  {/* Hidden Video for Frame Extraction */}
                  <video
                    ref={hiddenVideoRef}
                    src={uploadedImage} // Uses the same source as the preview
                    className="hidden"
                    onLoadedMetadata={onVideoMetadataLoaded}
                    onSeeked={handleSeeked}
                    muted
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-20 bg-black rounded overflow-hidden flex-shrink-0 border border-border">
                        {coverImage ? <Image src={coverImage} fill alt="cover" className="object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="w-4 h-4 text-white/50" /></div>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[10px] text-muted-foreground">Select from video</Label>
                          <input
                            type="range"
                            min="0"
                            max={videoDuration}
                            step="0.1"
                            value={currentFrameTime}
                            onChange={handleVideoTimeChange}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground/50">
                            <span>0:00</span>
                            <span>{videoDuration ? new Date(videoDuration * 1000).toISOString().substr(14, 5) : "0:00"}</span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Upload custom cover
                            <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border mt-auto bg-background/95 backdrop-blur z-10">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isAnySubmitting || (!uploadedImage && carouselItems.length === 0)}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => {
                  if (date && scheduleTime) {
                    handleSchedulePost()
                  } else {
                    if (checkConnection()) {
                      submitPost(false)
                    }
                  }
                }}
                disabled={isAnySubmitting || (!uploadedImage && carouselItems.length === 0)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
              >
                {isScheduling ? "Scheduling..." : (date && scheduleTime && scheduleTime !== "") ? "Schedule" : "Publish Now"}
              </Button>
            </div>

          </div >

        </Card >
      </div >

      {/* Media Library Modal (Keep as is) */}
      < Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen} >
        <DialogContent className="max-w-4xl bg-card max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Media Library ({mediaType === "REEL" ? "Videos" : "Images"})</DialogTitle>
            <DialogDescription>Select a previously uploaded {mediaType === "REEL" ? "video" : "image"} or upload a new one</DialogDescription>
            {mediaType === 'CAROUSEL' && (
              <div className="flex justify-between items-center mt-2 bg-muted p-2 rounded-lg">
                <span className="text-sm font-medium">{carouselItems.length} selected (Max 20)</span>
                <Button size="sm" onClick={() => setIsMediaLibraryOpen(false)}>Done</Button>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Upload New Card */}
              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/50">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-primary mb-2" />
                  <span className="text-xs font-semibold">Upload New</span>
                </div>
                <input type="file" className="hidden" multiple={mediaType === 'CAROUSEL'} accept={mediaType === 'REEL' ? "video/*" : "image/*"} onChange={handleImageUpload} />
              </label>

              {/* Library Images */}
              {mediaLibrary.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your library is empty</p>
                </div>
              ) : (
                mediaLibrary.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (mediaType === 'CAROUSEL') {
                        const isSelected = carouselItems.some(item => item.url === url)
                        if (isSelected) {
                          setCarouselItems(prev => prev.filter(item => item.url !== url))
                        } else {
                          if (carouselItems.length >= 20) {
                            toast({ title: "Limit Reached", description: "Max 20 images.", variant: "destructive" })
                            return
                          }
                          const newItem = { id: Math.random().toString(36), url, file: null };
                          setCarouselItems(prev => [...prev, newItem])
                          setUploadedImage(url);
                        }
                      } else {
                        setUploadedImage(url)
                        setFileToUpload(null)
                        setIsMediaLibraryOpen(false)
                      }
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group bg-muted ${mediaType === 'CAROUSEL' && carouselItems.some(item => item.url === url)
                      ? 'border-primary ring-2 ring-primary ring-offset-1'
                      : 'border-transparent hover:border-primary'
                      }`}
                  >
                    {(mediaType === 'REEL' || mediaType === 'STORY') && url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video 
                        className="w-full h-full object-cover" 
                        controls={false}
                        playsInline
                        preload="metadata"
                      >
                        <source src={url} />
                      </video>
                    ) : (
                      <Image
                        src={url}
                        alt={`Media ${idx}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                    )}

                    <div className={`absolute inset-0 bg-black/40 ${mediaType === 'CAROUSEL' && carouselItems.some(i => i.url === url) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-opacity`}>
                      {mediaType === 'CAROUSEL' && carouselItems.some(i => i.url === url) ? (
                        <Check className="w-8 h-8 text-white bg-primary rounded-full p-1.5" />
                      ) : (
                        <span className="text-white text-xs font-bold bg-primary/80 px-2 py-1 rounded">Select</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog >
    </DashboardLayout >
  )
}

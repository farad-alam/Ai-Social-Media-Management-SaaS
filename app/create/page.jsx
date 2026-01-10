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
import { Upload, Sparkles, Hash, Calendar, Clock, ImageIcon, X, Layers, Plus, Check, Clapperboard, Smile, MapPin, ChevronUp, ChevronDown, Settings, Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { createPost, getMediaLibrary } from "@/app/actions/post"
import { getInstagramStatus } from "@/app/actions/instagram"
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

export default function CreatePostPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [caption, setCaption] = useState("")
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("professional")
  const [selectedHashtags, setSelectedHashtags] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [date, setDate] = useState(null)
  const [scheduleTime, setScheduleTime] = useState("")

  // Specific Loading States
  const [isScheduling, setIsScheduling] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Derived state for general disabling
  const isAnySubmitting = isScheduling || isSavingDraft || isGeneratingAI
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [instagramProfile, setInstagramProfile] = useState(null)

  // New State for Reels
  const [mediaType, setMediaType] = useState("IMAGE") // IMAGE, REEL, STORY, CAROUSEL
  const [carouselItems, setCarouselItems] = useState([]) // { id, url, file }
  const [coverImage, setCoverImage] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(null)

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
    const status = await getInstagramStatus()
    if (status.isConnected) {
      setInstagramProfile({
        username: status.username,
        picture: status.picture
      })
    }
  }

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

      // Compress video: scale to 720p height, crf 28 (good tradeoff), preset faster
      await ffmpeg.exec(['-i', inputName, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-crf', '28', '-preset', 'faster', outputName])

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

            // Compress Video
            toast({ title: "Compressing Video", description: "Please wait while we optimize your reel..." })
            const compressed = await compressVideo(file)
            setFileToUpload(compressed)
            toast({ title: "Video Optimized", description: "Ready for upload!" })

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
    }

    formData.append('mediaType', mediaType)

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
      setScheduleTime("")
      setSelectedHashtags([])
      setCarouselItems([])
    }
  }

  const handleSchedulePost = async () => {
    if (isAnySubmitting) return
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
                      src={uploadedImage}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (typeof uploadedImage === 'string' && uploadedImage.startsWith('http') && mediaType === 'REEL') ? (
                    <video
                      src={uploadedImage}
                      className="w-full h-full object-contain"
                      controls
                    />
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
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
                  <img src={instagramProfile?.picture || "/placeholder.svg"} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <span className="font-semibold text-sm">{instagramProfile?.username || "your_username"}</span>
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
                <div className="flex gap-2 border-t border-border/50 pt-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Smile className="w-5 h-5" /></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-80"><p className="text-sm text-muted-foreground p-2">Emoji picker coming soon</p></PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Hash className="w-5 h-5" /></Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64 p-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs">Suggested</h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestedHashtags.map(tag => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => {
                              setCaption(prev => prev + " " + tag);
                              toggleHashtag(tag);
                            }}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <div className="border-l border-border mx-1 h-6 self-center" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground text-xs"><MapPin className="w-4 h-4 mr-1" /> Add Location</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Input placeholder="Search location..." />
                    </PopoverContent>
                  </Popover>
                </div>
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-xs h-9", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {date ? format(date, "PPP") : "Pick date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarPicker mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Time</Label>
                          <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="h-9 text-xs" />
                        </div>
                      </div>
                      {date && scheduleTime && (
                        <p className="text-xs text-muted-foreground bg-primary/10 p-2 rounded flex items-center gap-2">
                          <Clock className="w-3 h-3 text-primary" />
                          Will post on {format(date, "MMM d")} at {scheduleTime}
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
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                      {coverImage ? <Image src={coverImage} fill alt="cover" className="object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="w-4 h-4 text-white/50" /></div>}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-primary cursor-pointer hover:underline">
                        Upload custom cover
                        <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
                      </label>
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
                onClick={date && scheduleTime ? handleSchedulePost : () => submitPost(false)}
                disabled={isAnySubmitting || (!uploadedImage && carouselItems.length === 0)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
              >
                {isScheduling ? "Scheduling..." : (date && scheduleTime && scheduleTime !== "") ? "Schedule" : "Share"}
              </Button>
            </div>

          </div>

        </Card>
      </div>

      {/* Media Library Modal (Keep as is) */}
      <Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen}>
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
                <input type="file" className="hidden" accept={mediaType === 'REEL' ? "video/*" : "image/*"} onChange={handleImageUpload} />
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
                    {mediaType === 'REEL' ? (
                      <video src={url} className="w-full h-full object-cover" />
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
      </Dialog>
    </DashboardLayout>
  )
}

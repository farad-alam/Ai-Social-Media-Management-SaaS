"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Sparkles, Hash, Calendar, Clock, ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { createPost } from "@/app/actions/post"

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
  const [selectedHashtags, setSelectedHashtags] = useState([])
  const [uploadedImage, setUploadedImage] = useState(null)
  const [fileToUpload, setFileToUpload] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
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
      } else {
        // Video or other
        setFileToUpload(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setUploadedImage(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const generateAICaption = () => {
    const aiCaptions = [
      "Embracing the journey, one step at a time. What's your next adventure?",
      "Creating moments that matter. Share your story with us!",
      "Life is better when you're laughing. What made you smile today?",
      "Chasing dreams and making memories. Join us on this incredible journey!",
      "Finding beauty in the everyday. What inspires you?",
    ]
    const randomCaption = aiCaptions[Math.floor(Math.random() * aiCaptions.length)]
    setCaption(randomCaption)

    toast({
      title: "AI Caption Generated",
      description: "Your caption has been created successfully!",
    })
  }

  const toggleHashtag = (hashtag) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag))
    } else {
      setSelectedHashtags([...selectedHashtags, hashtag])
    }
  }

  const handleSchedulePost = async () => {
    if (isSubmitting) return

    if (!fileToUpload) {
      toast({ title: "Error", description: "Please upload an image first", variant: "destructive" })
      return
    }
    if (!caption) {
      toast({ title: "Error", description: "Please write a caption", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload to Supabase
      const filename = `${Date.now()}-${fileToUpload.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filename, fileToUpload)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filename)

      // 2. Create Post in DB
      const formData = new FormData()
      formData.append('caption', caption + " " + selectedHashtags.join(" "))
      formData.append('imageUrl', publicUrl)
      if (scheduleDate) formData.append('scheduleDate', scheduleDate)
      if (scheduleTime) formData.append('scheduleTime', scheduleTime)

      const result = await createPost(formData)

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        setIsSubmitting(false)
      } else {
        toast({
          title: "Success! Post Created",
          description: "Your post has been scheduled. Redirecting to dashboard...",
          variant: "default"
        })
        // Delay redirect to allow toast to be seen
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }

    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to create post. Check console.", variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Post</h1>
          <p className="text-muted-foreground">Upload media, write captions, and schedule your Instagram content</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload & Caption */}
          <div className="space-y-6">
            {/* Media Upload */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Upload Media</h2>

              {!uploadedImage ? (
                <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="mb-2 text-sm text-card-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or MP4 (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded content"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setUploadedImage(null)
                      setFileToUpload(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Caption */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">Caption</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAICaption}
                  className="border-border text-foreground bg-transparent"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
              </div>

              <Textarea
                placeholder="Write your caption here..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-32 bg-background border-input text-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">{caption.length} / 2200 characters</p>
            </Card>

            {/* Hashtags */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Hashtag Suggestions</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((hashtag) => (
                  <Badge
                    key={hashtag}
                    variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${selectedHashtags.includes(hashtag)
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-primary/50"
                      }`}
                    onClick={() => toggleHashtag(hashtag)}
                  >
                    {hashtag}
                  </Badge>
                ))}
              </div>

              {selectedHashtags.length > 0 && (
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-secondary-foreground">Selected: {selectedHashtags.join(" ")}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Schedule & Preview */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-card-foreground">Schedule Post</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-card-foreground">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-card-foreground">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Best Time to Post</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on your audience, we recommend posting between 10 AM - 2 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-chart-3" />
                <h2 className="text-lg font-semibold text-card-foreground">Instagram Preview</h2>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">your_username</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>

                {uploadedImage ? (
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <p className="text-sm text-foreground line-clamp-3">{caption || "Your caption will appear here..."}</p>
                {selectedHashtags.length > 0 && (
                  <p className="text-sm text-primary mt-2">{selectedHashtags.join(" ")}</p>
                )}
              </div>

              <Button
                className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowPreview(true)}
              >
                Full Preview
              </Button>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 border-border text-foreground bg-transparent">
                Save Draft
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSchedulePost}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Instagram Post Preview</DialogTitle>
            <DialogDescription>This is how your post will appear on Instagram</DialogDescription>
          </DialogHeader>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-full" />
              <div>
                <p className="font-semibold text-foreground">your_username</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>

            {uploadedImage && (
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Preview"
                className="w-full aspect-square object-cover rounded-lg mb-3"
              />
            )}

            <div className="space-y-2">
              <p className="text-sm text-foreground">{caption || "Your caption will appear here..."}</p>
              {selectedHashtags.length > 0 && <p className="text-sm text-primary">{selectedHashtags.join(" ")}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

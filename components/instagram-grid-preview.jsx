"use client"

import { useState } from "react"
import { Grid3X3, Clapperboard, MonitorPlay, Layers, Lock, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

export function InstagramGridPreview({ posts, profile, isConnected }) {
    const [activeTab, setActiveTab] = useState("GRID") // GRID, REELS, TAGGED

    // Mock profile if missing
    const displayProfile = profile || {
        username: "your_username",
        profile_picture_url: null
    }

    // Number of posts formatted
    // We assume we don't know the exact total count from just this array, but we can simulate or show "123" if missing
    // or use a placeholder if we didn't fetch it specifically. The user details usually has 'media_count'.
    // We'll leave it simple for now.

    return (
        <div className="flex justify-center p-4 min-h-screen bg-muted/20">
            {/* Mobile Frame Container */}
            <div className="w-full max-w-[430px] bg-background border border-border shadow-2xl rounded-[40px] overflow-hidden flex flex-col h-[932px] relative">

                {/* Status Bar Mock */}
                <div className="h-12 bg-background flex items-center justify-between px-6 select-none">
                    <span className="text-xs font-semibold">9:41</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-2.5 bg-foreground rounded-[2px]" /> {/* Signal */}
                        <div className="w-4 h-2.5 bg-foreground rounded-[2px]" /> {/* WiFi */}
                        <div className="w-6 h-3 border border-foreground rounded-[4px] relative">
                            <div className="absolute inset-0.5 bg-foreground rounded-[1px]" />
                        </div> {/* Battery */}
                    </div>
                </div>

                {/* Header */}
                {/* Header */}
                <div className="h-12 flex items-center justify-between px-4 border-b border-transparent">
                    <Lock className="w-4 h-4" />
                    <span className="font-bold text-sm">{displayProfile.username}</span>
                    <div className="w-4" /> {/* Spacer */}
                </div>

                {/* Profile Info Section - Simplified */}
                {/* Profile Info Section */}
                <div className="px-4 py-4">
                    <div className="flex items-center gap-4 mb-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden relative bg-muted">
                                    <Image
                                        src={displayProfile.profile_picture_url || "/placeholder.svg"}
                                        fill
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Name & Username */}
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-sm">{displayProfile.username}</span>
                            <span className="text-sm text-muted-foreground">{displayProfile.name || "Digital Creator"}</span>
                        </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-2">
                        {isConnected ? (
                            <>
                                <button className="flex-1 bg-muted text-foreground text-xs font-semibold py-1.5 rounded-lg hover:bg-muted/80 transition-colors">
                                    Edit Profile
                                </button>
                                <button className="flex-1 bg-muted text-foreground text-xs font-semibold py-1.5 rounded-lg hover:bg-muted/80 transition-colors">
                                    Share Profile
                                </button>
                            </>
                        ) : (
                            <Link href="/connect-instagram" className="w-full">
                                <button className="w-full bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                                    Connect Profile
                                </button>
                            </Link>
                        )}
                    </div>

                </div>

                {/* Tabs - Removed */}
                <div className="flex border-t border-border" >
                    <button
                        onClick={() => setActiveTab("GRID")}
                        className={cn("flex-1 h-12 flex items-center justify-center border-b-[2px] transition-colors", activeTab === "GRID" ? "border-foreground" : "border-transparent text-muted-foreground")}
                    >
                        <Grid3X3 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setActiveTab("REELS")}
                        className={cn("flex-1 h-12 flex items-center justify-center border-b-[2px] transition-colors", activeTab === "REELS" ? "border-foreground" : "border-transparent text-muted-foreground")}
                    >
                        <MonitorPlay className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {activeTab === "GRID" ? (
                        <div className="grid grid-cols-3 gap-px pb-20">
                            {posts.map((post) => (
                                <div key={post.id} className="relative aspect-square group cursor-pointer bg-muted">
                                    {/* Media Asset */}
                                    {post.type?.startsWith('VIDEO') || post.type === 'REEL' ? (
                                        <div className="w-full h-full relative">
                                            {post.thumbnail_url ? (
                                                <Image src={post.thumbnail_url} fill className="object-cover" alt="thumb" />
                                            ) : (
                                                <video
                                                    src={`${post.url}#t=0.001`}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    preload="auto"
                                                />
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <Clapperboard className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    ) : (
                                        <Image
                                            src={post.url || post.thumbnail_url || "/placeholder.svg"}
                                            fill
                                            className="object-cover"
                                            alt="post"
                                        />
                                    )}

                                    {/* Carousel Indicator */}
                                    {(post.type === 'CAROUSEL_ALBUM' || post.type === 'CAROUSEL') && (
                                        <div className="absolute top-2 right-2">
                                            <Layers className="w-4 h-4 text-white drop-shadow-md" />
                                        </div>
                                    )}

                                    {/* Scheduled Indicator Overlay */}
                                    {post.isScheduled && (
                                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center opacity-100 transition-opacity">
                                            {/* Instagram Icon Overlay */}
                                            <div className="bg-black/50 p-1.5 rounded-full backdrop-blur-md flex items-center gap-1">
                                                <InstagramLogo className="w-3 h-3 text-white" />
                                                <span className="text-[10px] text-white font-medium">{format(new Date(post.scheduleDate), "MMM d")}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Reels Grid */
                        <div className="grid grid-cols-3 gap-px pb-20">
                            {posts.filter(p => p.type === 'REEL' || p.type?.startsWith('VIDEO')).map((post) => (
                                <div key={post.id} className="relative aspect-[9/16] group cursor-pointer bg-muted">
                                    <div className="w-full h-full relative">
                                        {post.thumbnail_url ? (
                                            <Image src={post.thumbnail_url} fill className="object-cover" alt="thumb" />
                                        ) : (
                                            <video
                                                src={`${post.url}#t=0.001`}
                                                className="w-full h-full object-cover"
                                                muted
                                                playsInline
                                                preload="auto"
                                            />
                                        )}
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                            <MonitorPlay className="w-3 h-3 text-white" />
                                            <span className="text-[10px] text-white font-medium">Reel</span>
                                        </div>
                                    </div>
                                    {post.isScheduled && (
                                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                                            <div className="bg-black/50 p-1.5 rounded-full backdrop-blur-md flex items-center gap-1">
                                                <span className="text-[10px] text-white font-medium">{format(new Date(post.scheduleDate), "MMM d")}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {posts.filter(p => p.type === 'REEL' || p.type?.startsWith('VIDEO')).length === 0 && (
                                <div className="col-span-3 py-12 text-center text-muted-foreground text-xs">
                                    No reels found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Nav Mock - Standard IG Bottom Bar */}
                <div className="h-12 border-t border-border flex items-center justify-around px-4 bg-background absolute bottom-0 w-full">
                    <svg aria-label="Home" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    <svg aria-label="Search" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line></svg>
                    <div className="w-6 h-6 border-2 border-foreground rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold">+</span>
                    </div>
                    <MonitorPlay className="w-6 h-6" />
                    <div className="w-6 h-6 rounded-full bg-muted border border-foreground overflow-hidden">
                        <Image src={displayProfile.profile_picture_url || "/placeholder.svg"} width={24} height={24} alt="mini" />
                    </div>
                </div>

            </div>
        </div>
    )
}

function InstagramLogo({ className }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    )
}

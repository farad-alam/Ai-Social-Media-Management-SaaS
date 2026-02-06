"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface ProviderSettingsProps {
    provider: 'INSTAGRAM' | 'PINTEREST' | 'TIKTOK'
    icon: React.ReactNode
    label: string
    colorClass: string
    initialStatus: {
        isConnected: boolean
        username?: string | null
        picture?: string | null
    }
    onConnect: () => void
    onDisconnect: () => Promise<{ success: boolean }>
}

export function ProviderSettings({
    provider,
    icon,
    label,
    colorClass,
    initialStatus,
    onConnect,
    onDisconnect
}: ProviderSettingsProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState(initialStatus)

    const handleConnectClick = () => {
        setIsLoading(true)
        onConnect()
    }

    const handleDisconnectClick = async () => {
        setIsLoading(true)
        try {
            const result = await onDisconnect()
            if (result.success) {
                setStatus({ isConnected: false, username: null })
                toast({
                    title: "Disconnected",
                    description: `${label} account disconnected successfully`,
                })
                router.refresh()
            } else {
                throw new Error("Failed to disconnect")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to disconnect account",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>
                    {icon}
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">{label} Connection</h2>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-4">
                        {status.isConnected && status.picture ? (
                            <Avatar className={`w-12 h-12 rounded-lg border-2 ${colorClass.replace('bg-', 'border-')}`}>
                                <AvatarImage src={status.picture} alt={status.username || label} className="object-cover" />
                                <AvatarFallback className={`${colorClass} text-white rounded-lg`}>
                                    {icon}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                                <div className="text-white">
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-card-foreground">{label} Account</p>
                            <div className="flex items-center gap-2 mt-1">
                                {status.isConnected ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-muted-foreground">@{status.username || 'connected_user'}</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 text-destructive" />
                                        <span className="text-sm text-muted-foreground">Not connected</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant={status.isConnected ? "default" : "secondary"}
                        className={status.isConnected ? "bg-green-500 text-white" : "bg-secondary text-secondary-foreground"}
                    >
                        {status.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={status.isConnected ? handleDisconnectClick : handleConnectClick}
                        variant={status.isConnected ? "outline" : "default"}
                        disabled={isLoading}
                        className={
                            status.isConnected
                                ? "border-border text-foreground bg-transparent"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {status.isConnected ? `Disconnect ${label}` : `Connect ${label}`}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProviderSettings } from "@/components/provider-settings"
import { Instagram, Camera } from "lucide-react"
import { disconnectInstagram } from "@/app/actions/instagram"

// Mock actions for new providers for now (will implement real ones next)
async function disconnectPinterest() {
    "use server"
    return { success: true }
}
async function disconnectTikTok() {
    "use server"
    return { success: true }
}

async function getConnections() {
    const { userId } = await auth()
    if (!userId) return null

    const accounts = await prisma.account.findMany({
        where: { userId }
    })

    return {
        instagram: accounts.find(a => a.provider === 'INSTAGRAM'),
        pinterest: accounts.find(a => a.provider === 'PINTEREST'),
        tiktok: accounts.find(a => a.provider === 'TIKTOK'),
    }
}

export default async function ConnectPage() {
    // Check auth
    const { userId } = await auth()
    if (!userId) redirect("/sign-in")

    const connections = await getConnections()

    // Helper to format status for component
    const getStatus = (account: any) => ({
        isConnected: !!account,
        username: account?.username,
        picture: account?.picture
    })

    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Connect Accounts</h1>
                    <p className="text-muted-foreground">Manage your social media connections.</p>
                </div>

                <div className="grid gap-6">
                    {/* INSTAGRAM */}
                    <ProviderSettings
                        provider="INSTAGRAM"
                        label="Instagram"
                        icon={<Instagram className="w-6 h-6" />}
                        colorClass="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]"
                        initialStatus={getStatus(connections?.instagram)}
                        onConnect={async () => {
                            "use server"
                            redirect("/api/auth/instagram")
                        }}
                        onDisconnect={disconnectInstagram}
                    />

                    {/* PINTEREST */}
                    <ProviderSettings
                        provider="PINTEREST"
                        label="Pinterest"
                        icon={
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                            </svg>
                        }
                        colorClass="bg-[#E60023]"
                        initialStatus={getStatus(connections?.pinterest)}
                        onConnect={async () => {
                            "use server"
                            // Can't redirect from client component event handler directly if using server action for navigation in this pattern easily without router.push
                            // But for now let's just use window.location in the component for the full redirect or redirect from server action
                            redirect("/api/auth/pinterest")
                        }}
                        onDisconnect={disconnectPinterest}
                    />

                    {/* TIKTOK */}
                    <ProviderSettings
                        provider="TIKTOK"
                        label="TikTok"
                        icon={
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12v8.76c0 5.29-4.3 9.18-9.47 8.84-4.66-.31-8.32-4.14-8.58-8.79-.24-4.52 3.25-8.49 7.76-8.85 1.44-.12 2.91.17 4.22.84v4.29c-.76-.41-1.63-.61-2.5-.53-2.38.22-4.13 2.44-3.8 4.79.31 2.29 2.47 4.01 4.78 3.84 2.19-.16 3.93-1.89 4.09-4.08V.02h-.58z" />
                            </svg>
                        }
                        colorClass="bg-[#000000]"
                        initialStatus={getStatus(connections?.tiktok)}
                        onConnect={async () => {
                            "use server"
                            redirect("/api/auth/tiktok")
                        }}
                        onDisconnect={disconnectTikTok}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}

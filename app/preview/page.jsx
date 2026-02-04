import { getPreviewData } from "@/app/actions/preview"
import { InstagramGridPreview } from "@/components/instagram-grid-preview"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PreviewPage() {
    const data = await getPreviewData()

    if (data.error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <p className="text-red-500 font-medium">{data.error}</p>
                    <Link href="/connect-instagram">
                        <Button>Connect Instagram Account</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-start min-h-screen py-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Feed Preview</h1>
                    <p className="text-muted-foreground">
                        Visualize how your scheduled posts will look on your Instagram grid.
                    </p>
                </div>

                <InstagramGridPreview posts={data.posts} profile={data.profile} isConnected={data.isConnected} />
            </div>
        </DashboardLayout>
    )
}

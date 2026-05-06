"use client"

import { AppDataProvider } from "@/contexts/app-data-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import AllPostsContent from "@/components/all-posts-content"

export default function AllPostsPage() {
    return (
        <DashboardLayout>
            <AppDataProvider>
                <AllPostsContent />
            </AppDataProvider>
        </DashboardLayout>
    )
}

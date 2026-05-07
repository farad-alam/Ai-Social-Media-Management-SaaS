"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AppDataProvider } from "@/contexts/app-data-context"

export default function DashboardGroupLayout({ children }) {
  return (
    <DashboardLayout>
      <AppDataProvider>
        {children}
      </AppDataProvider>
    </DashboardLayout>
  )
}

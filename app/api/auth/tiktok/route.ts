import { TikTokClient } from "@/lib/tiktok";
import { redirect } from "next/navigation";

export async function GET() {
    redirect(TikTokClient.getLoginUrl());
}

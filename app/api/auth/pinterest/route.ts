import { PinterestClient } from "@/lib/pinterest";
import { redirect } from "next/navigation";

export async function GET() {
    redirect(PinterestClient.getLoginUrl());
}

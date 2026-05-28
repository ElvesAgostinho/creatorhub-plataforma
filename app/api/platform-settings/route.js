import { createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/platform-settings
 * Returns global platform settings (upload toggles, etc.)
 * Public — anyone can read settings (auth handled by RLS SELECT policy)
 */
export async function GET() {
  try {
    const svc = createServiceClient()
    const { data, error } = await svc
      .from("platform_settings")
      .select("key, value")

    if (error) {
      // If table doesn't exist yet, return safe defaults
      return NextResponse.json({
        upload_video_enabled: true,
        upload_photo_enabled: true,
      })
    }

    // Convert array of {key, value} to a plain object
    const settings = {}
    for (const row of data || []) {
      settings[row.key] = row.value === "true" || row.value === true
    }

    // Ensure defaults
    if (settings.upload_video_enabled === undefined) settings.upload_video_enabled = true
    if (settings.upload_photo_enabled === undefined) settings.upload_photo_enabled = true

    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    })
  } catch {
    return NextResponse.json({
      upload_video_enabled: true,
      upload_photo_enabled: true,
    })
  }
}

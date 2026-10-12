import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const { data } = await getUser()
    return NextResponse.json({ user: data.user })
  } catch (e) {
    console.error("[me]", e.message)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

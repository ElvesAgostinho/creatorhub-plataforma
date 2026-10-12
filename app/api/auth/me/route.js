import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function GET() {
  const { data } = await getUser()
  return NextResponse.json({ user: data.user })
}

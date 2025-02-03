import { cookies } from "next/headers"
import { redirect } from "@/lib/i18n"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { teamId } = await request.json()
  const cookieStore = await cookies()
  cookieStore.set("teamId", teamId)

  redirect("/")
}

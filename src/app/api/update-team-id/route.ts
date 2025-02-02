import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { teamId } = await request.json()
  const cookieStore = await cookies()
  cookieStore.set("teamId", teamId)

  redirect("/")
}

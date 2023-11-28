"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function setTeamId(formData: FormData) {
  const teamId = formData.get("teamId") as string

  cookies().set("teamId", teamId)

  redirect("/")
}

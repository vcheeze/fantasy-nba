// app/api/features/route.ts
import { cookies } from 'next/headers'

import { desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { featureVotes, features } from '@/lib/db/schema'

async function getVotedFeatures(): Promise<number[]> {
  const cookieStore = await cookies()
  const fingerprint = cookieStore.get('fingerprint')?.value

  if (!fingerprint) {
    return []
  }

  const votes = await db
    .select({
      featureId: featureVotes.featureId,
    })
    .from(featureVotes)
    .where(eq(featureVotes.fingerprint, fingerprint))

  return votes.map((v) => v.featureId)
}

export async function GET() {
  try {
    const [featuresList, votedFeatures] = await Promise.all([
      db.select().from(features).orderBy(desc(features.votes)),
      getVotedFeatures(),
    ])

    return Response.json({
      features: featuresList,
      votedFeatures,
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch features' }, { status: 500 })
  }
}

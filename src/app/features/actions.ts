'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { featureVotes, features } from '@/lib/db/schema'

export async function recordVote(featureId: number) {
  try {
    const cookieStore = await cookies()
    let fingerprint = cookieStore.get('fingerprint')?.value

    if (!fingerprint) {
      fingerprint = crypto.randomUUID()
      cookieStore.set('fingerprint', fingerprint, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    // check if already voted
    const existingVote = await db
      .select()
      .from(featureVotes)
      .where(
        and(
          eq(featureVotes.fingerprint, fingerprint),
          eq(featureVotes.featureId, featureId),
        ),
      )
      .limit(1)

    if (existingVote.length > 0) {
      return { success: false, error: 'Already voted for this feature' }
    }

    // await db.transaction(async (txn) => {
    //   await txn.insert(featureVotes).values({
    //     fingerprint,
    //     featureId,
    //   })
    // })

    // use batch to ensure atomicity
    await db.batch([
      // increment vote count
      db
        .update(features)
        .set({ votes: sql`${features.votes} + 1` })
        .where(eq(features.id, featureId)),

      // record the vote
      db.insert(featureVotes).values({
        fingerprint,
        featureId,
      }),
    ])

    revalidatePath('/features')
    return { success: true }
  } catch (error) {
    console.error('Vote recording error:', error)
    return { success: false, error: 'Failed to record vote' }
  }
}

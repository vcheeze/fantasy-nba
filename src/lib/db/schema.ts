import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const featureStatus = pgEnum('feature_status', [
  'under-review',
  'planned',
  'under-development',
  'completed',
  'on-hold', // basically a won't do or declined status
])

export const features = pgTable('features', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  description: text('description'),
  votes: integer('votes').default(0),
  status: featureStatus('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const featureVotes = pgTable('feature_votes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  featureId: integer('feature_id')
    .references(() => features.id)
    .notNull(),
  fingerprint: text('fingerprint').notNull(), // store browser fingerprint to prevent duplicate votes
  createdAt: timestamp('created_at').defaultNow(),
})

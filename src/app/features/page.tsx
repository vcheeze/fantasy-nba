import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/site'

import ClientPage from './client-page'

export const metadata: Metadata = pageMetadata({
  path: '/features',
  title: 'Roadmap: Upcoming Features',
  socialTitle: 'Roadmap | Fantasy NBA Planner',
  description:
    'Upcoming features for Fantasy NBA Planner. Upvote the Fantasy NBA Salary Cap Edition tools you want built next.',
})

export default function Features() {
  return <ClientPage />
}

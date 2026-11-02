import type { Metadata } from 'next'

export const SITE_URL = 'https://fantasy-nba.vercel.app'
export const SITE_NAME = 'Fantasy NBA Planner'
export const SITE_DESCRIPTION =
  'Advanced tools and visualizations for your NBA Fantasy Salary Cap Edition team. Optimize transfers, analyze player stats, and maximize your weekly points.'

const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: SITE_NAME,
}

export function pageMetadata({
  path,
  title,
  description,
  socialTitle,
  keywords,
}: {
  path: string
  title: string | { absolute: string }
  description: string
  socialTitle: string
  keywords?: string[]
}): Metadata {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_NAME,
      url,
      title: socialTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [`${SITE_URL}/twitter-image.jpg`],
    },
  }
}

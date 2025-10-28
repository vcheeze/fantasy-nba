import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

type Feature = {
  id: number
  title: string
  description: string
  votes: number
  status: string
}

export type FeaturesResponse = {
  features: Feature[]
  votedFeatures: number[]
}

export const FEATURES_QUERY_KEY = 'features'

export const fetchFeatures = async () => {
  const parsed = await ky.get('/api/features').json()

  return parsed as FeaturesResponse
}

const useFeatures = () =>
  useQuery({
    queryKey: [FEATURES_QUERY_KEY],
    queryFn: () => fetchFeatures(),
  })

export { useFeatures }

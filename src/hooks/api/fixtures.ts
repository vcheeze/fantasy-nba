import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

export interface IFixtures {
  id: number
  event: number
  team_a: number
  team_h: number
}

export const FIXTURES_QUERY_KEY = 'fixtures'

export const fetchFixtures = async (phase?: string) => {
  const parsed = await ky
    .get('/api/fixtures', {
      searchParams: { ...(phase ? { phase } : {}) },
    })
    .json()

  return parsed as IFixtures[]
}

const useFixtures = (phase?: number) => {
  return useQuery({
    queryKey: [FIXTURES_QUERY_KEY],
    queryFn: () => fetchFixtures(phase?.toString()),
  })
}

export { useFixtures }

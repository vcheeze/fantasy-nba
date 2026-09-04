import { useQueries, useQuery } from '@tanstack/react-query'
import ky from 'ky'

const fetchElementSummary = async (playerId: number) => {
  const parsed = await ky
    .get('/api/element-summary', {
      searchParams: { playerId: String(playerId) },
    })
    .json()

  return parsed as any
}

const useElementSummary = (playerId?: number) =>
  useQuery({
    queryKey: ['elementSummary', playerId],
    queryFn: () => fetchElementSummary(playerId ?? 0),
    enabled: !!playerId,
  })

const useElementsSummary = (playerIds: (number | undefined)[]) => {
  const validIds = playerIds.filter((id) => !!id) as number[]

  const queries = useQueries({
    queries: validIds.map((id) => ({
      queryKey: ['elementSummary', id],
      queryFn: () => fetchElementSummary(id),
      enabled: !!id,
    })),
  })

  // return a map of id -> result
  const map: Record<number, any> = {}
  validIds.forEach((id, idx) => {
    map[id] = queries[idx]
  })

  return { queries, map }
}

export { useElementSummary, useElementsSummary }

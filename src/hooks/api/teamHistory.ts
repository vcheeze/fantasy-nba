import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

interface IHistoryEvent {
  event: number
  points: number
  total_points: number
  rank: number
  rank_sort: number
  overall_rank: number
  percentile_rank: number
  bank: number
  value: number
  event_transfers: number
  event_transfers_cost: number
  points_on_bench: number
}

export interface IChip {
  event: number
  name: string
  time: string
}

interface ITeamHistory {
  current: IHistoryEvent[]
  chips: IChip[]
}

const fetchTeamHistory = async (teamId: string) => {
  const parsed = await ky
    .get('/api/history', {
      searchParams: { teamId },
    })
    .json()

  return parsed as ITeamHistory
}

const useTeamHistory = (teamId?: string) =>
  useQuery({
    queryKey: ['teamHistory', teamId],
    queryFn: () => fetchTeamHistory(teamId ?? ''),
    enabled: !!teamId,
  })

export { useTeamHistory }

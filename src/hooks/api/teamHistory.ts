import { useQuery } from "@tanstack/react-query"
import ky from "ky"

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

interface ITeamHistory {
  current: IHistoryEvent[]
}

const fetchTeamHistory = async (teamId: string) => {
  const parsed = await ky
    .get("/api/history", {
      searchParams: { teamId },
    })
    .json()

  return parsed as ITeamHistory
}

const useTeamHistory = (teamId: string) => {
  return useQuery({
    queryKey: ["teamHistory", teamId],
    queryFn: () => fetchTeamHistory(teamId),
  })
}

export { useTeamHistory }

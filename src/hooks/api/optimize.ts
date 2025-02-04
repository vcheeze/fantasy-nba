import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

export interface IPlayer {
  name: string
  team: string
  games: number
  points_per_game: number
  position: 'Back Court' | 'Front Court'
  cost: number
}

export interface IDailyScorer {
  name: string
  team: string
  points: number
  position: 'Back Court' | 'Front Court'
}

export interface IDailyScorers {
  [date: string]: IDailyScorer[]
}

export interface IOptimizedTeam {
  selected_players: IPlayer[]
  daily_scorers: IDailyScorers
  total_points: number
  total_cost: number
  average_points_per_day: number
  scoring_days: number
}

export const optimizeTeam = async (
  phases?: number[],
  pointsColumn?: string,
) => {
  const parsed = await ky
    .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/optimize`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phases),
      ...(pointsColumn && { searchParams: { points_column: pointsColumn } }),
      timeout: 60 * 1000, // 60 seconds
    })
    .json()

  return parsed as IOptimizedTeam
}

const useOptimizeTeam = (phases?: number[], pointsColumn?: string) => {
  return useQuery({
    queryKey: ['optimize', phases, pointsColumn],
    queryFn: () => optimizeTeam(phases, pointsColumn),
    enabled: !!phases,
  })
}

export { useOptimizeTeam }

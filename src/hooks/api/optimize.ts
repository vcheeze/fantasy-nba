import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

import { IPick, ITransfer } from './myTeam'

export enum Position {
  BACK_COURT = 1,
  FRONT_COURT = 2,
}

export interface IPlayer {
  id: number
  name: string
  team: number
  games: number
  form: number
  points: number
  position: Position
  cost: number
  team_short: string
}

export interface IDailyStarter {
  name: string
  team: string
  points: number
  position: Position
}

export interface IDailyStarters {
  [gameweekId: string | number]: IDailyStarter[]
}

export interface IOptimizedTeam {
  squad: IPlayer[]
  daily_starters: IDailyStarters
  points: {
    adjusted_points: number
    raw_points: number
    transfer_penalty: number
  }
  total_cost: number
  average_points_per_day: number
  total_games: number
  transfer_summary: {
    total_transfers: number
    penalties_by_phase: Record<
      string,
      { transfers: number; excess: number; penalty: number }
    >
    total_penalty: 0
  }
  transfers_by_event: Record<
    string,
    { count: number; in: IPlayer[]; out: IPlayer[] }
  >
}

export const optimizeTeam = async (
  gamedays?: number[],
  pointsColumn?: string,
  picks?: IPick[],
  transfers?: ITransfer,
) => {
  const parsed = await ky
    .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/optimize`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gamedays, picks, transfers }),
      ...(pointsColumn && {
        searchParams: {
          ...(pointsColumn && { points_column: pointsColumn }),
        },
      }),
      timeout: 120 * 1000, // 60 seconds
    })
    .json()

  return parsed as IOptimizedTeam
}

const useOptimizeTeam = (
  gamedays?: number[],
  pointsColumn?: string,
  picks?: IPick[],
  transfers?: ITransfer,
) => {
  return useQuery({
    queryKey: ['optimize', gamedays, pointsColumn, picks],
    queryFn: () => optimizeTeam(gamedays, pointsColumn, picks, transfers),
    enabled: !!gamedays,
  })
}

export { useOptimizeTeam }

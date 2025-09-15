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

interface OptimizeParams {
  gamedays?: number[]
  points_column?: string
  picks?: IPick[]
  transfers?: ITransfer
  force_include?: number[]
  force_exclude?: number[]
}

export const optimizeTeam = async (params: OptimizeParams) => {
  const { gamedays, points_column, picks, transfers, force_include, force_exclude } = params
  
  const requestBody: any = { gamedays, picks, transfers }
  
  // Only include force_include and force_exclude if they have values
  if (force_include && force_include.length > 0) {
    requestBody.force_include = force_include
  }
  
  if (force_exclude && force_exclude.length > 0) {
    requestBody.force_exclude = force_exclude
  }
  
  const parsed = await ky
    .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/optimize`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      ...(points_column && {
        searchParams: {
          points_column,
        },
      }),
      timeout: 120 * 1000, // 120 seconds
    })
    .json()

  return parsed as IOptimizedTeam
}

const useOptimizeTeam = (
  gamedays?: number[],
  pointsColumn?: string,
  picks?: IPick[],
  transfers?: ITransfer,
  forceInclude?: number[],
  forceExclude?: number[],
) => {
  return useQuery({
    queryKey: ['optimize', gamedays, pointsColumn, picks, transfers, forceInclude, forceExclude],
    queryFn: () => optimizeTeam({
      gamedays,
      points_column: pointsColumn,
      picks,
      transfers,
      force_include: forceInclude,
      force_exclude: forceExclude,
    }),
    enabled: !!gamedays,
  })
}

export { useOptimizeTeam }

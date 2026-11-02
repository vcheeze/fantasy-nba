import ky from 'ky'

import type { IPick, ITransfer } from './myTeam'

export enum Position {
  BACK_COURT = 1,
  FRONT_COURT = 2,
}

export interface IPlayer {
  id: number
  name: string
  team: string
  team_short: string
  position: Position
  points: number
  availability: number
  cost: number
}

export interface IDailyStarter {
  id: number
  name: string
  team: string
  points: number
  position: Position
}

export interface IDailyStarters {
  [gamedayId: string]: {
    score: number
    starters: IDailyStarter[]
  }
}

export interface IOptimizedTransfer {
  phase: number
  transfer_number: number
  is_paid: boolean
  penalty: number
  points_gained: number
  points_lost: number
  net_points: number
  games_gained: number
  games_lost: number
  in: IPlayer
  out: IPlayer
}

export interface IOptimizedTransfers {
  by_event: Record<string, IOptimizedTransfer[]>
  total: number
  paid: number
  cost: number
  total_net_points: number
}

export interface IOptimizedTeam {
  status: 'Optimal' | 'Feasible'
  squad: IPlayer[]
  squad_by_event: Record<string, IPlayer[]>
  total_cost: number
  solver_objective_value: number
  optimality_gap: number
  true_gameweek_score: number
  total_games: number
  daily_starters: IDailyStarters
  average_points_per_day: number
  transfers: IOptimizedTransfers
}

/** Returned with HTTP 200 when the solver cannot produce a squad. */
export interface IOptimizeFailure {
  status?: 'Error' | 'Infeasible'
  solver?: string
  error: string
}

export type IOptimizeResult = IOptimizedTeam | IOptimizeFailure

export const isOptimizedTeam = (
  data: IOptimizeResult
): data is IOptimizedTeam =>
  data.status === 'Optimal' || data.status === 'Feasible'

interface OptimizeParams {
  gamedays: number[]
  points_column?: string
  picks?: IPick[]
  transfers?: ITransfer
  wildcard?: boolean
}

export const optimizeTeam = async (params: OptimizeParams) => {
  const { gamedays, points_column, picks, transfers, wildcard } = params

  const searchParams: Record<string, string> = {}
  if (points_column) {
    searchParams.points_column = points_column
  }
  if (wildcard) {
    searchParams.wildcard = 'true'
  }

  const parsed = await ky
    .post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/optimize`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      json: {
        gamedays,
        picks,
        transfers,
      },
      searchParams,
      timeout: 120 * 1000, // 120 seconds
    })
    .json()

  return parsed as IOptimizeResult
}

export interface Player {
  name: string
  team: string
  games: number
  points_per_game: number
  position: 'Back Court' | 'Front Court'
  cost: number
}

export interface DailyScorer {
  name: string
  team: string
  points: number
  position: 'Back Court' | 'Front Court'
}

export interface DailyScorers {
  [date: string]: DailyScorer[]
}

export interface PlayerStats {
  selected_players: Player[]
  daily_scorers: DailyScorers
  total_points: number
  total_cost: number
  average_points_per_day: number
  scoring_days: number
}

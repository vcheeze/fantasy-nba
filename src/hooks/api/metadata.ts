import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

export interface IElement {
  id: number
  element_type: number
  first_name: string
  second_name: string
  team: number
  web_name: string
  now_cost: number
  total_points: number
  points_per_game: string
  form: string
  selected_by_percent: string
  minutes: number
  points_scored: number
  rebounds: number
  assists: number
  blocks: number
  steals: number
  status: 'a' | 'i' | 'd' | 'u'
  news: string
  cost_change_start: number
}

export interface IEvent {
  id: number
  name: string
  is_current: boolean
  is_next: boolean
}

export interface IPhase {
  id: number
  name: string
  start_event: number
  stop_event: number
}

export interface ITeam {
  id: number
  name: string
  short_name: string
}

interface IMetadata {
  elements: IElement[]
  events: IEvent[]
  phases: IPhase[]
  teams: ITeam[]
  total_players: number
}

const fetchMetadata = async () => {
  const parsed = await ky.get('/api/data').json()

  return parsed as IMetadata
}

const useMetadata = () =>
  useQuery({
    queryKey: ['metadata'],
    queryFn: () => fetchMetadata(),
  })

export { useMetadata }

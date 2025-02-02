import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

export interface IElement {
  id: number
  element_type: number
  first_name: string
  second_name: string
  team: number
}

export interface IEvent {
  id: number
  name: string
  is_current: boolean
}

interface IPhase {
  id: number
  name: string
  start_event: number
  stop_event: number
}

export interface ITeam {
  id: number
  name: string
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

const useMetadata = () => {
  return useQuery({
    queryKey: ['metadata'],
    queryFn: () => fetchMetadata(),
  })
}

export { useMetadata }

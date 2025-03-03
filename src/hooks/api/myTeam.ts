import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

export interface IChip {
  status_for_entry: string
  played_by_entry: number[]
  name: string
  number: number
  start_event: number
  stop_event: number
  chip_type: 'team' | 'transfer'
  is_pending: boolean
}

export interface IPick {
  element: number
  position: number
  selling_price: number
  multiplier: number
  purchase_price: number
  is_captain: boolean
}

export interface ITransfer {
  bank: number
  const: number
  limit: number
  mode: number
  status: string
  value: number
}

interface IMyTeam {
  chips: IChip[]
  picks: IPick[]
  picks_last_updated: string
  transfers: ITransfer
}

const fetchMyTeam = async (teamId: string) => {
  const parsed = await ky
    .get('/api/my-team', {
      searchParams: { teamId },
    })
    .json()

  return parsed as IMyTeam
}

const useMyTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['myTeam', teamId],
    queryFn: () => fetchMyTeam(teamId),
    enabled: !!teamId,
  })
}

export { useMyTeam }

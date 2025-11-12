import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

interface ITeamDetails {
  id: number
  name: string
  current_event: number
}

const fetchTeamDetails = async (teamId: string) => {
  const parsed = await ky
    .get('/api/team-details', {
      searchParams: { teamId },
    })
    .json()

  return parsed as ITeamDetails
}

const useTeamDetails = (teamId?: string) =>
  useQuery({
    queryKey: ['teamDetails', teamId],
    queryFn: () => fetchTeamDetails(teamId ?? ''),
    enabled: !!teamId,
  })

export { useTeamDetails }

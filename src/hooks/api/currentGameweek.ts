import { useQuery } from '@tanstack/react-query'
import ky from 'ky'

const fetchCurrentGameweek = async () => {
  const parsed = (await ky.get('/api/current-gameweek').json()) as {
    current_event: number
  }

  return parsed.current_event
}

const useCurrentGameweek = () => {
  return useQuery({
    queryKey: ['currentGameweek'],
    queryFn: () => fetchCurrentGameweek(),
  })
}

export { useCurrentGameweek }

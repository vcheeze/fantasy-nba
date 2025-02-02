'use client'

import { useEffect, useState } from 'react'

import { QueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FIXTURES_QUERY_KEY,
  IEvent,
  IFixtures,
  ITeam,
  fetchFixtures,
  useMetadata,
} from '@/hooks/api'

interface TeamStats {
  team: string
  appearances: number
  homeGames: number
  awayGames: number
  fixtureAppearances: { [key: number]: 'H' | 'A' | null }
}

const FixtureAnalysisTable = ({
  fixtures,
  events,
  teams,
}: {
  fixtures: IFixtures[]
  events: IEvent[]
  teams: ITeam[]
}) => {
  const processFixtures = () => {
    // Get unique events sorted
    const gamedays = Array.from(new Set(fixtures.map((f) => f.event))).sort(
      (a, b) => a - b,
    )

    // Process team statistics and fixture appearances
    const teamStatsMap = new Map<string, TeamStats>()

    // Initialize all teams with their stats
    fixtures.forEach((fixture) => {
      ;[fixture.team_h.toString(), fixture.team_a.toString()].forEach(
        (team) => {
          if (!teamStatsMap.has(team)) {
            teamStatsMap.set(team, {
              team,
              appearances: 0,
              homeGames: 0,
              awayGames: 0,
              fixtureAppearances: gamedays.reduce(
                (acc, event) => ({
                  ...acc,
                  [event]: null,
                }),
                {},
              ),
            })
          }
        },
      )
    })

    // Fill in appearances
    fixtures.forEach((fixture) => {
      const homeStats = teamStatsMap.get(fixture.team_h.toString())!
      const awayStats = teamStatsMap.get(fixture.team_a.toString())!

      homeStats.appearances++
      homeStats.homeGames++
      homeStats.fixtureAppearances[fixture.event] = 'H'

      awayStats.appearances++
      awayStats.awayGames++
      awayStats.fixtureAppearances[fixture.event] = 'A'
    })

    // Sort teams by total appearances
    const sortedTeams = Array.from(teamStatsMap.values()).sort(
      (a, b) => b.appearances - a.appearances || a.team.localeCompare(b.team),
    )

    return { gamedays, teamStats: sortedTeams }
  }

  const { gamedays, teamStats } = processFixtures()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Team Fixture Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-left">Team</TableHead>
                {gamedays.map((event) => (
                  <TableHead key={event} className="text-center">
                    {events
                      .find((evt) => evt.id === event)
                      ?.name.split(' - ')?.[1] ?? ''}
                  </TableHead>
                ))}
                <TableHead className="text-center">Total Games</TableHead>
                <TableHead className="text-center">Home Games</TableHead>
                <TableHead className="text-center">Away Games</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamStats.map((stats, index) => (
                <TableRow
                  key={stats.team}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}
                >
                  <TableCell className="font-medium">
                    {teams.find((team) => team.id === parseInt(stats.team))
                      ?.name ?? ''}
                  </TableCell>
                  {gamedays.map((event) => (
                    <TableCell key={event} className="text-center">
                      {stats.fixtureAppearances[event] && (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            stats.fixtureAppearances[event] === 'H'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          }`}
                        >
                          {stats.fixtureAppearances[event]}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-primary/10 rounded-full font-medium">
                      {stats.appearances}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {stats.homeGames}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats.awayGames}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Fixtures() {
  const { data } = useMetadata()
  const currentEventId = data?.events.find((event) => event.is_current)?.id
  const currentPhase = currentEventId
    ? data?.phases.find(
        (phase) =>
          phase.id !== 1 &&
          currentEventId >= phase.start_event &&
          currentEventId <= phase.stop_event,
      )
    : undefined
  const [gameweek, setGameweek] = useState(currentPhase)
  const [fixtures, setFixtures] = useState<IFixtures[]>([])
  const queryClient = new QueryClient()
  useEffect(() => {
    async function getGameweekFixtures(gw?: string) {
      const data = await queryClient.fetchQuery({
        queryKey: [FIXTURES_QUERY_KEY],
        queryFn: () => fetchFixtures(gw),
      })
      setFixtures(data)
    }
    if (gameweek?.id.toString() ?? currentPhase?.id.toString()) {
      getGameweekFixtures(
        gameweek?.id.toString() ?? currentPhase?.id.toString(),
      )
    }
  }, [gameweek, currentPhase?.id])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Fixtures Analysis
        </h2>
        <p className="text-xl text-muted-foreground">
          Analyzes fixtures by Gameweek, and orders the teams by the highest
          number of games played. This should help you figure out how to
          structure your team so you get the maximum number of games out of your
          players.
        </p>
      </div>
      <Select
        value={gameweek?.id.toString()}
        onValueChange={(value) =>
          setGameweek(
            data?.phases.find((phase) => phase.id.toString() === value),
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={currentPhase?.name} />
        </SelectTrigger>
        <SelectContent>
          {data?.phases.map((gameweek) => (
            <SelectItem key={gameweek.id} value={gameweek.id.toString()}>
              {gameweek.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FixtureAnalysisTable
        fixtures={
          fixtures?.filter(
            (fixture) =>
              gameweek &&
              fixture.event >= gameweek.start_event &&
              fixture.event <= gameweek.stop_event,
          ) || []
        }
        events={data?.events ?? []}
        teams={data?.teams ?? []}
      />
    </div>
  )
}

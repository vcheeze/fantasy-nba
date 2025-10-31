'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type IEvent,
  type IFixtures,
  type ITeam,
  useFixtures,
  useMetadata,
} from '@/hooks/api'
import { cn } from '@/lib/utils'

interface TeamStats {
  team: string
  appearances: number
  homeGames: number
  awayGames: number
  fixtureAppearances: { [key: number]: 'H' | 'A' | null }
}

const SkeletonTable = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Team Fixture Analysis</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-left">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead className="text-center" key={i}>
                  <Skeleton className="mx-auto h-4 w-12" />
                </TableHead>
              ))}
              <TableHead className="text-center">
                <Skeleton className="mx-auto h-4 w-16" />
              </TableHead>
              <TableHead className="text-center">
                <Skeleton className="mx-auto h-4 w-16" />
              </TableHead>
              <TableHead className="text-center">
                <Skeleton className="mx-auto h-4 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow
                className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}
                key={index}
              >
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableCell className="text-center" key={i}>
                    <Skeleton className="mx-auto h-6 w-6 rounded-full" />
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-6 w-8 rounded-full" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)

const FixtureAnalysisTable = ({
  fixtures,
  events,
  teams,
}: {
  fixtures: IFixtures[]
  events: IEvent[]
  teams: ITeam[]
}) => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]) // Store selected team IDs
  const [isAllSelected, setIsAllSelected] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const processFixtures = () => {
    // Get unique events sorted
    const gamedays = Array.from(new Set(fixtures.map((f) => f.event))).sort(
      (a, b) => a - b
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
                {}
              ),
            })
          }
        }
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
      (a, b) => b.appearances - a.appearances || a.team.localeCompare(b.team)
    )

    return { gamedays, teamStats: sortedTeams }
  }

  const { gamedays, teamStats } = processFixtures()

  // Toggle all teams selection
  const toggleAllTeams = () => {
    if (isAllSelected) {
      setSelectedTeams([])
    } else {
      setSelectedTeams(teams.map((team) => team.id.toString()))
    }
    setIsAllSelected(!isAllSelected)
  }

  // Toggle individual team selection
  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) => {
      const newSelection = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
      setIsAllSelected(newSelection.length === teams.length)
      return newSelection
    })
  }

  // Filter teamStats based on selection
  const filteredTeamStats = teamStats.filter((stats) =>
    selectedTeams.length === 0 ? true : selectedTeams.includes(stats.team)
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Fixture Analysis</CardTitle>
          <Button
            className="text-xs"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            size="sm"
            variant="outline"
          >
            {selectedTeams.length === 0
              ? 'All Teams'
              : `${selectedTeams.length} Team${selectedTeams.length === 1 ? '' : 's'} Selected`}
          </Button>
        </div>
        <Collapsible onOpenChange={setIsFilterOpen} open={isFilterOpen}>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  id="select-all"
                  onCheckedChange={toggleAllTeams}
                />
                <label
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="select-all"
                >
                  Select All Teams
                </label>
              </div>
              <Input
                className="w-[200px]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                type="search"
                value={searchQuery}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {teams
                .slice() // Create a copy to avoid mutating the original array
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter((team) =>
                  team.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((team) => (
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-2 transition-colors',
                      selectedTeams.includes(team.id.toString())
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    )}
                    key={team.id}
                    onClick={() => toggleTeam(team.id.toString())}
                    role="button"
                    tabIndex={0}
                  >
                    <Checkbox
                      checked={selectedTeams.includes(team.id.toString())}
                      id={`team-${team.id}`}
                    />
                    <label
                      className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor={`team-${team.id}`}
                    >
                      {team.name}
                    </label>
                  </div>
                ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-left">Team</TableHead>
                {gamedays.map((event) => (
                  <TableHead className="text-center" key={event}>
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
              {filteredTeamStats.map((stats, index) => (
                <TableRow
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}
                  key={stats.team}
                >
                  <TableCell className="font-medium">
                    {teams.find(
                      (team) => team.id === Number.parseInt(stats.team)
                    )?.name ?? ''}
                  </TableCell>
                  {gamedays.map((event) => (
                    <TableCell className="text-center" key={event}>
                      {stats.fixtureAppearances[event] && (
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-medium text-xs ${
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
                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-primary/10 px-2 py-1 font-medium">
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
  const { data, isLoading } = useMetadata()
  const currentEventId = data?.events.find((event) => event.is_next)?.id
  const currentPhase = currentEventId
    ? data?.phases.find(
        (phase) =>
          phase.id !== 1 &&
          currentEventId >= phase.start_event &&
          currentEventId <= phase.stop_event
      )
    : undefined
  const [gameweek, setGameweek] = useState(currentPhase)
  useEffect(() => {
    if (currentPhase) {
      setGameweek(currentPhase)
    }
  }, [currentPhase])
  const { data: fixtures, isLoading: isFixturesLoading } = useFixtures(
    gameweek?.id ?? currentPhase?.id
  )

  if (isLoading || isFixturesLoading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
          Fixtures Analyzer
        </h2>
        <p className="text-muted-foreground text-xl">
          Analyzes fixtures by Gameweek, and orders the teams by the highest
          number of games played. This should help you figure out how to
          structure your team so you get the maximum number of games out of your
          players.
        </p>
      </div>
      <Select
        onValueChange={(value) =>
          setGameweek(
            data?.phases.find((phase) => phase.id.toString() === value)
          )
        }
        value={gameweek?.id.toString()}
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
        events={data?.events ?? []}
        fixtures={
          fixtures?.filter(
            (fixture) =>
              gameweek &&
              fixture.event >= gameweek.start_event &&
              fixture.event <= gameweek.stop_event
          ) || []
        }
        teams={data?.teams ?? []}
      />
    </div>
  )
}

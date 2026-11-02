'use client'

import { CaretDownIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

const FIXTURES_DESCRIPTION =
  'Analyzes fixtures by Gameweek, and orders the teams by the highest number of games played. This should help you figure out how to structure your team so you get the maximum number of games out of your players.'

type TeamStats = {
  team: string
  appearances: number
  homeGames: number
  awayGames: number
  fixtureAppearances: { [key: number]: 'H' | 'A' | null }
}

const NON_GAMEWEEK_COLUMNS = 4
const SKELETON_GAMEWEEKS = ['1', '2', '3', '4', '5', '6']
const SKELETON_ROWS = ['1', '2', '3', '4', '5', '6', '7', '8']

function processFixtures(fixtures: IFixtures[]) {
  const gamedays = Array.from(
    new Set(fixtures.map((fixture) => fixture.event))
  ).sort((a, b) => a - b)

  const teamStatsMap = new Map<string, TeamStats>()

  for (const fixture of fixtures) {
    const sides = [
      { id: fixture.team_h.toString(), type: 'H' as const, isHome: true },
      { id: fixture.team_a.toString(), type: 'A' as const, isHome: false },
    ]

    for (const { id, type, isHome } of sides) {
      let stats = teamStatsMap.get(id)
      if (!stats) {
        const fixtureAppearances: TeamStats['fixtureAppearances'] = {}
        for (const event of gamedays) {
          fixtureAppearances[event] = null
        }
        stats = {
          team: id,
          appearances: 0,
          homeGames: 0,
          awayGames: 0,
          fixtureAppearances,
        }
        teamStatsMap.set(id, stats)
      }

      stats.appearances += 1
      if (isHome) {
        stats.homeGames += 1
      } else {
        stats.awayGames += 1
      }
      stats.fixtureAppearances[fixture.event] = type
    }
  }

  const teamStats = Array.from(teamStatsMap.values()).sort(
    (a, b) => b.appearances - a.appearances || a.team.localeCompare(b.team)
  )

  return { gamedays, teamStats }
}

function selectionLabel(selectedCount: number, total: number) {
  if (total > 0 && selectedCount === total) {
    return 'All teams'
  }
  if (selectedCount === 0) {
    return 'No teams'
  }
  return `${selectedCount} ${selectedCount === 1 ? 'team' : 'teams'}`
}

function TeamFilter({
  teams,
  selectedIds,
  onSelectedIdsChange,
}: {
  teams: ITeam[]
  selectedIds: string[]
  onSelectedIdsChange: (update: (ids: string[]) => string[]) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const query = searchQuery.trim().toLowerCase()

  const visibleTeams = useMemo(() => {
    const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name))
    if (!query) {
      return sorted
    }
    return sorted.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.short_name.toLowerCase().includes(query)
    )
  }, [teams, query])

  const visibleIds = visibleTeams.map((team) => team.id.toString())
  const visibleSelectedCount = visibleIds.filter((id) =>
    selectedSet.has(id)
  ).length
  const allVisibleSelected =
    visibleIds.length > 0 && visibleSelectedCount === visibleIds.length
  let selectAllState: boolean | 'indeterminate' = false
  if (allVisibleSelected) {
    selectAllState = true
  } else if (visibleSelectedCount > 0) {
    selectAllState = 'indeterminate'
  }

  const allSelected =
    teams.length > 0 &&
    teams.every((team) => selectedSet.has(team.id.toString()))

  const setTeam = (teamId: string, checked: boolean) => {
    onSelectedIdsChange((current) => {
      const has = current.includes(teamId)
      if (checked && !has) {
        return [...current, teamId]
      }
      if (!checked && has) {
        return current.filter((id) => id !== teamId)
      }
      return current
    })
  }

  const setVisible = (checked: boolean) => {
    onSelectedIdsChange((current) => {
      if (checked) {
        return [...new Set([...current, ...visibleIds])]
      }
      const hide = new Set(visibleIds)
      return current.filter((id) => !hide.has(id))
    })
  }

  return (
    <Collapsible>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="min-w-0 font-bold font-display text-2xl leading-none tracking-tight">
          <h2 className="text-balance">Team Fixture Analysis</h2>
        </CardTitle>
        <CollapsibleTrigger asChild>
          <Button
            className="group w-full sm:w-auto"
            size="sm"
            variant="outline"
          >
            <span className="tabular-nums">
              {selectionLabel(selectedIds.length, teams.length)}
            </span>
            <CaretDownIcon
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label
              className="flex min-h-11 w-fit cursor-pointer items-center gap-3"
              htmlFor="fixtures-select-all"
            >
              <Checkbox
                checked={selectAllState}
                className="pointer-events-none"
                disabled={visibleTeams.length === 0}
                id="fixtures-select-all"
                onCheckedChange={(checked) => setVisible(checked === true)}
              />
              <span className="font-medium text-sm">
                {query ? 'Select matching' : 'Select all'}
              </span>
            </label>
            <div className="relative w-full sm:w-56">
              <Input
                aria-label="Search teams"
                className="pr-11 [&::-webkit-search-cancel-button]:hidden"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search teams"
                type="search"
                value={searchQuery}
              />
              {searchQuery ? (
                <button
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  <XIcon className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
          {visibleTeams.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No teams match "{query}".
            </p>
          ) : (
            <div className="grid max-h-80 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleTeams.map((team) => {
                const teamId = team.id.toString()
                const checked = selectedSet.has(teamId)
                return (
                  <label
                    className={cn(
                      'flex min-h-11 min-w-0 cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2.5 transition-colors duration-150',
                      checked
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                    htmlFor={`fixtures-team-${team.id}`}
                    key={team.id}
                  >
                    <Checkbox
                      checked={checked}
                      className="pointer-events-none"
                      id={`fixtures-team-${team.id}`}
                      onCheckedChange={(value) =>
                        setTeam(teamId, value === true)
                      }
                    />
                    <span className="min-w-0 font-medium text-sm leading-snug">
                      {team.name}
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
            <span className="tabular-nums">
              {selectedIds.length} of {teams.length} selected
            </span>
            {allSelected ? null : (
              <button
                className="inline-flex min-h-11 items-center font-medium text-foreground text-sm transition-colors hover:text-primary"
                onClick={() =>
                  onSelectedIdsChange(() =>
                    teams.map((team) => team.id.toString())
                  )
                }
                type="button"
              >
                Show all teams
              </button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FixtureTableSkeleton() {
  return (
    <div className="min-w-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="text-left">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            {SKELETON_GAMEWEEKS.map((week) => (
              <TableHead className="text-center" key={week}>
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
          {SKELETON_ROWS.map((row) => (
            <TableRow
              className={
                Number(row) % 2 === 1 ? 'bg-background' : 'bg-muted/25'
              }
              key={row}
            >
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              {SKELETON_GAMEWEEKS.map((week) => (
                <TableCell className="text-center" key={week}>
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
  )
}

function SkeletonTable() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold font-display text-2xl leading-none tracking-tight">
          <h2>Team Fixture Analysis</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FixtureTableSkeleton />
      </CardContent>
    </Card>
  )
}

function FixtureAnalysisTable({
  fixtures,
  events,
  teams,
  isLoading,
}: {
  fixtures: IFixtures[]
  events: IEvent[]
  teams: ITeam[]
  isLoading: boolean
}) {
  const [selectedIds, setSelectedIds] = useState(() =>
    teams.map((team) => team.id.toString())
  )
  const { gamedays, teamStats } = useMemo(
    () => processFixtures(fixtures),
    [fixtures]
  )
  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id.toString(), team.name])),
    [teams]
  )
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const filteredTeamStats = teamStats.filter((stats) =>
    selectedSet.has(stats.team)
  )
  let emptyMessage = 'No fixtures in this gameweek.'
  if (teamStats.length > 0 && selectedIds.length === 0) {
    emptyMessage = 'Select a team to see its fixtures.'
  } else if (teamStats.length > 0) {
    emptyMessage = 'None of the selected teams play in this gameweek.'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <TeamFilter
          onSelectedIdsChange={setSelectedIds}
          selectedIds={selectedIds}
          teams={teams}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <FixtureTableSkeleton />
        ) : (
          <div className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="sticky left-0 z-20 border-r bg-muted px-2.5 text-left md:px-4">
                    Team
                  </TableHead>
                  {gamedays.map((event) => (
                    <TableHead className="px-2 text-center md:px-4" key={event}>
                      {events
                        .find((evt) => evt.id === event)
                        ?.name.split(' - ')?.[1] ?? ''}
                    </TableHead>
                  ))}
                  <TableHead className="px-2 text-center md:px-4">
                    <span className="sm:hidden">Games</span>
                    <span className="hidden sm:inline">Total Games</span>
                  </TableHead>
                  <TableHead className="px-2 text-center md:px-4">
                    <span className="sm:hidden">Home</span>
                    <span className="hidden sm:inline">Home Games</span>
                  </TableHead>
                  <TableHead className="px-2 text-center md:px-4">
                    <span className="sm:hidden">Away</span>
                    <span className="hidden sm:inline">Away Games</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamStats.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center text-muted-foreground"
                      colSpan={gamedays.length + NON_GAMEWEEK_COLUMNS}
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : null}
                {filteredTeamStats.map((stats, index) => (
                  <TableRow
                    className={
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/25'
                    }
                    key={stats.team}
                  >
                    <TableCell
                      className={cn(
                        'sticky left-0 z-10 max-w-[9rem] border-r px-2.5 font-medium group-hover:bg-muted md:max-w-none md:px-4',
                        index % 2 === 0 ? 'bg-background' : 'bg-muted'
                      )}
                    >
                      <span className="block leading-snug">
                        {teamsById.get(stats.team) ?? ''}
                      </span>
                    </TableCell>
                    {gamedays.map((event) => (
                      <TableCell
                        className="px-2 text-center md:px-4"
                        key={event}
                      >
                        {stats.fixtureAppearances[event] && (
                          <span
                            className={cn(
                              'inline-flex h-6 w-6 items-center justify-center rounded-full font-semibold text-xs',
                              stats.fixtureAppearances[event] === 'H'
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-primary/50 text-primary'
                            )}
                          >
                            {stats.fixtureAppearances[event]}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="px-2 text-center md:px-4">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-secondary px-2 py-1 font-display font-extrabold text-base text-secondary-foreground tabular-nums leading-none">
                        {stats.appearances}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 text-center tabular-nums md:px-4">
                      {stats.homeGames}
                    </TableCell>
                    <TableCell className="px-2 text-center tabular-nums md:px-4">
                      {stats.awayGames}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
  const [gameweekId, setGameweekId] = useState<number>()
  const gameweek =
    data?.phases.find((phase) => phase.id === gameweekId) ?? currentPhase
  const { data: fixtures, isLoading: isFixturesLoading } = useFixtures(
    gameweek?.id
  )
  const fixturesInWeek = useMemo(
    () =>
      (fixtures ?? []).filter(
        (fixture) =>
          gameweek &&
          fixture.event >= gameweek.start_event &&
          fixture.event <= gameweek.stop_event
      ),
    [fixtures, gameweek]
  )

  if (isLoading || !data) {
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          actions={<Skeleton className="h-11 w-full sm:h-10 sm:w-[220px]" />}
          description={FIXTURES_DESCRIPTION}
          title="Fixtures Analyzer"
        />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        actions={
          <Select
            onValueChange={(value) => setGameweekId(Number(value))}
            value={gameweek?.id.toString()}
          >
            <SelectTrigger
              aria-label="Gameweek"
              className="w-full sm:w-[220px]"
            >
              <SelectValue placeholder={currentPhase?.name} />
            </SelectTrigger>
            <SelectContent>
              {data?.phases
                .filter((p) => p.id !== 1)
                .map((phaseOption) => (
                  <SelectItem
                    key={phaseOption.id}
                    value={phaseOption.id.toString()}
                  >
                    {phaseOption.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        }
        description={FIXTURES_DESCRIPTION}
        title="Fixtures Analyzer"
      />
      <FixtureAnalysisTable
        events={data.events}
        fixtures={fixturesInWeek}
        isLoading={isFixturesLoading}
        teams={data.teams}
      />
    </div>
  )
}

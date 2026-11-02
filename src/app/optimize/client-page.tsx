'use client'

import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pie, PieChart } from 'recharts'

import { WarningCircleIcon } from '@phosphor-icons/react'

import { DailyScorersChart } from '@/components/DailyScorersChart'
import { PageHeader, SectionTitle } from '@/components/PageHeader'
import { PlayerTable } from '@/components/PlayerTable'
import { StatStrip } from '@/components/StatStrip'
import { TextLoader } from '@/components/TextLoader'
import { TransferSummary } from '@/components/TransferSummary'
import { Button } from '@/components/ui/button'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type IOptimizedTeam,
  isOptimizedTeam,
  optimizeTeam,
  Position,
  useMetadata,
  useMyTeam,
} from '@/hooks/api'
import { getQueryClient } from '@/lib/get-query-client'
import { cn } from '@/lib/utils'
import { teamIdAtom } from '@/store'

export default function Optimize() {
  const [startGameday, setStartGameday] = useState<number>()
  const [stopGameday, setStopGameday] = useState<number>()
  const [pointsColumn, setPointsColumn] = useState<string>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [playerData, setPlayerData] = useState<IOptimizedTeam>()
  const [optimizeError, setOptimizeError] = useState<string>()
  const resultsRef = useRef<HTMLDivElement>(null)

  // React 18 has no `inert` prop; stale results must not take clicks or focus.
  useEffect(() => {
    if (resultsRef.current) resultsRef.current.inert = isLoading
  }, [isLoading])
  // const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  // const [includedPlayers, setIncludedPlayers] = useState<number[]>([]);
  // const [excludedPlayers, setExcludedPlayers] = useState<number[]>([]);
  // const [selectionMode, setSelectionMode] = useState<"include" | "exclude">(
  //   "include"
  // );
  // const [sheetOpen, setSheetOpen] = useState(false);

  const { data: metadata } = useMetadata()

  const { currentEventIndex, eventOptions, currentPhase } = useMemo(() => {
    // Early return if no metadata
    if (!(metadata?.events && metadata?.phases)) {
      return { currentEventIndex: -1, eventOptions: undefined }
    }

    // Find current event
    const currentGamedayIndex = metadata.events.findIndex(
      (event) => event.is_next
    )
    if (currentGamedayIndex === -1) {
      return { currentGamedayIndex: -1, eventOptions: undefined }
    }

    const currentEvent = metadata.events[currentGamedayIndex]

    // Find current phase (skip phase id=1 which is "Overall")
    const currentPhaseIndex = metadata.phases.findIndex(
      (phase) =>
        phase.id !== 1 &&
        currentEvent.id >= phase.start_event &&
        currentEvent.id <= phase.stop_event
    )
    const currentPhase =
      currentPhaseIndex > -1 ? metadata.phases[currentPhaseIndex] : undefined

    // Determine slice end point
    let endIndex = metadata.events.length
    const nextPhase = metadata.phases[currentPhaseIndex + 1]

    if (nextPhase) {
      const nextPhaseEndIndex = metadata.events.findIndex(
        (event) => event.id === nextPhase.stop_event
      )
      if (nextPhaseEndIndex > -1) {
        endIndex = nextPhaseEndIndex + 1
      }
    }

    const options = metadata.events.slice(currentGamedayIndex, endIndex)

    return {
      currentEventIndex: currentGamedayIndex,
      eventOptions: options,
      currentPhase,
    }
  }, [metadata])

  useEffect(() => {
    if (!startGameday && currentEventIndex && currentEventIndex > -1) {
      setStartGameday(metadata?.events[currentEventIndex].id)
    }
  }, [startGameday, currentEventIndex, metadata?.events])

  // Calculate court position distribution data
  const courtPositionData =
    playerData?.squad.reduce(
      (acc, player) => {
        const position = player.position
        if (!acc[position]) {
          acc[position] = {
            position:
              position === Position.BACK_COURT ? 'Back Court' : 'Front Court',
            value: 0,
            players: 0,
          }
        }
        acc[position].value += player.points / 10
        acc[position].players += 1
        return acc
      },
      {} as Record<string, { position: string; value: number; players: number }>
    ) ?? {}

  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ]
  const positionDistributionData = Object.values(courtPositionData).map(
    (d, index) => ({
      ...d,
      fill: COLORS[index],
    })
  )

  const [teamId] = useAtom(teamIdAtom)
  const { data: myTeam } = useMyTeam(teamId)

  const queryClient = getQueryClient()
  const fetchOptimizedTeam = useCallback(async () => {
    if (!(startGameday && stopGameday)) {
      return
    }

    setIsLoading(true)
    setOptimizeError(undefined)
    // Get all event IDs
    const gamedays = Array.from(
      { length: stopGameday - startGameday + 1 },
      (_, i) => i + startGameday
    )

    // Only include transfers if the selected gamedays include the current phase
    // (use `currentPhase` returned from useMemo to avoid re-scanning metadata)
    const includeTransfers =
      !!currentPhase &&
      gamedays.some(
        (g) =>
          g >=
            (currentPhase as { start_event: number; stop_event: number })
              .start_event &&
          g <=
            (currentPhase as { start_event: number; stop_event: number })
              .stop_event
      )

    try {
      const data = await queryClient.fetchQuery({
        queryKey: [
          'optimize',
          gamedays,
          pointsColumn,
          myTeam?.picks,
          includeTransfers ? myTeam?.transfers : null,
        ],
        queryFn: () =>
          optimizeTeam({
            gamedays,
            points_column: pointsColumn,
            picks: myTeam?.picks || [],
            ...(includeTransfers && myTeam?.transfers
              ? { transfers: myTeam.transfers }
              : {}),
          }),
      })
      if (!isOptimizedTeam(data)) {
        setPlayerData(undefined)
        setOptimizeError(data.error)
        return
      }
      setPlayerData(data)
    } catch (error) {
      console.log('error :>> ', error)
      setPlayerData(undefined)
      setOptimizeError('The optimizer request failed.')
    } finally {
      setIsLoading(false)
    }
  }, [
    startGameday,
    stopGameday,
    pointsColumn,
    myTeam,
    currentPhase,
    queryClient,
    // includedPlayers,
    // excludedPlayers,
  ])

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        description="See the optimal team calculated based on player form or points per game, up to one Gameweek into the future."
        title="Optimal Team"
      />

      <section
        aria-labelledby="optimize-settings-title"
        className="rounded-md border bg-card p-5 md:p-6"
      >
        <SectionTitle className="mb-2 md:text-2xl">
          <span id="optimize-settings-title">
            Select how you want to calculate the optimal team.
          </span>
        </SectionTitle>
        <p className="mb-5 max-w-[70ch] text-muted-foreground text-sm">
          Choose the starting and ending Gamedays, and whether you want to
          calculate based on points per game from the last 30 games (form) or
          from the whole season.
        </p>
        <div className="flex flex-wrap gap-4 max-sm:flex-col md:items-end">
          <Field className="md:w-xs">
            <FieldLabel>Starting Gameday</FieldLabel>
            <Select
              onValueChange={(value) =>
                setStartGameday(Number.parseInt(value, 10))
              }
              value={startGameday?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gameweek" />
              </SelectTrigger>
              <SelectContent>
                {eventOptions?.map((eo) => (
                  <SelectItem key={eo.id} value={eo.id.toString()}>
                    {eo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="md:w-xs">
            <FieldLabel>Ending Gameday</FieldLabel>
            <Select
              onValueChange={(value) =>
                setStopGameday(Number.parseInt(value, 10))
              }
              value={stopGameday?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gameweek" />
              </SelectTrigger>
              <SelectContent>
                {eventOptions?.map((eo) => (
                  <SelectItem key={eo.id} value={eo.id.toString()}>
                    {eo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="md:w-[180px]">
            <FieldLabel>Points Column</FieldLabel>
            <Select
              onValueChange={(value) => setPointsColumn(value)}
              value={pointsColumn}
            >
              <SelectTrigger>
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="points_per_game">Points per game</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button
            className="md:mr-2"
            disabled={isLoading}
            onClick={fetchOptimizedTeam}
          >
            Optimize Team
          </Button>
        </div>
        {/* <div className="mt-6 space-y-6">
          <div>
            <Label className="mb-2 block">
              Force Include Players ({includedPlayers.length}/10)
            </Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {includedPlayers.map((playerId) => {
                const player = metadata?.elements.find((p) => p.id === playerId)
                return player ? (
                  <Badge
                    key={player.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {player.first_name} {player.second_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 rounded-full hover:bg-secondary-foreground/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIncludedPlayers((prev) =>
                          prev.filter((id) => id !== player.id),
                        )
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ) : null
              })}
              {includedPlayers.length < 10 && (
                <Sheet
                  open={sheetOpen && selectionMode === 'include'}
                  onOpenChange={(open) => {
                    setSheetOpen(open)
                    if (open) setSelectionMode('include')
                  }}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7">
                      + Add Player
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Select Players to Include</SheetTitle>
                      <SheetDescription>
                        These players will be forced into your optimized team.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <PlayerSelection
                        onPlayerSelect={(player) => {
                          if (
                            !includedPlayers.includes(player.id) &&
                            includedPlayers.length < 10
                          ) {
                            // Remove from excluded if present
                            if (excludedPlayers.includes(player.id)) {
                              setExcludedPlayers((prev) =>
                                prev.filter((id) => id !== player.id),
                              )
                            }
                            // Add to included
                            setIncludedPlayers((prev) => [...prev, player.id])
                          }
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">
              Force Exclude Players ({excludedPlayers.length}/10)
            </Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {excludedPlayers.map((playerId) => {
                const player = metadata?.elements.find((p) => p.id === playerId)
                return player ? (
                  <Badge
                    key={player.id}
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    {player.first_name} {player.second_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 rounded-full hover:bg-destructive-foreground/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExcludedPlayers((prev) =>
                          prev.filter((id) => id !== player.id),
                        )
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ) : null
              })}
              {excludedPlayers.length < 10 && (
                <Sheet
                  open={sheetOpen && selectionMode === 'exclude'}
                  onOpenChange={(open) => {
                    setSheetOpen(open)
                    if (open) setSelectionMode('exclude')
                  }}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7">
                      + Add Player
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Select Players to Exclude</SheetTitle>
                      <SheetDescription>
                        These players will be excluded from your optimized team.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <PlayerSelection
                        onPlayerSelect={(player) => {
                          if (
                            !excludedPlayers.includes(player.id) &&
                            excludedPlayers.length < 10
                          ) {
                            // Remove from included if present
                            if (includedPlayers.includes(player.id)) {
                              setIncludedPlayers((prev) =>
                                prev.filter((id) => id !== player.id),
                              )
                            }
                            // Add to excluded
                            setExcludedPlayers((prev) => [...prev, player.id])
                          }
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          <div>
            
          </div>
        </div> */}
      </section>
      {optimizeError ? (
        <p
          className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive text-sm"
          role="alert"
        >
          <WarningCircleIcon aria-hidden="true" className="size-5 shrink-0" />
          {optimizeError}
        </p>
      ) : null}
      {isLoading && (
        <TextLoader
          interval={3000}
          messages={[
            'Fetching data to calculate the optimal team',
            'Getting the fixtures you selected',
            'Computing the optimal team',
          ]}
        />
      )}
      {playerData && metadata ? (
        <div
          aria-busy={isLoading}
          className={cn(
            'space-y-6 transition-opacity duration-200 ease-out md:space-y-8',
            isLoading && 'opacity-50 delay-150'
          )}
          ref={resultsRef}
        >
          <StatStrip
            stats={[
              {
                label: 'Total Points',
                value:
                  playerData.transfers.cost > 0
                    ? `${(playerData.true_gameweek_score / 10).toLocaleString()} (-${(playerData.transfers.cost / 10).toLocaleString()})`
                    : (playerData.true_gameweek_score / 10).toLocaleString(),
              },
              {
                label: 'Total Cost',
                value: `$${(playerData.total_cost / 10).toLocaleString()}`,
              },
              {
                label: 'Average Points/Day',
                value: (playerData.average_points_per_day / 10).toFixed(1),
              },
              {
                label: 'Total Games Played',
                value: playerData.total_games,
              },
            ]}
            variant="scoreboard"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="animate-fade-in lg:col-span-2">
              <div className="rounded-lg border bg-card p-6">
                <SectionTitle className="mb-4 md:text-2xl">
                  Daily Scoring Trend
                </SectionTitle>
                <DailyScorersChart
                  data={playerData.daily_starters}
                  events={metadata.events}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-full rounded-lg border bg-card p-6">
                <SectionTitle className="mb-4 md:text-2xl">
                  Points Distribution
                </SectionTitle>
                <div className="h-[400px] w-full">
                  <ChartContainer
                    className="min-h-[400px] w-full"
                    config={
                      {
                        'Back Court': {
                          label: 'Back Court',
                          color: 'var(--chart-1)',
                        },
                        'Front Court': {
                          label: 'Front Court',
                          color: 'var(--chart-2)',
                        },
                      } satisfies ChartConfig
                    }
                  >
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={positionDistributionData}
                        dataKey="value"
                        label={({ value }) =>
                          typeof value === 'number'
                            ? `${value.toFixed(1)} pts`
                            : ''
                        }
                        nameKey="position"
                        // outerRadius={150}
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="position" />}
                      />
                      {/* {positionDistributionData.map((entry, index) => (
                          <Cell
                            fill={COLORS[index % COLORS.length]}
                            key={`cell-${index}`}
                          />
                        ))}
                      </Pie> */}
                    </PieChart>
                  </ChartContainer>
                </div>
                {/* <div className="space-y-4">
                  {Object.entries(
                    playerData.squad.reduce(
                      (acc, player) => ({
                        ...acc,
                        [player.position]: (acc[player.position] || 0) + 1,
                      }),
                      {} as Record<string, number>,
                    ),
                  ).map(([position, count]) => (
                    <div
                      key={position}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{position}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} players
                      </span>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          </div>

          <section className="animate-fade-in">
            <SectionTitle className="mb-4">Transfers</SectionTitle>
            <TransferSummary
              data={playerData.transfers}
              events={metadata.events}
            />
          </section>

          <div className="animate-fade-in rounded-lg border bg-card p-6">
            <SectionTitle className="mb-4 md:text-2xl">
              Selected Players
            </SectionTitle>
            <PlayerTable players={playerData.squad} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

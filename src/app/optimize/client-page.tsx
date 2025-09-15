'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAtom } from 'jotai'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { DailyScorersChart } from '@/components/DailyScorersChart'
import { PlayerSelection } from '@/components/PlayerSelection'
import { PlayerTable } from '@/components/PlayerTable'
import { StatCard } from '@/components/StatCard'
import { TextLoader } from '@/components/TextLoader'
import { TransferSummary } from '@/components/TransferSummary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  IOptimizedTeam,
  IPhase,
  Position,
  optimizeTeam,
  useMetadata,
  useMyTeam,
} from '@/hooks/api'
import { getQueryClient } from '@/lib/get-query-client'
import { teamIdAtom } from '@/store'

export default function Optimize() {
  const [selectedPhase, setSelectedPhase] = useState<IPhase | undefined>()
  const [pointsColumn, setPointsColumn] = useState<string>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [playerData, setPlayerData] = useState<IOptimizedTeam>()
  const [showPlayerSelection, setShowPlayerSelection] = useState(false)
  const [includedPlayers, setIncludedPlayers] = useState<number[]>([])
  const [excludedPlayers, setExcludedPlayers] = useState<number[]>([])
  const [selectionMode, setSelectionMode] = useState<'include' | 'exclude'>(
    'include',
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: metadata } = useMetadata()

  const currentEventIndex =
    metadata?.events?.findIndex((event) => event.is_next) ?? -1
  const currentEvent =
    currentEventIndex > -1 && metadata?.events
      ? metadata.events[currentEventIndex]
      : undefined

  // Find the current phase based on the current event
  // Skip the first phase (id=1) which is an "Overall" phase covering all events
  const currentPhaseIndex =
    currentEvent && metadata?.phases
      ? metadata.phases.findIndex(
          (phase) =>
            phase.id !== 1 && // Exclude the "Overall" phase
            currentEvent.id >= phase.start_event &&
            currentEvent.id <= phase.stop_event,
        )
      : -1

  // Get only the current and next phase
  const phaseOptions =
    currentPhaseIndex > -1 && metadata?.phases
      ? metadata.phases.slice(
          currentPhaseIndex,
          Math.min(currentPhaseIndex + 2, metadata.phases.length),
        )
      : []

  useEffect(() => {
    if (!selectedPhase && phaseOptions && phaseOptions.length > 0) {
      setSelectedPhase(phaseOptions[0])
    }
  }, [selectedPhase, phaseOptions])

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
      {} as Record<
        string,
        { position: string; value: number; players: number }
      >,
    ) ?? {}
  const positionDistributionData = Object.values(courtPositionData)

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  const [teamId] = useAtom(teamIdAtom)

  const { data: myTeam } = useMyTeam(teamId)

  console.log('myTeam :>> ', myTeam)

  const queryClient = getQueryClient()
  const fetchOptimizedTeam = useCallback(async () => {
    if (!selectedPhase || !metadata?.events) return

    setIsLoading(true)
    // Get all event IDs within the selected phase
    const gamedays = metadata.events
      .filter(
        (event) =>
          event.id >= selectedPhase.start_event &&
          event.id <= selectedPhase.stop_event,
      )
      .map((event) => event.id)

    // Prepare query parameters
    const queryParams: any = {
      gamedays,
      points_column: pointsColumn,
      picks: myTeam?.picks || [],
      transfers: myTeam?.transfers,
    }
    console.log('queryParams :>> ', queryParams)

    // Only include force_include if there are players to include
    if (includedPlayers.length > 0) {
      queryParams.force_include = includedPlayers
    }

    // Only include force_exclude if there are players to exclude
    if (excludedPlayers.length > 0) {
      queryParams.force_exclude = excludedPlayers
    }

    try {
      const data = await queryClient.fetchQuery({
        queryKey: [
          'optimize',
          gamedays,
          pointsColumn,
          myTeam?.picks,
          myTeam?.transfers,
          includedPlayers.length > 0 ? includedPlayers : null,
          excludedPlayers.length > 0 ? excludedPlayers : null,
        ],
        queryFn: () => optimizeTeam(queryParams),
      })
      setPlayerData(data)
    } catch (error) {
      console.log('error :>> ', error)
    }
    setIsLoading(false)
  }, [
    selectedPhase,
    metadata?.events,
    pointsColumn,
    myTeam,
    queryClient,
    includedPlayers,
    excludedPlayers,
  ])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Optimal Team
        </h2>
        <p className="text-xl text-muted-foreground">
          See the optimal team calculated based on player form or points per
          game, up to 3 Gameweeks into the future. This is ideal for planning
          your Wildcard chip.
        </p>
      </div>

      <div>
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
          Select how you want to calculate the optimal team.
        </h4>
        <p className="text-muted-foreground text-sm mb-4">
          Choose the starting Gameweek, how many Gameweeks to calculate for, and
          whether you want to calculate based on points per game from the last
          30 games (form) or from the whole season.
        </p>
        <div className="flex max-sm:flex-col gap-4 md:items-end flex-wrap">
          <div>
            <Label>Select Gameweek</Label>
            <Select
              value={selectedPhase?.id.toString()}
              onValueChange={(value) => {
                const phase = phaseOptions?.find(
                  (p) => p.id.toString() === value,
                )
                setSelectedPhase(phase)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Gameweek" />
              </SelectTrigger>
              <SelectContent>
                {phaseOptions && phaseOptions.length > 0 && (
                  <>
                    {phaseOptions[0] && (
                      <SelectItem
                        key={phaseOptions[0].id}
                        value={phaseOptions[0].id.toString()}
                      >
                        {phaseOptions[0].name} (Current)
                      </SelectItem>
                    )}
                    {phaseOptions.length > 1 && phaseOptions[1] && (
                      <SelectItem
                        key={phaseOptions[1].id}
                        value={phaseOptions[1].id.toString()}
                      >
                        {phaseOptions[1].name} (Next)
                      </SelectItem>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Points Column</Label>
            <Select
              value={pointsColumn}
              onValueChange={(value) => setPointsColumn(value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">form</SelectItem>
                <SelectItem value="points_per_game">points per game</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Force Include Players */}
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

          {/* Force Exclude Players */}
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
            <Button onClick={fetchOptimizedTeam} className="mr-2">
              Optimize Team
            </Button>
          </div>
        </div>
      </div>
      {isLoading && (
        <TextLoader
          messages={[
            'Fetching data to calculate the optimal team',
            'Getting the fixtures you selected',
            'Computing the optimal team',
          ]}
          interval={3000}
        />
      )}
      {playerData && metadata ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Points"
              value={
                playerData.points.transfer_penalty > 0
                  ? `${(playerData.points.adjusted_points / 10).toLocaleString()} (-${(playerData.points.transfer_penalty / 10).toLocaleString()})`
                  : (playerData.points.adjusted_points / 10).toLocaleString()
              }
              valueClassName="text-chart-2"
            />
            <StatCard
              title="Total Cost"
              value={`$${(playerData.total_cost / 10).toLocaleString()}`}
            />
            <StatCard
              title="Average Points/Day"
              value={(playerData.average_points_per_day / 10).toFixed(1)}
              valueClassName="text-chart-2"
            />
            <StatCard
              title="Total Games Played"
              value={playerData.total_games}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-medium mb-4">
                  Daily Scoring Trend
                </h3>
                <DailyScorersChart
                  data={playerData.daily_starters}
                  events={metadata.events}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-card p-6 h-full">
                <h3 className="text-lg font-medium mb-4">
                  Points Distribution
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={positionDistributionData}
                        dataKey="value"
                        nameKey="position"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label={({ position, value }) => value.toFixed(1)}
                      >
                        {positionDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => (value as number).toFixed(1)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Transfers</h3>
            <TransferSummary
              data={{
                transfers_by_event: playerData.transfers_by_event,
                transfer_summary: playerData.transfer_summary,
              }}
              events={metadata.events}
            />
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Selected Players</h3>
            <PlayerTable players={playerData.squad} />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

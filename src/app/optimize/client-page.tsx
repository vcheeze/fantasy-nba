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
import { PlayerTable } from '@/components/PlayerTable'
import { StatCard } from '@/components/StatCard'
import { TextLoader } from '@/components/TextLoader'
import { TransferSummary } from '@/components/TransferSummary'
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
  IOptimizedTeam,
  Position,
  optimizeTeam,
  useMetadata,
  useMyTeam,
} from '@/hooks/api'
import { getQueryClient } from '@/lib/get-query-client'
import { teamIdAtom } from '@/store'

export default function Optimize() {
  const [startGameday, setStartGameday] = useState<number>()
  const [stopGameday, setStopGameday] = useState<number>()
  const [pointsColumn, setPointsColumn] = useState<string>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [playerData, setPlayerData] = useState<IOptimizedTeam>()

  const { data: metadata } = useMetadata()

  const currentEventIndex = metadata?.events.findIndex((event) => event.is_next)
  const MAX_PERIOD = 14 // 14 Gamedays
  const eventOptions =
    metadata?.events && currentEventIndex && currentEventIndex > -1
      ? metadata.events.slice(currentEventIndex, currentEventIndex + MAX_PERIOD)
      : []

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
    if (!startGameday || !stopGameday) return

    setIsLoading(true)
    const gamedays = Array.from(
      { length: stopGameday - startGameday + 1 },
      (_, i) => i + startGameday,
    )
    try {
      const data = await queryClient.fetchQuery({
        queryKey: [
          'optimize',
          gamedays,
          pointsColumn,
          myTeam?.picks,
          myTeam?.transfers,
        ],
        queryFn: () =>
          optimizeTeam(
            gamedays,
            pointsColumn,
            myTeam?.picks || [],
            myTeam?.transfers,
          ),
      })
      setPlayerData(data)
    } catch (error) {
      console.log('error :>> ', error)
    }
    setIsLoading(false)
  }, [startGameday, stopGameday, myTeam])

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
            <Label>Starting Gameweek</Label>
            <Select
              value={startGameday?.toString()}
              onValueChange={(value) => setStartGameday(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gameweek" />
              </SelectTrigger>
              <SelectContent>
                {eventOptions.map((eo) => (
                  <SelectItem key={eo.id} value={eo.id.toString()}>
                    {eo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ending Gameweek</Label>
            <Select
              value={stopGameday?.toString()}
              onValueChange={(value) => setStopGameday(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gameweek" />
              </SelectTrigger>
              <SelectContent>
                {eventOptions.map((eo) => (
                  <SelectItem key={eo.id} value={eo.id.toString()}>
                    {eo.name}
                  </SelectItem>
                ))}
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
          <Button onClick={fetchOptimizedTeam}>Optimize Team</Button>
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

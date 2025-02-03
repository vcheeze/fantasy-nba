'use client'

import { useEffect, useState } from 'react'

import { DailyScorersChart } from '@/components/DailyScorersChart'
import { PlayerTable } from '@/components/PlayerTable'
import { StatCard } from '@/components/StatCard'
import { TextLoader } from '@/components/TextLoader'
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
  optimizeTeam,
  useCurrentGameweek,
  useMetadata,
} from '@/hooks/api'
import { getQueryClient } from '@/lib/get-query-client'

export default function Optimize() {
  const [activePhase, setActivePhase] = useState<number>()
  const [numberOfGameweeks, setNumberOfGameweeks] = useState<number>(1)
  const [pointsColumn, setPointsColumn] = useState<string>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [playerData, setPlayerData] = useState<IOptimizedTeam>()

  const { data: metadata } = useMetadata()
  const { data: currentGameweek } = useCurrentGameweek()

  useEffect(() => {
    if (currentGameweek && metadata?.phases) {
      const currentPhase = metadata?.phases
        .slice(1)
        .find(
          (phase) =>
            currentGameweek >= phase.start_event &&
            currentGameweek <= phase.stop_event,
        )?.id
      if (currentPhase) {
        setActivePhase(currentPhase)
      }
    }
  }, [currentGameweek, metadata?.phases])

  const queryClient = getQueryClient()
  const fetchOptimizedTeam = async () => {
    if (!activePhase) return

    setIsLoading(true)
    const phases = Array.from(
      { length: numberOfGameweeks },
      (_, i) => activePhase + 1 + i,
    )
    const data = await queryClient.fetchQuery({
      queryKey: ['optimize', pointsColumn],
      queryFn: () => optimizeTeam(phases, pointsColumn),
    })
    setPlayerData(data)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Optimal Team
        </h2>
        <p className="text-xl text-muted-foreground">
          See the optimal team calculated based on player form or points per
          game, up to 3 Gameweeks into the future.
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
            <Label>
              Next <em>n</em> Gameweeks
            </Label>
            <Select
              value={numberOfGameweeks?.toString()}
              onValueChange={(value) => setNumberOfGameweeks(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Gameweek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Select points column</Label>
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
              value={(playerData.total_points / 10).toLocaleString()}
              valueClassName="text-emerald-600"
            />
            <StatCard
              title="Total Cost"
              value={`$${(playerData.total_cost / 10).toLocaleString()}`}
              valueClassName="text-slate-600"
            />
            <StatCard
              title="Average Points/Day"
              value={(playerData.average_points_per_day / 10).toFixed(1)}
              valueClassName="text-emerald-600"
            />
            <StatCard
              title="Scoring Days"
              value={playerData.scoring_days}
              valueClassName="text-slate-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-medium mb-4">
                  Daily Scoring Trend
                </h3>
                <DailyScorersChart
                  data={playerData.daily_scorers}
                  events={metadata.events}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-card p-6 h-full">
                <h3 className="text-lg font-medium mb-4">
                  Position Distribution
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    playerData.selected_players.reduce(
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
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Selected Players</h3>
            <PlayerTable players={playerData.selected_players} />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

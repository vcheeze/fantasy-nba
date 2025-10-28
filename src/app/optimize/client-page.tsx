"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { DailyScorersChart } from "@/components/DailyScorersChart";
import { PlayerTable } from "@/components/PlayerTable";
import { StatCard } from "@/components/StatCard";
import { TextLoader } from "@/components/TextLoader";
import { TransferSummary } from "@/components/TransferSummary";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type IOptimizedTeam,
  optimizeTeam,
  Position,
  useMetadata,
  useMyTeam,
} from "@/hooks/api";
import { getQueryClient } from "@/lib/get-query-client";
import { teamIdAtom } from "@/store";

export default function Optimize() {
  const [startGameday, setStartGameday] = useState<number>();
  const [stopGameday, setStopGameday] = useState<number>();
  const [pointsColumn, setPointsColumn] = useState<string>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState<IOptimizedTeam>();
  // const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  // const [includedPlayers, setIncludedPlayers] = useState<number[]>([]);
  // const [excludedPlayers, setExcludedPlayers] = useState<number[]>([]);
  // const [selectionMode, setSelectionMode] = useState<"include" | "exclude">(
  //   "include"
  // );
  // const [sheetOpen, setSheetOpen] = useState(false);

  const { data: metadata } = useMetadata();

  const [currentEventIndex, eventOptions] = useMemo(() => {
    // Early return if no metadata
    if (!(metadata?.events && metadata?.phases)) {
      return { currentEventIndex: -1, eventOptions: undefined };
    }

    // Find current event
    const currentGamedayIndex = metadata.events.findIndex(
      (event) => event.is_next
    );
    if (currentGamedayIndex === -1) {
      return { currentGamedayIndex: -1, eventOptions: undefined };
    }

    const currentEvent = metadata.events[currentGamedayIndex];

    // Find current phase (skip phase id=1 which is "Overall")
    const currentPhaseIndex = metadata.phases.findIndex(
      (phase) =>
        phase.id !== 1 &&
        currentEvent.id >= phase.start_event &&
        currentEvent.id <= phase.stop_event
    );

    // Determine slice end point
    let endIndex = metadata.events.length;
    const nextPhase = metadata.phases[currentPhaseIndex + 1];

    if (nextPhase) {
      const nextPhaseEndIndex = metadata.events.findIndex(
        (event) => event.id === nextPhase.stop_event
      );
      if (nextPhaseEndIndex > -1) {
        endIndex = nextPhaseEndIndex + 1;
      }
    }

    const options = metadata.events.slice(currentGamedayIndex, endIndex);

    return [currentGamedayIndex, options];
  }, [metadata]);

  useEffect(() => {
    if (!startGameday && currentEventIndex && currentEventIndex > -1) {
      setStartGameday(metadata?.events[currentEventIndex].id);
    }
  }, [startGameday, currentEventIndex, metadata?.events]);

  // Calculate court position distribution data
  const courtPositionData =
    playerData?.squad.reduce(
      (acc, player) => {
        const position = player.position;
        if (!acc[position]) {
          acc[position] = {
            position:
              position === Position.BACK_COURT ? "Back Court" : "Front Court",
            value: 0,
            players: 0,
          };
        }
        acc[position].value += player.points / 10;
        acc[position].players += 1;
        return acc;
      },
      {} as Record<string, { position: string; value: number; players: number }>
    ) ?? {};
  const positionDistributionData = Object.values(courtPositionData);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const [teamId] = useAtom(teamIdAtom);
  const { data: myTeam } = useMyTeam(teamId);

  const queryClient = getQueryClient();
  const fetchOptimizedTeam = useCallback(async () => {
    if (!(startGameday && stopGameday)) {
      return;
    }

    setIsLoading(true);
    // Get all event IDs
    const gamedays = Array.from(
      { length: stopGameday - startGameday + 1 },
      (_, i) => i + startGameday
    );

    // Prepare query parameters
    const queryParams = {
      gamedays,
      points_column: pointsColumn,
      picks: myTeam?.picks || [],
      transfers: myTeam?.transfers,
    };

    // Only include force_include if there are players to include
    // if (includedPlayers.length > 0) {
    //   queryParams.force_include = includedPlayers
    // }

    // Only include force_exclude if there are players to exclude
    // if (excludedPlayers.length > 0) {
    //   queryParams.force_exclude = excludedPlayers
    // }

    try {
      const data = await queryClient.fetchQuery({
        queryKey: [
          "optimize",
          gamedays,
          pointsColumn,
          myTeam?.picks,
          myTeam?.transfers,
          // includedPlayers.length > 0 ? includedPlayers : null,
          // excludedPlayers.length > 0 ? excludedPlayers : null,
        ],
        queryFn: () => optimizeTeam(queryParams),
      });
      setPlayerData(data);
    } catch (error) {
      console.log("error :>> ", error);
    }
    setIsLoading(false);
  }, [
    startGameday,
    stopGameday,
    pointsColumn,
    myTeam,
    queryClient,
    // includedPlayers,
    // excludedPlayers,
  ]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h2 className="scroll-m-20 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
          Optimal Team
        </h2>
        <p className="text-muted-foreground text-xl">
          See the optimal team calculated based on player form or points per
          game, up to one Gameweeks into the future.
        </p>
      </div>

      <div>
        <h4 className="mb-2 scroll-m-20 font-semibold text-xl tracking-tight">
          Select how you want to calculate the optimal team.
        </h4>
        <p className="mb-4 text-muted-foreground text-sm">
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
                <SelectValue placeholder="form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">form</SelectItem>
                <SelectItem value="points_per_game">points per game</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button className="mr-2" onClick={fetchOptimizedTeam}>
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
      </div>
      {isLoading && (
        <TextLoader
          interval={3000}
          messages={[
            "Fetching data to calculate the optimal team",
            "Getting the fixtures you selected",
            "Computing the optimal team",
          ]}
        />
      )}
      {playerData && metadata ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Points"
              value={
                playerData.transfers.cost > 0
                  ? `${(playerData.true_gameweek_score / 10).toLocaleString()} (-${(playerData.transfers.cost / 10).toLocaleString()})`
                  : (playerData.true_gameweek_score / 10).toLocaleString()
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
                <h3 className="mb-4 font-medium text-lg">
                  Daily Scoring Trend
                </h3>
                <DailyScorersChart
                  data={playerData.daily_starters}
                  events={metadata.events}
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-full rounded-lg border bg-card p-6">
                <h3 className="mb-4 font-medium text-lg">
                  Points Distribution
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={positionDistributionData}
                        dataKey="value"
                        label={({ position, value }) => value.toFixed(1)}
                        nameKey="position"
                        outerRadius={150}
                      >
                        {positionDistributionData.map((entry, index) => (
                          <Cell
                            fill={COLORS[index % COLORS.length]}
                            key={`cell-${index}`}
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
            <h3 className="mb-4 font-medium text-lg">Transfers</h3>
            <TransferSummary
              data={playerData.transfers}
              events={metadata.events}
            />
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-medium text-lg">Selected Players</h3>
            <PlayerTable players={playerData.squad} />
          </div>
        </>
      ) : null}
    </div>
  );
}

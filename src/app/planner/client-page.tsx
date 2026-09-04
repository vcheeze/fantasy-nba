'use client'

import { useAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useElementsSummary, useMetadata, useMyTeam } from '@/hooks/api'
import { teamIdAtom } from '@/store'

export default function Planner() {
  const [teamId] = useAtom(teamIdAtom)
  const { data: metadata, isLoading: isMetaLoading } = useMetadata()
  const { data: myTeam, isLoading: isMyTeamLoading } = useMyTeam(teamId)

  const playerIds = useMemo(
    () => myTeam?.picks?.map((p: any) => p.element) ?? [],
    [myTeam]
  )

  const { map: summariesMap } = useElementsSummary(playerIds)

  // startersByEvent: { [eventId]: number[] }
  const [startersByEvent, setStartersByEvent] = useState<
    Record<number, number[]>
  >({})

  // navigation: which event index are we viewing (single-day view)
  const defaultEventIndex = useMemo(() => {
    if (!metadata?.events) return 0
    const idx = metadata.events.findIndex((e: any) => e.is_current)
    return idx >= 0 ? idx : 0
  }, [metadata?.events])

  const [currentEventIndex, setCurrentEventIndex] =
    useState<number>(defaultEventIndex)

  useEffect(() => {
    setCurrentEventIndex(defaultEventIndex)
  }, [defaultEventIndex])

  // load persisted starters from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('planner.starters')
      if (raw) {
        setStartersByEvent(JSON.parse(raw))
      }
    } catch {
      // ignore
    }
  }, [])

  // persist changes
  useEffect(() => {
    try {
      localStorage.setItem('planner.starters', JSON.stringify(startersByEvent))
    } catch {
      // ignore
    }
  }, [startersByEvent])

  const pickInfo = useMemo(() => {
    const map: Record<number, any> = {}
    if (!metadata?.elements) return map
    for (const p of myTeam?.picks ?? []) {
      const el = metadata.elements.find((e: any) => e.id === p.element)
      map[p.element] = { pick: p, element: el }
    }
    return map
  }, [metadata?.elements, myTeam?.picks])

  const events = metadata?.events ?? []

  const playersForEvent = (eventId: number) => {
    const players: {
      id: number
      name: string
      hasFixture: boolean
      fixture?: any
    }[] = []
    for (const pid of playerIds) {
      const summary = summariesMap[pid]
      const fixtures: any[] = summary?.data?.fixtures ?? []
      const match = fixtures.find((f: any) => f.event === eventId)
      const name =
        pickInfo[pid]?.element?.web_name ??
        pickInfo[pid]?.element?.first_name ??
        `#${pid}`
      players.push({ id: pid, name, hasFixture: !!match, fixture: match })
    }
    // sort: players with fixture first
    players.sort((a, b) => Number(b.hasFixture) - Number(a.hasFixture))
    return players
  }

  const MAX_STARTERS = 5

  const toggleStarter = (eventId: number, playerId: number) => {
    setStartersByEvent((prev) => {
      const cur = new Set(prev[eventId] ?? [])
      if (cur.has(playerId)) {
        cur.delete(playerId)
      } else {
        if (cur.size >= MAX_STARTERS) return prev // ignore if already max
        cur.add(playerId)
      }
      return { ...prev, [eventId]: Array.from(cur) }
    })
  }

  if (isMetaLoading || isMyTeamLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="scroll-m-20 font-semibold text-3xl tracking-tight">
          Planner
        </h2>
        <div>
          Team ID: <strong>{teamId || 'not set'}</strong>
        </div>
      </div>

      {/* Single-day view with prev/next navigation */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <Button
            disabled={currentEventIndex <= 0}
            onClick={() => setCurrentEventIndex((i) => Math.max(0, i - 1))}
            variant="outline"
          >
            Prev
          </Button>
          <div className="font-medium">
            {events[currentEventIndex]?.name ?? 'No event'}
          </div>
          <Button
            disabled={currentEventIndex >= events.length - 1}
            onClick={() =>
              setCurrentEventIndex((i) => Math.min(events.length - 1, i + 1))
            }
            variant="outline"
          >
            Next
          </Button>
        </div>

        {events[currentEventIndex] ? (
          (() => {
            const ev = events[currentEventIndex]
            const players = playersForEvent(ev.id)
            const starters = startersByEvent[ev.id] ?? []
            return (
              <Card>
                <CardHeader>
                  <CardTitle>{ev.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <strong>Selected starters:</strong> {starters.length} /{' '}
                      {MAX_STARTERS}
                    </div>
                    <div>
                      <Button
                        onClick={() =>
                          setStartersByEvent((s) => ({ ...s, [ev.id]: [] }))
                        }
                        size="sm"
                        variant="outline"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {players.length === 0 ? (
                    <div>No players in your team.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {players.map((p) => {
                        const isStarter = (
                          startersByEvent[ev.id] ?? []
                        ).includes(p.id)
                        return (
                          <div
                            className="flex items-center justify-between rounded border p-2"
                            key={p.id}
                          >
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {p.hasFixture ? (
                                  (() => {
                                    const match = p.fixture
                                    const playerTeamId = pickInfo[p.id]?.element?.team
                                    const teamA = match?.team_a ?? match?.team_a_id
                                    const teamH = match?.team_h ?? match?.team_h_id
                                    let opponentId: number | undefined
                                    let ha = ''
                                    if (playerTeamId && teamA != null && teamH != null) {
                                      opponentId = teamA === playerTeamId ? teamH : teamA
                                      ha = teamH === playerTeamId ? 'H' : 'A'
                                    }
                                    const opponent = metadata?.teams?.find(
                                      (t: any) => t.id === opponentId,
                                    )
                                    const opponentLabel = opponent?.short_name ?? opponent?.name ?? (opponentId ?? '')
                                    return `Fixture: ${opponentLabel} ${ha}`
                                  })()
                                ) : (
                                  'No fixture'
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="inline-flex items-center">
                                <input
                                  checked={isStarter}
                                  disabled={
                                    !isStarter &&
                                    (startersByEvent[ev.id] ?? []).length >=
                                      MAX_STARTERS
                                  }
                                  onChange={() => toggleStarter(ev.id, p.id)}
                                  type="checkbox"
                                />
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()
        ) : (
          <div>No events available</div>
        )}
      </div>

      {/* Week view: table view of remaining events (players as rows, events as columns) */}
      <div>
        <h3 className="mb-2 font-semibold">Week view — remaining gameweeks</h3>
        <div className="overflow-auto rounded border">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="bg-muted">
                <th className="sticky left-0 z-10 bg-muted p-2 text-left">
                  Player
                </th>
                {events.slice(currentEventIndex).map((ev: any) => (
                  <th className="p-2 text-center" key={ev.id}>
                    <div className="whitespace-nowrap">{ev.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playerIds.length === 0 ? (
                <tr>
                  <td className="p-2">No players</td>
                </tr>
              ) : (
                playerIds.map((pid: number) => {
                  const name =
                    pickInfo[pid]?.element?.web_name ??
                    pickInfo[pid]?.element?.first_name ??
                    `#${pid}`
                  return (
                    <tr className="border-t" key={pid}>
                      <td className="sticky left-0 z-10 w-52 truncate bg-background p-2">
                        {name}
                      </td>
                      {events.slice(currentEventIndex).map((ev: any) => {
                        const summary = summariesMap[pid]
                        const fixtures: any[] = summary?.data?.fixtures ?? []
                        const match = fixtures.find(
                          (f: any) => f.event === ev.id
                        )
                        return (
                          <td className="p-2 text-center text-sm" key={ev.id}>
                            {match ? (
                              (() => {
                                const playerTeamId = pickInfo[pid]?.element?.team
                                const teamA = match?.team_a ?? match?.team_a_id
                                const teamH = match?.team_h ?? match?.team_h_id
                                let opponentId: number | undefined
                                let ha = ''
                                if (playerTeamId && teamA != null && teamH != null) {
                                  opponentId = teamA === playerTeamId ? teamH : teamA
                                  ha = teamH === playerTeamId ? 'H' : 'A'
                                }
                                const opponent = metadata?.teams?.find(
                                  (t: any) => t.id === opponentId,
                                )
                                const opponentLabel = opponent?.short_name ?? opponent?.name ?? (opponentId ?? '')
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium">{opponentLabel}</span>
                                    <span className="text-muted-foreground text-xs">{ha}</span>
                                  </div>
                                )
                              })()
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

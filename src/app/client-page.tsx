'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { useAtom } from 'jotai'
import { minBy } from 'lodash'
import Link from 'next/link'
import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { CourtDiagram } from '@/components/CourtDiagram'
import GamedayHistory from '@/components/GamedayHistory'
import { StatStrip } from '@/components/StatStrip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useMetadata, useTeamDetails, useTeamHistory } from '@/hooks/api'
import { cn } from '@/lib/utils'
import { teamIdAtom } from '@/store'

const formSchema = z.object({
  teamId: z.coerce.number().min(1),
})

export default function Home() {
  const [teamId, setTeamId] = useAtom(teamIdAtom)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // teamId reads from localStorage after mount; until then it is always ''.
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Open dialog when teamId is not set
  useEffect(() => {
    if (isHydrated) setIsDialogOpen(!teamId)
  }, [isHydrated, teamId])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setTeamId(values.teamId.toString())
    setIsDialogOpen(false)
  }

  const { data, isLoading: isDataLoading } = useMetadata()
  const { data: history, isLoading: isHistoryLoading } = useTeamHistory(teamId)
  const { data: teamDetails, isLoading: isTeamDetailsLoading } =
    useTeamDetails(teamId)

  const gamedayHistory = useMemo(() => {
    if (data?.events && history) {
      return history?.current.map((h: any) => ({
        name:
          data.events
            .find((e: any) => e.id === h.event)
            ?.name.replace('Gameweek ', 'GW')
            .replace(' - ', '.')
            .replace('Day ', '') || '',
        rank: h.overall_rank,
        gamedayRank: h.rank,
        totalPoints: h.total_points / 10,
        gamedayPoints: h.points / 10,
        benchPoints: h.points_on_bench / 10,
        event: h.event,
      }))
    }
    return []
  }, [data?.events, history])
  const latestRank = gamedayHistory.at(-1)?.rank
  const percentile =
    typeof latestRank === 'number' &&
    Number.isFinite(latestRank) &&
    data?.total_players
      ? (latestRank / data.total_players) * 100
      : null
  const bestGameday: any = minBy(
    gamedayHistory.filter((gameday) => Number.isFinite(gameday.rank)),
    'rank'
  )

  // if (isDataLoading || isHistoryLoading || isTeamDetailsLoading) {
  //   return <p>Loading</p>
  // }

  return (
    <>
      <section
        aria-labelledby="home-title"
        className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-12"
      >
        <div className="max-w-xl">
          <span
            aria-hidden="true"
            className="mb-5 block h-1 w-12 animate-rise bg-signal"
          />
          <h1
            className="animate-rise font-display font-extrabold text-[2.6rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl"
            id="home-title"
          >
            Plan every Gameday of your Fantasy NBA team
          </h1>
          <p
            className="mt-5 max-w-[46ch] animate-rise text-lg text-muted-foreground leading-relaxed"
            style={{ '--i': 1 } as CSSProperties}
          >
            Track your rank, find teams with the most games, and build the
            optimal Salary Cap Edition squad.
          </p>
          <div
            className="mt-8 flex animate-rise flex-wrap gap-3"
            style={{ '--i': 2 } as CSSProperties}
          >
            <Button onClick={() => setIsDialogOpen(true)} size="lg">
              {teamId ? 'Edit Team ID' : 'Enter Team ID'}
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link className="group" href="/optimize">
                Optimal Team
                <ArrowRightIcon
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  weight="bold"
                />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[16/10] md:aspect-[4/3]">
          <CourtDiagram className="absolute inset-0 h-full w-full" />
        </div>
      </section>
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-extrabold text-3xl leading-none tracking-tight">
              Edit Team ID
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Enter your team ID. You can find your team ID in the URL of the{' '}
              <strong>Points</strong> tab:{' '}
              <code className="mt-2 block break-all rounded-md bg-muted px-2.5 py-2 font-mono text-foreground text-xs">
                https://nbafantasy.nba.com/entry/
                <span className="font-bold text-signal">YOUR-TEAM-ID-HERE</span>
                /event/1
              </code>
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team ID</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={teamId}
                        placeholder="0"
                        type="number"
                        {...field}
                        className="max-w-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit">Submit</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <section
        aria-labelledby="team-profile-title"
        className={cn('mt-12 md:mt-16', !isHydrated && 'invisible')}
      >
        <h2 className="sr-only" id="team-profile-title">
          Team Profile and Team Ranking
        </h2>
        {teamId ? (
          <StatStrip
            isLoading={
              isTeamDetailsLoading || isHistoryLoading || isDataLoading
            }
            stats={[
              {
                label: 'Team Name',
                value: teamDetails?.name ?? '-',
                detail: teamDetails?.id ? `Team ID ${teamDetails.id}` : null,
              },
              {
                label: 'Current Rank',
                value:
                  typeof latestRank === 'number'
                    ? latestRank.toLocaleString()
                    : '-',
              },
              {
                label: 'Percentile Rank',
                value:
                  percentile == null ? '-' : `Top ${percentile.toFixed(2)} %`,
              },
              {
                label: 'Best Rank',
                value: bestGameday ? bestGameday.rank.toLocaleString() : '-',
                detail: bestGameday ? bestGameday.name : null,
              },
            ]}
            startIndex={3}
            variant="scoreboard"
          />
        ) : (
          <div
            className="relative animate-rise overflow-hidden rounded-md border border-dashed bg-card px-6 py-8 md:px-8"
            style={{ '--i': 3 } as CSSProperties}
          >
            <p className="font-bold font-display text-2xl leading-tight md:text-3xl">
              Your rank and season chart show up here.
            </p>
            <p className="mt-2 max-w-[60ch] text-muted-foreground">
              Add your team ID from the NBA Fantasy Points tab to load your team
              profile, ranking, and Gameday history.
            </p>
          </div>
        )}
      </section>
      {teamId ? (
        <GamedayHistory
          chips={history?.chips.filter((chip) => chip.name !== 'phcapt')} // filter out captaincy chips
          data={gamedayHistory}
        />
      ) : null}
    </>
  )
}

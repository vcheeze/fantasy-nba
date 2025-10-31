'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { minBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import GamedayHistory from '@/components/GamedayHistory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useMetadata, useTeamDetails, useTeamHistory } from '@/hooks/api'
import { teamIdAtom } from '@/store'

const formSchema = z.object({
  teamId: z.coerce.number().min(1),
})

export default function Home() {
  const [teamId, setTeamId] = useAtom(teamIdAtom)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Open dialog when teamId is not set
  useEffect(() => {
    setIsDialogOpen(!teamId)
  }, [teamId])

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
      }))
    }
    return []
  }, [data?.events, history])
  const bestGameday: any = minBy(gamedayHistory, 'rank')

  // if (isDataLoading || isHistoryLoading || isTeamDetailsLoading) {
  //   return <p>Loading</p>
  // }

  return (
    <>
      <div className="mb-4 flex justify-between">
        <h2 className="scroll-m-20 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
          Home
        </h2>
        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
          Edit Team ID
        </Button>
      </div>
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team ID</DialogTitle>
            <DialogDescription>
              Enter your team ID. You can find your team ID in the URL of the{' '}
              <strong>Points</strong> tab: https://nbafantasy.nba.com/entry/
              <span className="text-primary dark:text-accent">
                <strong>YOUR-TEAM-ID-HERE</strong>
              </span>
              /event/1
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
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Team Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isTeamDetailsLoading ? (
              <>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[250px]" />
              </>
            ) : (
              <>
                <p>
                  <strong>Team Name</strong>: {teamDetails?.name}
                </p>
                <p>
                  <strong>Team ID</strong>: {teamDetails?.id}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Current Rank</strong>:{' '}
              {gamedayHistory[gamedayHistory.length - 1]?.rank}
            </p>
            <p>
              <strong>Percentile Rank</strong>: Top{' '}
              {(data?.total_players
                ? (gamedayHistory[gamedayHistory.length - 1]?.rank /
                    data.total_players) *
                  100
                : 100
              ).toFixed(2)}{' '}
              %
            </p>
            <p>
              <strong>Best Rank</strong>: {bestGameday?.rank} (
              {bestGameday?.name})
            </p>
          </CardContent>
        </Card>
      </div>
      <GamedayHistory data={gamedayHistory} />
    </>
  )
}

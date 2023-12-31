"use client"

import { useMemo } from "react"

import { redirect } from "next/navigation"

import { Box, Card, Heading, Strong, Text } from "@radix-ui/themes"
import { getCookie } from "cookies-next"
import { minBy } from "lodash"
import useSWR from "swr"

import GamedayHistory from "@/components/GamedayHistory"

// async function getData(teamId: string) {
//   const urls = [
//     "https://nbafantasy.nba.com/api/bootstrap-static",
//     `https://nbafantasy.nba.com/api/entry/${teamId}/history`,
//     `https://nbafantasy.nba.com/api/entry/${teamId}`,
//   ]
//   const data = await Promise.all(
//     urls.map(async (url) => {
//       const res = await fetch(url)
//       return res.json()
//     }),
//   )

//   return data
// }

export default function Home() {
  const teamId = getCookie("teamId")
  if (!teamId) {
    redirect("/team-id")
  }
  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data, isLoading: isDataLoading } = useSWR("/api/data", fetcher)
  const { data: history, isLoading: isHistoryLoading } = useSWR(
    `/api/history?teamId=${teamId}`,
    fetcher,
  )
  const { data: teamDetails, isLoading: isTeamDetailsLoading } = useSWR(
    `/api/teamDetails?teamId=${teamId}`,
    fetcher,
  )
  // const [data, history, teamDetails] = await getData("4878")

  const gamedayHistory = useMemo(() => {
    if (history) {
      return history?.current.map((h: any) => {
        return {
          name:
            data.events
              .find((e: any) => e.id === h.event)
              ?.name.replace("Gameweek ", "GW")
              .replace(" - ", ".")
              .replace("Day ", "") || "",
          rank: h.overall_rank,
          gamedayRank: h.rank,
          totalPoints: h.total_points / 10,
          gamedayPoints: h.points / 10,
          benchPoints: h.points_on_bench / 10,
        }
      })
    } else return []
  }, [data?.events, history])
  const bestGameday: any = minBy(gamedayHistory, "rank")

  // const teamId = localStorage.getItem("teamId")
  if (isDataLoading || isHistoryLoading || isTeamDetailsLoading) {
    return <Text>Loading</Text>
  }

  return (
    <Box p="9">
      <Heading mb="8" size="8">
        Fantasy NBA
      </Heading>
      <Box my="4">
        <Card>
          <Heading mb="2">Team Profile</Heading>
          <Box>
            <Text>
              <Strong>Team Name</Strong>: {teamDetails?.name}
            </Text>
          </Box>
          <Box>
            <Text>
              <Strong>Team ID</Strong>: {teamDetails?.id}
            </Text>
          </Box>
        </Card>
      </Box>
      <Box>
        <Text>
          <Strong>Current Rank</Strong>:{" "}
          {gamedayHistory[gamedayHistory.length - 1]?.rank}
        </Text>
      </Box>
      <Box>
        <Text>
          <Strong>Percentile Rank</Strong>: Top{" "}
          {(
            (gamedayHistory[gamedayHistory.length - 1]?.rank /
              data?.total_players) *
            100
          ).toFixed(2)}{" "}
          %
        </Text>
      </Box>
      <Box>
        <Text>
          <Strong>Best Rank</Strong>: {bestGameday?.rank} ({bestGameday?.name})
        </Text>
      </Box>
      <GamedayHistory data={gamedayHistory} />
    </Box>
  )
}

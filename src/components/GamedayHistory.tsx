"use client"

import { useState } from "react"

import { Box, Card, Flex, RadioGroup, Text } from "@radix-ui/themes"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

type GamedayHistoryProps = {
  data: any
}

export default function GamedayHistory({ data }: GamedayHistoryProps) {
  const [dataKey, setDataKey] = useState("rank")
  return (
    <Box my="4">
      <Card>
        <Flex gap="4">
          <RadioGroup.Root
            value={dataKey}
            onValueChange={(value) => setDataKey(value)}
          >
            <Flex gap="2" direction="column">
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="rank" /> Overall Rank
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="gamedayRank" /> Gameday Rank
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="totalPoints" /> Total Points
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="gamedayPoints" /> Gameday Points
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="benchPoints" /> Bench Points
                </Flex>
              </Text>
            </Flex>
          </RadioGroup.Root>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
            <Tooltip />
          </LineChart>
        </Flex>
      </Card>
    </Box>
  )
}

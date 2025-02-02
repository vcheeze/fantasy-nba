'use client'

import { useState } from 'react'

import { meanBy } from 'lodash'
import {
  CartesianGrid,
  Line,
  LineChart, // ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type GamedayHistoryProps = {
  data: any
}

export default function GamedayHistory({ data }: GamedayHistoryProps) {
  const [dataKey, setDataKey] = useState('rank')

  return (
    <div className="my-4">
      <Card>
        <CardHeader>
          <CardTitle>Season Overview</CardTitle>
          <Select value={dataKey} onValueChange={(value) => setDataKey(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Overall Rank</SelectItem>
              <SelectItem value="gamedayRank">Gameday Rank</SelectItem>
              <SelectItem value="totalPoints">Total Points</SelectItem>
              <SelectItem value="gamedayPoints">Gameday Points</SelectItem>
              <SelectItem value="benchPoints">Bench Points</SelectItem>
            </SelectContent>
          </Select>
          <CardDescription>
            {dataKey === 'gamedayRank' &&
              `Average Gameday rank: ${meanBy(data, 'gamedayRank').toFixed(2)}`}
            {dataKey === 'gamedayPoints' &&
              `Average Gameday points: ${meanBy(data, 'gamedayPoints').toFixed(2)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer height={400} width="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="name" />
              <YAxis
                scale={dataKey === 'rank' ? 'log' : 'auto'}
                domain={['auto', 'auto']}
              />
              {/* <ReferenceLine
              y={meanBy(data, dataKey)}
              label={{
                value: `Average: ${meanBy(data, dataKey).toFixed(2)}`,
                position: "left",
              }}
              stroke="yellow"
              strokeDasharray="4 4"
            /> */}
              <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

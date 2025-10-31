'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type IElement, useMetadata } from '@/hooks/api'

interface PlayerSelectionProps {
  onPlayerSelect?: (player: IElement) => void
}

// Team abbreviations mapping
const teamAbbreviations: Record<string, string> = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS',
}

// Position mapping
const positionMapping: Record<number, string> = {
  1: 'FRONT COURT',
  2: 'BACK COURT',
}

export function PlayerSelection({ onPlayerSelect }: PlayerSelectionProps) {
  const { data: metadata, isLoading } = useMetadata()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewFilter, setViewFilter] = useState('all')
  const [sortBy, setSortBy] = useState('salary')
  const [maxCost, setMaxCost] = useState<number | undefined>(undefined)
  const [filteredPlayers, setFilteredPlayers] = useState<IElement[]>([])

  // Set default max cost once metadata is loaded
  useEffect(() => {
    if (metadata?.elements && metadata.elements.length > 0) {
      // Find the highest cost player
      const highestCost = Math.max(
        ...metadata.elements.map((player) => player.element_type)
      )
      setMaxCost(highestCost)
    }
  }, [metadata?.elements])

  // Filter and sort players
  useEffect(() => {
    if (!metadata?.elements) return

    let players = [...metadata.elements]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      players = players.filter(
        (player) =>
          player.first_name.toLowerCase().includes(term) ||
          player.second_name.toLowerCase().includes(term)
      )
    }

    // Apply view filter
    if (viewFilter !== 'all') {
      const positionId = Object.entries(positionMapping).find(
        ([_, value]) => value === viewFilter
      )?.[0]

      if (positionId) {
        players = players.filter(
          (player) => player.element_type === Number.parseInt(positionId)
        )
      }
    }

    // Apply max cost filter
    if (maxCost) {
      players = players.filter((player) => player.element_type <= maxCost)
    }

    // Apply sorting
    if (sortBy === 'salary') {
      players.sort((a, b) => b.element_type - a.element_type)
    } else if (sortBy === 'name') {
      players.sort((a, b) => {
        const nameA = `${a.first_name} ${a.second_name}`
        const nameB = `${b.first_name} ${b.second_name}`
        return nameA.localeCompare(nameB)
      })
    }

    setFilteredPlayers(players)
  }, [metadata?.elements, searchTerm, viewFilter, sortBy, maxCost])

  // Get team name by team id
  const getTeamName = (teamId: number): string => {
    const team = metadata?.teams.find((t) => t.id === teamId)
    return team ? team.name : ''
  }

  // Get team abbreviation
  const getTeamAbbreviation = (teamId: number): string => {
    const teamName = getTeamName(teamId)
    return teamAbbreviations[teamName] || teamName.substring(0, 3).toUpperCase()
  }

  // Get position name
  const getPositionName = (positionId: number): string =>
    positionMapping[positionId] || 'Unknown'

  // Format player cost for display
  const formatCost = (cost: number): string => cost.toFixed(1)

  if (isLoading) {
    return <div>Loading player data...</div>
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="rounded-t-lg bg-primary p-3 text-primary-foreground">
        <h3 className="font-semibold text-lg">Player Selection</h3>
      </div>

      <div className="space-y-4 p-4">
        {/* View Filter */}
        <div>
          <Label htmlFor="view">View</Label>
          <Select onValueChange={setViewFilter} value={viewFilter}>
            <SelectTrigger className="w-full rounded-none border-yellow-500 border-b-2">
              <SelectValue placeholder="All players" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All players</SelectItem>
              <SelectItem value="FRONT COURT">Front Court</SelectItem>
              <SelectItem value="BACK COURT">Back Court</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label htmlFor="sortBy">Sorted by</Label>
          <Select onValueChange={setSortBy} value={sortBy}>
            <SelectTrigger className="w-full rounded-none border-yellow-500 border-b-2">
              <SelectValue placeholder="Salary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div>
          <Label htmlFor="search">Search player list</Label>
          <div className="relative">
            <Input
              className="w-full rounded-none border-yellow-500 border-b-2 pl-10"
              id="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players..."
              value={searchTerm}
            />
            <div className="-translate-y-1/2 absolute top-1/2 left-3 transform text-yellow-500">
              <MagnifyingGlassIcon size={18} />
            </div>
          </div>
        </div>

        {/* Max Cost */}
        <div>
          <Label htmlFor="maxCost">Max cost</Label>
          <Select
            onValueChange={(value) =>
              setMaxCost(value ? Number.parseFloat(value) : undefined)
            }
            value={maxCost?.toString() || ''}
          >
            <SelectTrigger className="w-full rounded-none border-yellow-500 border-b-2">
              <SelectValue placeholder="Max cost" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => 22 - i).map((cost) => (
                <SelectItem key={cost} value={cost.toString()}>
                  {cost.toFixed(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-center text-muted-foreground text-sm">
          {filteredPlayers.length} players shown
        </div>
      </div>

      {/* Player List */}
      <div className="border-t">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] bg-red-600 font-bold text-white">
          <div className="p-2">FRONT COURT</div>
          <div className="border-white border-l p-2">$</div>
          <div className="border-white border-l p-2">**</div>
        </div>

        {/* Player Rows */}
        <div className="divide-y">
          {filteredPlayers
            .filter((player) => player.element_type === 1) // Front Court
            .slice(0, 10) // Limit to 10 players for performance
            .map((player) => (
              <div
                className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center p-2 hover:bg-gray-100"
                key={player.id}
                onClick={() => onPlayerSelect && onPlayerSelect(player)}
              >
                <div className="mr-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                    i
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {player.first_name} {player.second_name}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-1 text-gray-500">
                      {getTeamAbbreviation(player.team)}
                    </span>
                    <span className="font-medium text-red-600">FC</span>
                  </div>
                </div>
                <div className="px-4">{formatCost(player.element_type)}</div>
                <div className="px-4">{formatCost(player.element_type)}</div>
              </div>
            ))}
        </div>

        {/* Back Court Header */}
        <div className="mt-4 grid grid-cols-[1fr_auto_auto] bg-red-600 font-bold text-white">
          <div className="p-2">BACK COURT</div>
          <div className="border-white border-l p-2">$</div>
          <div className="border-white border-l p-2">**</div>
        </div>

        {/* Back Court Player Rows */}
        <div className="divide-y">
          {filteredPlayers
            .filter((player) => player.element_type === 2) // Back Court
            .slice(0, 10) // Limit to 10 players for performance
            .map((player) => (
              <div
                className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center p-2 hover:bg-gray-100"
                key={player.id}
                onClick={() => onPlayerSelect && onPlayerSelect(player)}
              >
                <div className="mr-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                    i
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {player.first_name} {player.second_name}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-1 text-gray-500">
                      {getTeamAbbreviation(player.team)}
                    </span>
                    <span className="font-medium text-green-600">BC</span>
                  </div>
                </div>
                <div className="px-4">{formatCost(player.element_type)}</div>
                <div className="px-4">{formatCost(player.element_type)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

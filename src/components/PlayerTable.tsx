import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IPlayer, Position } from '@/hooks/api'

interface PlayerTableProps {
  players: IPlayer[]
}

export function PlayerTable({ players }: PlayerTableProps) {
  return (
    <div className="rounded-md border animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="text-right">Points/Game</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.name}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{player.team}</TableCell>
              <TableCell>
                {player.position === Position.BACK_COURT
                  ? 'Back Court'
                  : 'Front Court'}
              </TableCell>
              <TableCell className="text-right">
                {(player.points / 10).toFixed(1)}
              </TableCell>
              <TableCell className="text-right">
                ${(player.cost / 10).toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type IPlayer, Position } from '@/hooks/api'

interface PlayerTableProps {
  players: IPlayer[]
}

function positionLabel(position: Position) {
  return position === Position.BACK_COURT ? 'Back Court' : 'Front Court'
}

export function PlayerTable({ players }: PlayerTableProps) {
  return (
    <>
      <ul className="divide-y overflow-hidden rounded-md border md:hidden">
        {players.map((player) => (
          <li
            className="flex items-start justify-between gap-3 px-3 py-3"
            key={player.id}
          >
            <div className="min-w-0">
              <p className="font-medium leading-snug">{player.name}</p>
              <p className="mt-0.5 text-muted-foreground text-sm">
                {player.team_short || player.team}
                <span aria-hidden="true"> · </span>
                {positionLabel(player.position)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display font-extrabold text-2xl tabular-nums leading-none">
                {(player.points / 10).toFixed(1)}
              </p>
              <p className="mt-1 text-muted-foreground text-sm tabular-nums">
                ${(player.cost / 10).toFixed(1)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden min-w-0 md:block">
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
                className="transition-colors hover:bg-muted/50"
                key={player.id}
              >
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.team}</TableCell>
                <TableCell>{positionLabel(player.position)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(player.points / 10).toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  ${(player.cost / 10).toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

import type { IEvent, IOptimizedTeam } from '@/hooks/api'

export function TransferSummary({
  data,
  events,
}: {
  data: IOptimizedTeam['transfers']
  events: IEvent[]
}) {
  const eventIds = Object.keys(data.by_event).sort(
    (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 rounded-lg border bg-card p-4">
          <h4 className="mb-2 font-medium text-sm">Total Transfers</h4>
          <p className="font-bold text-2xl">{data.total}</p>
        </div>
        <div className="flex-1 rounded-lg border bg-card p-4">
          <h4 className="mb-2 font-medium text-sm">Total Penalty</h4>
          <p className="font-bold text-2xl text-destructive">
            {(data.cost / 10).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {eventIds.map((eventId) => {
          const transfers = data.by_event[eventId]
          if (transfers.in.length === 0) {
            return null
          }

          return (
            <div className="rounded-lg border bg-card p-4" key={eventId}>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">
                  {
                    events.find((event) => event.id.toString() === eventId)
                      ?.name
                  }
                </h4>
                <span className="text-muted-foreground text-sm">
                  {transfers.in.length} transfer
                  {transfers.in.length > 1 ? 's' : ''}
                </span>
              </div>
              {transfers.in.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h5 className="font-medium text-chart-2 text-sm">In</h5>
                  <div className="space-y-1">
                    {transfers.in.map(({ phase, player }) => (
                      <div
                        className="flex items-center justify-between text-sm"
                        key={player.id}
                      >
                        <span>
                          {player.name} ({player.team_short})
                        </span>
                        <span className="text-muted-foreground">
                          ${(player.cost / 10).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {transfers.out.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-destructive text-sm">Out</h5>
                  <div className="space-y-1">
                    {transfers.out.map(({ phase, player }) => (
                      <div
                        className="flex items-center justify-between text-sm"
                        key={player.id}
                      >
                        <span>
                          {player.name} ({player.team_short})
                        </span>
                        <span className="text-muted-foreground">
                          ${(player.cost / 10).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

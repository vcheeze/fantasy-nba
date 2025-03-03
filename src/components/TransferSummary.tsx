import { IEvent, IOptimizedTeam } from '@/hooks/api'

export function TransferSummary({
  data,
  events,
}: {
  data: Pick<IOptimizedTeam, 'transfers_by_event' | 'transfer_summary'>
  events: IEvent[]
}) {
  const eventIds = Object.keys(data.transfers_by_event).sort(
    (a, b) => parseInt(a) - parseInt(b),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border bg-card p-4 flex-1">
          <h4 className="text-sm font-medium mb-2">Total Transfers</h4>
          <p className="text-2xl font-bold">
            {data.transfer_summary.total_transfers}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 flex-1">
          <h4 className="text-sm font-medium mb-2">Total Penalty</h4>
          <p className="text-2xl font-bold text-destructive">
            {(data.transfer_summary.total_penalty / 10).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {eventIds.map((eventId) => {
          const transfers = data.transfers_by_event[eventId]
          if (transfers.count === 0) return null

          return (
            <div key={eventId} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  {
                    events.find((event) => event.id.toString() === eventId)
                      ?.name
                  }
                </h4>
                <span className="text-sm text-muted-foreground">
                  {transfers.count} transfer{transfers.count > 1 ? 's' : ''}
                </span>
              </div>
              {transfers.in.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h5 className="text-sm font-medium text-chart-2">In</h5>
                  <div className="space-y-1">
                    {transfers.in.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between text-sm"
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
                  <h5 className="text-sm font-medium text-destructive">Out</h5>
                  <div className="space-y-1">
                    {transfers.out.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between text-sm"
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

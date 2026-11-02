import type { IEvent, IOptimizedTeam } from '@/hooks/api'
import { cn } from '@/lib/utils'

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 font-medium text-sm">Total Transfers</h4>
          <p className="font-display font-extrabold text-4xl tabular-nums leading-none">
            {data.total}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 font-medium text-sm">Total Penalty</h4>
          <p className="font-display font-extrabold text-4xl text-signal tabular-nums leading-none">
            {(data.cost / 10).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-2 font-medium text-sm">Net Points Impact</h4>
          <p
            className={cn(
              'font-display font-extrabold text-4xl tabular-nums leading-none',
              data.total_net_points >= 0 ? 'text-primary' : 'text-signal'
            )}
          >
            {data.total_net_points < 0 && '-'}
            {(data.total_net_points / 10).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {eventIds.map((eventId) => {
          const transfers = data.by_event[eventId]
          if (transfers.length === 0) {
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
                  {transfers.length} transfer{transfers.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-6">
                {transfers.map((transfer) => (
                  <div
                    className="space-y-4 rounded-lg bg-muted/75 p-4"
                    key={`${eventId}-${transfer.transfer_number}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">
                          Transfer {transfer.transfer_number}
                        </span>
                        {transfer.is_paid && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-signal/10 px-2 py-0.5 font-semibold text-signal text-xs ring-1 ring-signal/30 ring-inset">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span
                          className={cn(
                            'font-medium',
                            transfer.net_points >= 0
                              ? 'text-primary'
                              : 'text-signal'
                          )}
                        >
                          {(transfer.net_points / 10).toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-primary">
                          <h5 className="font-medium text-sm">In</h5>
                          <span className="ml-2 text-xs">
                            +{transfer.games_gained} games
                          </span>
                        </div>
                        <div className="space-y-1 rounded-md bg-card/75 p-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {transfer.in.name} ({transfer.in.team_short})
                            </span>
                            <div className="space-x-3">
                              <span className="text-muted-foreground">
                                ${(transfer.in.cost / 10).toFixed(1)}
                              </span>
                              <span className="text-primary">
                                {(transfer.points_gained / 10).toFixed(1)} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-signal">
                          <h5 className="font-medium text-sm">Out</h5>
                          <span className="ml-2 text-xs">
                            -{transfer.games_lost} games
                          </span>
                        </div>
                        <div className="space-y-1 rounded-md bg-card/75 p-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {transfer.out.name} ({transfer.out.team_short})
                            </span>
                            <div className="space-x-3">
                              <span className="text-muted-foreground">
                                ${(transfer.out.cost / 10).toFixed(1)}
                              </span>
                              <span className="text-signal">
                                {(transfer.points_lost / 10).toFixed(1)} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  className?: string
  valueClassName?: string
}

export function StatCard({
  title,
  value,
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
      </CardContent>
    </Card>
  )
}

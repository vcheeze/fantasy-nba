'use client'

import type { Column } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface DataTableRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title: string
  description?: string
  maxSteps?: number
}

export function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  description,
}: DataTableRangeFilterProps<TData, TValue>) {
  // Get the current values in the column to determine min and max
  const values = column?.getFacetedUniqueValues()
  const numericValues = Array.from(values?.keys() ?? [])
    .map((v) => Number(v) / 10)
    .filter((n) => !Number.isNaN(n))

  const min = useMemo(() => Math.min(...numericValues), [numericValues])
  const max = useMemo(() => Math.max(...numericValues), [numericValues])

  const [range, setRange] = useState<[number, number]>([min, max])

  return (
    <div className="space-y-4">
      <Slider
        className="w-full"
        max={max}
        min={min}
        onValueChange={(value: [number, number]) => {
          setRange(value)
          column?.setFilterValue(value.map((v) => Math.round(v * 10)))
        }}
        step={0.1}
        value={range}
      />
      <div className="flex items-center justify-between text-muted-foreground">
        <Label>{range[0].toFixed(1)}</Label>
        <Label>{range[1].toFixed(1)}</Label>
      </div>
    </div>
  )
}

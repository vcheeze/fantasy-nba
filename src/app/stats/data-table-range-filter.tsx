'use client'

import type { Column } from '@tanstack/react-table'
import { useState } from 'react'
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
  const numericValues = Array.from(
    column?.getFacetedUniqueValues()?.keys() ?? []
  )
    .map((value) => Number(value) / 10)
    .filter((value) => Number.isFinite(value))
  const min = numericValues.length === 0 ? 0 : Math.min(...numericValues)
  const max = numericValues.length === 0 ? 0 : Math.max(...numericValues)
  const [range, setRange] = useState<[number, number] | null>(null)
  const shown = range ?? [min, max]

  return (
    <div className="min-w-0 space-y-4">
      <Slider
        className="w-full"
        disabled={min === max}
        max={max}
        min={min}
        onValueChange={(value: [number, number]) => {
          setRange(value)
          column?.setFilterValue(value.map((item) => Math.round(item * 10)))
        }}
        step={0.1}
        value={shown}
      />
      <div className="flex items-center justify-between text-muted-foreground text-sm tabular-nums">
        <Label>{shown[0].toFixed(1)}</Label>
        <Label>{shown[1].toFixed(1)}</Label>
      </div>
    </div>
  )
}

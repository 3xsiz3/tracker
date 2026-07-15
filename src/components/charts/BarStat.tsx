import { useState } from 'react'

export interface BarStatItem {
  key: string
  label: string
  value: number
  displayValue: string
  tooltip: string
}

export function BarStat({
  items,
  max,
  orientation,
}: {
  items: BarStatItem[]
  max: number
  orientation: 'vertical' | 'horizontal'
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0
          return (
            <div
              key={item.key}
              className="group relative flex items-center gap-3"
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-32 shrink-0 truncate text-sm">{item.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-medium">{item.displayValue}</span>
              {hovered === item.key && (
                <div className="absolute top-full left-32 z-10 mt-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md">
                  {item.tooltip}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {items.map((item, index) => {
          const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0
          const alignRight = index > (items.length - 1) / 2
          return (
            <div
              key={item.key}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === item.key && (
                <div
                  className={`absolute -top-8 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md ${
                    alignRight ? 'right-0' : 'left-0'
                  }`}
                >
                  {item.tooltip}
                </div>
              )}
              <span className="mb-1 text-xs font-medium text-muted-foreground">{item.displayValue}</span>
              <div
                className="w-full max-w-8 rounded-t-md bg-violet-500 transition-all"
                style={{ height: `${pct}%`, minHeight: item.value > 0 ? '4px' : 0 }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {items.map((item) => (
          <span key={item.key} className="flex-1 text-center text-xs text-muted-foreground">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

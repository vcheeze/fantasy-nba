'use client'

import type { AnimationEvent, CSSProperties } from 'react'

/**
 * Overhead lane, drawn to NBA dimensions (feet), as lines only.
 * Lane 16 wide by 19 deep, rim 5.25 from the baseline, free-throw radius 6,
 * three-point arc 23.75 from the rim, corners 22 from the rim.
 * The half of the free-throw circle inside the lane is solid. The half
 * toward midcourt is dashed.
 */
const RIM_X = 5.25
const FT_X = 19
const FT_R = 6
const ARC_R = 23.75
const CORNER_Y = 22
const CORNER_X = RIM_X + Math.sqrt(ARC_R * ARC_R - CORNER_Y * CORNER_Y)
const LANE_MARKS = [7, 8, 11, 14]

const GRID_X = [0, 4, 8, 12, 16, 20, 24, 28, 32]
const GRID_Y = [-12, -8, -4, 0, 4, 8, 12]

const step = (d: number) => ({ '--d': d }) as CSSProperties

function markDrawn(event: AnimationEvent<SVGSVGElement>) {
  if ((event.target as Element).classList.contains('court-line-arc')) {
    document.documentElement.dataset.courtDrawn = ''
  }
}

export function CourtDiagram({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Line diagram of a basketball lane and three-point arc over a chart grid"
      className={className}
      onAnimationEnd={markDrawn}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      viewBox="-0.6 -12.45 33.2 24.9"
    >
      <title>Basketball lane, as a line chart</title>
      <g
        className="court-fade"
        opacity="0.45"
        stroke="var(--muted-foreground)"
        strokeDasharray="0.42 0.38"
        strokeWidth="0.06"
        style={step(0)}
      >
        {GRID_X.map((x) => (
          <line key={`x-${x}`} x1={x} x2={x} y1="-12.45" y2="12.45" />
        ))}
        {GRID_Y.map((y) => (
          <line key={`y-${y}`} x1="-0.6" x2="32.6" y1={y} y2={y} />
        ))}
      </g>

      <g
        fill="none"
        stroke="var(--foreground)"
        strokeLinecap="butt"
        strokeWidth="0.2"
      >
        <line
          className="court-line"
          pathLength={1}
          style={step(0)}
          x1="0"
          x2="0"
          y1="-12.45"
          y2="12.45"
        />
        <rect
          className="court-line"
          height="16"
          pathLength={1}
          style={step(1)}
          width="19"
          x="0"
          y="-8"
        />
        <path
          className="court-line"
          d={`M ${FT_X} ${FT_R} A ${FT_R} ${FT_R} 0 0 1 ${FT_X} -${FT_R}`}
          pathLength={1}
          style={step(2)}
        />
        <path
          className="court-fade"
          d={`M ${FT_X} -${FT_R} A ${FT_R} ${FT_R} 0 0 1 ${FT_X} ${FT_R}`}
          strokeDasharray="0.72 0.48"
          style={step(3)}
        />
        <path
          className="court-line"
          d={`M ${RIM_X} -4 A 4 4 0 0 1 ${RIM_X} 4`}
          pathLength={1}
          style={step(2)}
        />
        <g className="court-fade" style={step(2)}>
          <line x1="4" x2="4" y1="-3" y2="3" />
          <circle cx={RIM_X} cy="0" r="0.75" />
          {LANE_MARKS.map((mark) => (
            <g key={mark}>
              <line x1={mark} x2={mark} y1="9.05" y2="6.9" />
              <line x1={mark} x2={mark} y1="-9.05" y2="-6.9" />
            </g>
          ))}
        </g>
      </g>

      <path
        className="court-line court-line-arc"
        d={`M ${CORNER_X} -${CORNER_Y} A ${ARC_R} ${ARC_R} 0 0 1 ${CORNER_X} ${CORNER_Y}`}
        fill="none"
        pathLength={1}
        stroke="var(--signal)"
        strokeWidth="0.34"
        style={step(3)}
      />
    </svg>
  )
}

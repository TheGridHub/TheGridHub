"use client"

import React from 'react'

export function BasicBarChart({ data, labels }: { data: number[], labels?: string[] }) {
  const max = Math.max(1, ...data)
  const barWidth = 100 / (data.length * 1.5)
  const gap = barWidth / 2
  return (
    <svg viewBox="0 0 100 50" className="w-full h-40">
      {/* Axis */}
      <line x1={0} y1={48} x2={100} y2={48} stroke="#e5e7eb" strokeWidth={1} />
      {data.map((v, i) => {
        const h = (v / max) * 40
        const x = i * (barWidth + gap) + gap
        const y = 48 - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} fill="#7C3AED" rx={1.5} />
            {labels && labels[i] && (
              <text x={x + barWidth / 2} y={49.5} textAnchor="middle" fontSize={3} fill="#6b7280">
                {labels[i]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function BasicLineChart({ data, labels }: { data: number[], labels?: string[] }) {
  const max = Math.max(1, ...data)
  const step = 100 / (Math.max(1, data.length - 1))
  const points = data.map((v, i) => {
    const x = i * step
    const y = 45 - (v / max) * 40
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 50" className="w-full h-40">
      <line x1={0} y1={45} x2={100} y2={45} stroke="#e5e7eb" strokeWidth={1} />
      {/* Area */}
      <polyline points={`0,45 ${points} 100,45`} fill="#C4B5FD" opacity={0.4} />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#7C3AED" strokeWidth={2} />
      {/* Dots */}
      {data.map((v, i) => {
        const x = i * step
        const y = 45 - (v / max) * 40
        return <circle key={i} cx={x} cy={y} r={1.5} fill="#7C3AED" />
      })}
    </svg>
  )
}


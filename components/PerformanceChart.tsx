'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  data: Array<{ name: string; value: number }>
  color: string
}

export default function PerformanceChart({ data, color }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

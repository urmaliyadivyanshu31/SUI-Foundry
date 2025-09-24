'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface LanguageChartProps {
  data: Record<string, number>
}

const COLORS = [
  '#c084fc', // Primary purple
  '#a855f7', // Violet
  '#9333ea', // Purple
  '#7c3aed', // Violet darker
  '#6d28d9', // Violet darkest
  '#5b21b6', // Purple darkest
  '#4c1d95', // Indigo
  '#3730a3', // Indigo darker
]

export function LanguageChart({ data }: LanguageChartProps) {
  const chartData = Object.entries(data).map(([language, count]) => ({
    name: language,
    value: count,
    percentage: Math.round((count / Object.values(data).reduce((a, b) => a + b, 0)) * 100)
  }))

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-white/60">No language data available</p>
      </div>
    )
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Hide labels for very small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur border border-purple-500/30 rounded-lg p-3">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-purple-300">
            {data.value} repositories ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
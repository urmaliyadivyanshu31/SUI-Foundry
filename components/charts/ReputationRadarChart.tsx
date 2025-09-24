'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface ReputationRadarChartProps {
  data: {
    codeQuality: number
    architecture: number
    documentation: number
    testing: number
    security: number
    innovation: number
  }
}

export function ReputationRadarChart({ data }: ReputationRadarChartProps) {
  const chartData = [
    {
      subject: 'Code Quality',
      value: data.codeQuality || 0,
      fullMark: 100
    },
    {
      subject: 'Architecture',
      value: data.architecture || 0,
      fullMark: 100
    },
    {
      subject: 'Documentation',
      value: data.documentation || 0,
      fullMark: 100
    },
    {
      subject: 'Testing',
      value: data.testing || 0,
      fullMark: 100
    },
    {
      subject: 'Security',
      value: data.security || 0,
      fullMark: 100
    },
    {
      subject: 'Innovation',
      value: data.innovation || 0,
      fullMark: 100
    }
  ]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid 
            stroke="rgba(147, 51, 234, 0.3)"
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: 'rgba(255, 255, 255, 0.8)',
              fontSize: 12,
              fontWeight: 500
            }}
            className="text-sm"
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            angle={90}
            tick={{ 
              fill: 'rgba(255, 255, 255, 0.6)',
              fontSize: 10
            }}
            tickCount={6}
          />
          <Radar
            name="Reputation"
            dataKey="value"
            stroke="#c084fc"
            fill="rgba(192, 132, 252, 0.3)"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: '#c084fc',
              strokeWidth: 2,
              stroke: '#ffffff'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
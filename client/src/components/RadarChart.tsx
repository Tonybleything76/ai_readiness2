import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChartProps {
  data: {
    dimension: string;
    score: number;
    fullMark: number;
  }[];
  color?: string;
}

export function RadarChart({ data, color = '#3b82f6' }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="dimension" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickCount={6}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${Math.round(value)}/100`, 'Score']}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

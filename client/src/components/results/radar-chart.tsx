import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface RadarChartProps {
  data: Record<string, number>;
  pillarNames: Record<string, string>;
}

export default function RadarChart({ data, pillarNames }: RadarChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    pillar: pillarNames[key] || key,
    score: value,
    fullMark: 100,
  }));

  return (
    <Card>
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold mb-6">Pillar Breakdown</h3>
        
        <ResponsiveContainer width="100%" height={350} className="mx-auto">
          <RechartsRadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="pillar" 
              className="text-xs sm:text-sm"
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              className="text-xs sm:text-sm"
              tick={{ fontSize: 11 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 gap-3 mt-6">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full bg-chart-${(index % 5) + 1}`}
                />
                <span className="text-sm">{pillarNames[key]}</span>
              </div>
              <span className="text-sm font-mono">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
}

export default function Gauge({ 
  value, 
  max = 100, 
  size = 200, 
  strokeWidth = 8 
}: GaugeProps) {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  
  // Calculate the angle (180 degrees for semicircle)
  const angle = (percentage / 100) * 180;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (value: number) => {
    if (value >= 80) return "hsl(var(--chart-2))";
    if (value >= 60) return "hsl(var(--chart-3))"; 
    if (value >= 40) return "hsl(var(--chart-4))";
    return "hsl(var(--chart-5))";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 40} className="transform -rotate-90">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute bottom-4 text-center">
        <div className="text-3xl font-mono font-bold">{normalizedValue}%</div>
        <div className="text-xs text-muted-foreground">Overall Score</div>
      </div>
    </div>
  );
}

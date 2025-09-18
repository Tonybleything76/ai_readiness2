interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function Gauge({ 
  value, 
  max = 100, 
  size, 
  strokeWidth = 8,
  className = ""
}: GaugeProps) {
  // Responsive sizing: use container-based size if not provided
  const responsiveSize = size || 200;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  
  // Calculate the angle (180 degrees for semicircle)
  const angle = (percentage / 100) * 180;
  const radius = (responsiveSize - strokeWidth) / 2;
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
    <div className={`relative flex flex-col items-center w-full max-w-xs mx-auto ${className}`}>
      <div className="w-full aspect-square max-w-[200px] sm:max-w-[240px] md:max-w-[280px]">
        <svg 
          width="100%" 
          height="50%" 
          viewBox={`0 0 ${responsiveSize} ${responsiveSize / 2 + 40}`}
          className="transform -rotate-90 w-full h-auto"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${responsiveSize / 2} A ${radius} ${radius} 0 0 1 ${responsiveSize - strokeWidth / 2} ${responsiveSize / 2}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${responsiveSize / 2} A ${radius} ${radius} 0 0 1 ${responsiveSize - strokeWidth / 2} ${responsiveSize / 2}`}
            fill="none"
            stroke={getColor(value)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
      </div>
      
      <div className="absolute bottom-2 sm:bottom-4 text-center">
        <div className="text-2xl sm:text-3xl font-mono font-bold">{normalizedValue}%</div>
        <div className="text-xs sm:text-sm text-muted-foreground">Overall Score</div>
      </div>
    </div>
  );
}

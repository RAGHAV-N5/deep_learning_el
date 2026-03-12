"use client"

interface EfficiencyBenchmarkProps {
  fuelConsumption: number | null
  vehicleClass: string
}

// Benchmark data for different vehicle classes (L/100km)
const benchmarks: Record<string, { best: number; average: number; worst: number }> = {
  "COMPACT": { best: 5.5, average: 7.5, worst: 10.5 },
  "SUV - SMALL": { best: 6.5, average: 8.5, worst: 12.0 },
  "MID-SIZE": { best: 6.0, average: 8.5, worst: 12.0 },
  "TWO-SEATER": { best: 5.0, average: 8.0, worst: 14.0 },
  "MINICOMPACT": { best: 4.5, average: 6.5, worst: 9.0 },
  "SUBCOMPACT": { best: 5.0, average: 7.0, worst: 9.5 },
  "FULL-SIZE": { best: 7.0, average: 10.0, worst: 14.0 },
  "STATION WAGON - SMALL": { best: 5.5, average: 7.5, worst: 10.0 },
  "SUV - STANDARD": { best: 8.0, average: 11.5, worst: 16.0 },
  "VAN - CARGO": { best: 9.0, average: 12.0, worst: 16.0 },
  "VAN - PASSENGER": { best: 9.0, average: 12.5, worst: 17.0 },
  "PICKUP TRUCK - STANDARD": { best: 9.0, average: 13.0, worst: 18.0 },
  "MINIVAN": { best: 7.5, average: 10.0, worst: 13.0 },
  "SPECIAL PURPOSE VEHICLE": { best: 8.0, average: 12.0, worst: 17.0 },
  "STATION WAGON - MID-SIZE": { best: 6.5, average: 9.0, worst: 12.0 },
  "PICKUP TRUCK - SMALL": { best: 7.5, average: 10.5, worst: 14.0 },
}

function getPercentile(value: number, best: number, worst: number): number {
  // Lower fuel consumption is better, so invert the percentile
  const range = worst - best
  const position = value - best
  const percentile = 100 - (position / range) * 100
  return Math.max(0, Math.min(100, percentile))
}

function getRating(percentile: number): { label: string; color: string; bgColor: string } {
  if (percentile >= 80) return { label: "Top 20% Efficient", color: "text-emerald-400", bgColor: "bg-emerald-500" }
  if (percentile >= 60) return { label: "Above Average", color: "text-teal-400", bgColor: "bg-teal-500" }
  if (percentile >= 40) return { label: "Average", color: "text-yellow-400", bgColor: "bg-yellow-500" }
  if (percentile >= 20) return { label: "Below Average", color: "text-orange-400", bgColor: "bg-orange-500" }
  return { label: "Low Efficiency", color: "text-red-400", bgColor: "bg-red-500" }
}

export default function EfficiencyBenchmark({ fuelConsumption, vehicleClass }: EfficiencyBenchmarkProps) {
  const benchmark = benchmarks[vehicleClass] || benchmarks["COMPACT"]
  
  if (!fuelConsumption) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vehicle Efficiency Benchmark</h3>
            <p className="text-sm text-gray-400">Run a prediction to see benchmarks</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400">Complete a prediction to compare against benchmarks</p>
        </div>
      </div>
    )
  }

  const percentile = getPercentile(fuelConsumption, benchmark.best, benchmark.worst)
  const rating = getRating(percentile)

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Vehicle Efficiency Benchmark</h3>
          <p className="text-sm text-gray-400">Comparing against {vehicleClass} class</p>
        </div>
      </div>

      {/* Percentile Gauge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
          <span className="text-sm text-gray-400">{percentile.toFixed(0)}th percentile</span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${rating.bgColor} transition-all duration-500`}
            style={{ width: `${percentile}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low Efficiency</span>
          <span>High Efficiency</span>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Best in Class</p>
          <p className="text-xl font-bold text-emerald-400">{benchmark.best}</p>
          <p className="text-xs text-gray-500">L/100km</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Class Average</p>
          <p className="text-xl font-bold text-yellow-400">{benchmark.average}</p>
          <p className="text-xs text-gray-500">L/100km</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Worst in Class</p>
          <p className="text-xl font-bold text-red-400">{benchmark.worst}</p>
          <p className="text-xs text-gray-500">L/100km</p>
        </div>
      </div>

      {/* Your Vehicle */}
      <div className={`rounded-xl p-4 ${
        percentile >= 60 ? 'bg-emerald-500/10 border border-emerald-500/30' :
        percentile >= 40 ? 'bg-yellow-500/10 border border-yellow-500/30' :
        'bg-red-500/10 border border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Your Vehicle</p>
            <p className={`text-2xl font-bold ${rating.color}`}>{fuelConsumption.toFixed(2)} L/100km</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">vs Average</p>
            <p className={`text-lg font-bold ${fuelConsumption < benchmark.average ? 'text-emerald-400' : 'text-red-400'}`}>
              {fuelConsumption < benchmark.average ? '-' : '+'}{Math.abs(fuelConsumption - benchmark.average).toFixed(1)} L
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

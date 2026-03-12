"use client"

interface SustainabilityScoreProps {
  fuelConsumption: number | null
  vehicleClass: string
  fuelType: string
  co2Rating: number
}

function calculateSustainabilityScore(
  fuelConsumption: number | null,
  vehicleClass: string,
  fuelType: string,
  co2Rating: number
): number {
  if (!fuelConsumption) return 0

  let score = 100

  // Fuel consumption impact (max -40 points)
  if (fuelConsumption > 15) score -= 40
  else if (fuelConsumption > 12) score -= 30
  else if (fuelConsumption > 10) score -= 20
  else if (fuelConsumption > 8) score -= 10
  else if (fuelConsumption > 6) score -= 5

  // Vehicle class impact (max -20 points)
  const heavyClasses = ["SUV - STANDARD", "PICKUP TRUCK - STANDARD", "VAN - CARGO", "VAN - PASSENGER"]
  const mediumClasses = ["FULL-SIZE", "SUV - SMALL", "MINIVAN", "PICKUP TRUCK - SMALL"]
  
  if (heavyClasses.includes(vehicleClass)) score -= 20
  else if (mediumClasses.includes(vehicleClass)) score -= 10

  // Fuel type impact (max -20 points)
  const fuelImpact: Record<string, number> = {
    "E": 0,   // Ethanol - best
    "D": 10,  // Diesel
    "X": 15,  // Regular gasoline
    "Z": 20,  // Premium - worst
  }
  score -= fuelImpact[fuelType] || 15

  // CO2 rating impact (max -20 points)
  score -= (10 - co2Rating) * 2

  return Math.max(0, Math.min(100, score))
}

function getScoreColor(score: number): { stroke: string; text: string; bg: string; label: string } {
  if (score >= 80) return { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500", label: "Excellent" }
  if (score >= 60) return { stroke: "#14b8a6", text: "text-teal-400", bg: "bg-teal-500", label: "Good" }
  if (score >= 40) return { stroke: "#eab308", text: "text-yellow-400", bg: "bg-yellow-500", label: "Moderate" }
  if (score >= 20) return { stroke: "#f97316", text: "text-orange-400", bg: "bg-orange-500", label: "Poor" }
  return { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-500", label: "Critical" }
}

function getInterpretation(score: number): string {
  if (score >= 80) return "Your vehicle configuration is highly sustainable. You're making an excellent choice for the environment."
  if (score >= 60) return "Good sustainability profile. There's some room for improvement, but you're on the right track."
  if (score >= 40) return "Moderate environmental impact. Consider eco-driving techniques and regular maintenance to improve."
  if (score >= 20) return "Below average sustainability. Consider alternative vehicles or significant changes to driving habits."
  return "High environmental impact. This configuration has significant room for improvement in sustainability."
}

export default function SustainabilityScore({
  fuelConsumption,
  vehicleClass,
  fuelType,
  co2Rating,
}: SustainabilityScoreProps) {
  const score = calculateSustainabilityScore(fuelConsumption, vehicleClass, fuelType, co2Rating)
  const colors = getScoreColor(score)
  const interpretation = getInterpretation(score)
  
  // SVG circle parameters
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  if (!fuelConsumption) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sustainability Score</h3>
            <p className="text-sm text-gray-400">Run a prediction to see your score</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-gray-400">Complete a prediction to generate your sustainability score</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Sustainability Score</h3>
          <p className="text-sm text-gray-400">Overall environmental impact rating</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular Gauge */}
        <div className="relative w-44 h-44 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-sm text-gray-400">out of 100</span>
          </div>
        </div>

        {/* Rating Label */}
        <div className={`${colors.bg} text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4`}>
          {colors.label}
        </div>

        {/* Interpretation */}
        <p className="text-center text-gray-400 text-sm leading-relaxed max-w-xs">
          {interpretation}
        </p>
      </div>

      {/* Score Breakdown Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { min: 80, color: "bg-emerald-500", label: "80+" },
            { min: 60, color: "bg-teal-500", label: "60-79" },
            { min: 40, color: "bg-yellow-500", label: "40-59" },
            { min: 20, color: "bg-orange-500", label: "20-39" },
            { min: 0, color: "bg-red-500", label: "0-19" },
          ].map((range) => (
            <div key={range.min} className="flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full ${range.color} ${score >= range.min && (range.min === 80 || score < range.min + 20) ? "ring-2 ring-white" : "opacity-50"}`} />
              <span className="text-xs text-gray-500">{range.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import React from "react"; // Import React to declare JSX

interface SmartRecommendationsProps {
  formData: {
    vehicleClass: string
    engineSize: number
    cylinders: number
    transmission: string
    co2Rating: number
    fuelType: string
  } | null
  fuelConsumption: number | null
}

interface Recommendation {
  id: string
  category: "fuel" | "driving" | "vehicle" | "maintenance"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  potentialSavings: string
}

function generateRecommendations(
  formData: SmartRecommendationsProps["formData"],
  fuelConsumption: number | null
): Recommendation[] {
  if (!formData || !fuelConsumption) return []

  const recommendations: Recommendation[] = []

  // Fuel type recommendations
  if (formData.fuelType === "Z") {
    recommendations.push({
      id: "fuel-1",
      category: "fuel",
      priority: "medium",
      title: "Consider Regular Gasoline",
      description: "If your vehicle doesn't require premium fuel, switching to regular gasoline can save money without affecting performance.",
      potentialSavings: "5-10% cost reduction"
    })
  }

  if (formData.fuelType !== "E") {
    recommendations.push({
      id: "fuel-2",
      category: "fuel",
      priority: "low",
      title: "Explore Ethanol (E85) Compatibility",
      description: "If your vehicle is flex-fuel compatible, E85 produces fewer emissions and may cost less in some regions.",
      potentialSavings: "20-40% CO2 reduction"
    })
  }

  // Engine-related recommendations
  if (formData.engineSize >= 3.0) {
    recommendations.push({
      id: "vehicle-1",
      category: "vehicle",
      priority: "medium",
      title: "Consider a Smaller Engine",
      description: "For daily commuting, a vehicle with a smaller engine (1.5-2.0L) could significantly reduce fuel consumption.",
      potentialSavings: "20-35% fuel savings"
    })
  }

  if (formData.cylinders >= 6) {
    recommendations.push({
      id: "vehicle-2",
      category: "vehicle",
      priority: "medium",
      title: "4-Cylinder Alternative",
      description: "Modern 4-cylinder turbocharged engines can provide similar power with better fuel economy.",
      potentialSavings: "15-25% fuel savings"
    })
  }

  // Transmission recommendations
  if (formData.transmission === "A") {
    recommendations.push({
      id: "vehicle-3",
      category: "vehicle",
      priority: "low",
      title: "CVT or Manual Option",
      description: "Next vehicle purchase: Consider a CVT or manual transmission for improved fuel efficiency.",
      potentialSavings: "5-15% fuel savings"
    })
  }

  // Vehicle class recommendations
  const largeClasses = ["SUV - STANDARD", "PICKUP TRUCK - STANDARD", "VAN - CARGO", "VAN - PASSENGER", "FULL-SIZE"]
  if (largeClasses.includes(formData.vehicleClass)) {
    recommendations.push({
      id: "vehicle-4",
      category: "vehicle",
      priority: "high",
      title: "Downsize When Possible",
      description: "If you don't regularly need the extra space, a compact or mid-size vehicle could cut fuel costs significantly.",
      potentialSavings: "25-40% fuel savings"
    })
  }

  // Driving behavior recommendations (always applicable)
  recommendations.push({
    id: "driving-1",
    category: "driving",
    priority: "high",
    title: "Practice Eco-Driving",
    description: "Accelerate gradually, maintain steady speeds, and anticipate stops. Use cruise control on highways.",
    potentialSavings: "10-15% fuel savings"
  })

  if (fuelConsumption > 10) {
    recommendations.push({
      id: "driving-2",
      category: "driving",
      priority: "high",
      title: "Reduce Highway Speed",
      description: "Driving at 90 km/h instead of 120 km/h can significantly improve fuel efficiency.",
      potentialSavings: "15-20% fuel savings"
    })
  }

  recommendations.push({
    id: "driving-3",
    category: "driving",
    priority: "medium",
    title: "Minimize Idling",
    description: "Turn off the engine if stopped for more than 30 seconds. Modern engines don't need warming up.",
    potentialSavings: "5-10% fuel savings"
  })

  // Maintenance recommendations
  recommendations.push({
    id: "maintenance-1",
    category: "maintenance",
    priority: "high",
    title: "Regular Tire Pressure Checks",
    description: "Under-inflated tires increase rolling resistance. Check pressure monthly and before long trips.",
    potentialSavings: "3-5% fuel savings"
  })

  recommendations.push({
    id: "maintenance-2",
    category: "maintenance",
    priority: "medium",
    title: "Timely Air Filter Replacement",
    description: "A clogged air filter reduces engine efficiency. Replace according to manufacturer schedule.",
    potentialSavings: "2-10% fuel savings"
  })

  if (fuelConsumption > 12) {
    recommendations.push({
      id: "maintenance-3",
      category: "maintenance",
      priority: "high",
      title: "Engine Tune-Up",
      description: "High fuel consumption may indicate engine issues. Consider a professional inspection.",
      potentialSavings: "Up to 15% fuel savings"
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 8)
}

const categoryIcons: Record<string, React.JSX.Element> = { // Declare JSX type
  fuel: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  driving: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  vehicle: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  maintenance: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

const categoryColors: Record<string, string> = {
  fuel: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  driving: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  vehicle: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  maintenance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-red-500/20", text: "text-red-400" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  low: { bg: "bg-gray-500/20", text: "text-gray-400" },
}

export default function SmartRecommendations({ formData, fuelConsumption }: SmartRecommendationsProps) {
  const recommendations = generateRecommendations(formData, fuelConsumption)

  if (!formData || !fuelConsumption) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Smart Recommendations</h3>
            <p className="text-sm text-gray-400">Run a prediction to get personalized tips</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-400">Complete a prediction to receive actionable recommendations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Smart Recommendations</h3>
          <p className="text-sm text-gray-400">Personalized suggestions for improvement</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`rounded-xl border p-4 ${categoryColors[rec.category]}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                {categoryIcons[rec.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[rec.priority].bg} ${priorityColors[rec.priority].text}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs text-emerald-400 font-medium">{rec.potentialSavings}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

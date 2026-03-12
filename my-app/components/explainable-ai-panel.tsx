"use client"

import { useState } from "react"

interface ExplainableAIPanelProps {
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

interface Explanation {
  factor: string
  impact: "positive" | "negative" | "neutral"
  description: string
  detail: string
}

function generateExplanations(
  formData: ExplainableAIPanelProps["formData"],
  fuelConsumption: number | null
): Explanation[] {
  if (!formData || !fuelConsumption) return []

  const explanations: Explanation[] = []

  // Engine Size
  if (formData.engineSize <= 1.5) {
    explanations.push({
      factor: "Engine Size",
      impact: "positive",
      description: `Small engine (${formData.engineSize}L) contributes to lower fuel consumption`,
      detail: "Smaller engines require less fuel to operate and are ideal for city driving and daily commutes."
    })
  } else if (formData.engineSize >= 3.0) {
    explanations.push({
      factor: "Engine Size",
      impact: "negative",
      description: `Large engine (${formData.engineSize}L) increases fuel consumption`,
      detail: "Larger engines provide more power but consume significantly more fuel. Consider if you need this much power for your typical usage."
    })
  } else {
    explanations.push({
      factor: "Engine Size",
      impact: "neutral",
      description: `Medium engine (${formData.engineSize}L) provides balanced performance`,
      detail: "This engine size offers a good balance between power and fuel efficiency for most driving conditions."
    })
  }

  // Cylinders
  if (formData.cylinders <= 4) {
    explanations.push({
      factor: "Cylinders",
      impact: "positive",
      description: `${formData.cylinders} cylinders is fuel-efficient`,
      detail: "Fewer cylinders mean less internal friction and lower fuel demand. 4-cylinder engines are the most common and efficient choice."
    })
  } else if (formData.cylinders >= 8) {
    explanations.push({
      factor: "Cylinders",
      impact: "negative",
      description: `${formData.cylinders} cylinders significantly increases fuel demand`,
      detail: "High cylinder count engines are designed for performance, not efficiency. Each additional cylinder adds to fuel consumption."
    })
  } else {
    explanations.push({
      factor: "Cylinders",
      impact: "neutral",
      description: `${formData.cylinders} cylinders offers moderate efficiency`,
      detail: "6-cylinder engines provide good power while maintaining reasonable fuel efficiency for larger vehicles."
    })
  }

  // Transmission
  const transmissionImpact: Record<string, { impact: "positive" | "negative" | "neutral"; desc: string; detail: string }> = {
    "AV": {
      impact: "positive",
      desc: "CVT (Automatic Variable) optimizes engine RPM for best efficiency",
      detail: "Continuously Variable Transmissions adjust seamlessly to maintain optimal engine speed, often providing the best fuel economy."
    },
    "M": {
      impact: "positive",
      desc: "Manual transmission allows for efficient driving when used skillfully",
      detail: "Manual transmissions can be very efficient when the driver shifts at optimal RPM points, though this requires skill and attention."
    },
    "AM": {
      impact: "neutral",
      desc: "Automated Manual provides good efficiency with convenience",
      detail: "Combines manual transmission efficiency with automatic convenience, though may be slightly less efficient than a well-driven manual."
    },
    "AS": {
      impact: "neutral",
      desc: "Auto Select Shift balances control and efficiency",
      detail: "Allows manual control when desired while defaulting to automatic operation, providing flexibility in driving style."
    },
    "A": {
      impact: "negative",
      desc: "Traditional automatic transmission is typically less efficient",
      detail: "Conventional automatic transmissions have more power loss through the torque converter, though modern versions have improved significantly."
    }
  }
  
  const trans = transmissionImpact[formData.transmission] || transmissionImpact["A"]
  explanations.push({
    factor: "Transmission",
    impact: trans.impact,
    description: trans.desc,
    detail: trans.detail
  })

  // Fuel Type
  const fuelImpact: Record<string, { impact: "positive" | "negative" | "neutral"; desc: string; detail: string }> = {
    "E": {
      impact: "positive",
      desc: "Ethanol (E85) produces lower CO2 emissions per liter",
      detail: "Ethanol is a renewable fuel with lower carbon intensity. However, it has lower energy density, so you may use more volume."
    },
    "D": {
      impact: "neutral",
      desc: "Diesel offers better fuel economy but higher CO2 per liter",
      detail: "Diesel engines are more thermally efficient but produce more CO2 per liter burned. Better for high-mileage drivers."
    },
    "X": {
      impact: "neutral",
      desc: "Regular gasoline is standard with moderate emissions",
      detail: "The most common fuel type with established infrastructure. Emissions depend heavily on driving style and vehicle efficiency."
    },
    "Z": {
      impact: "negative",
      desc: "Premium gasoline often indicates a performance-focused vehicle",
      detail: "Premium fuel is typically required by high-performance engines. These vehicles usually prioritize power over efficiency."
    }
  }
  
  const fuel = fuelImpact[formData.fuelType] || fuelImpact["X"]
  explanations.push({
    factor: "Fuel Type",
    impact: fuel.impact,
    description: fuel.desc,
    detail: fuel.detail
  })

  // CO2 Rating
  if (formData.co2Rating >= 7) {
    explanations.push({
      factor: "CO2 Rating",
      impact: "positive",
      description: `High CO2 rating (${formData.co2Rating}/10) indicates good environmental performance`,
      detail: "This rating suggests the vehicle performs well in terms of carbon emissions relative to its class."
    })
  } else if (formData.co2Rating <= 3) {
    explanations.push({
      factor: "CO2 Rating",
      impact: "negative",
      description: `Low CO2 rating (${formData.co2Rating}/10) indicates higher emissions`,
      detail: "This rating suggests the vehicle has higher than average emissions for its class. Consider eco-driving techniques."
    })
  } else {
    explanations.push({
      factor: "CO2 Rating",
      impact: "neutral",
      description: `Average CO2 rating (${formData.co2Rating}/10)`,
      detail: "The vehicle has typical emissions for its class. There may be room for improvement through driving habits."
    })
  }

  // Vehicle Class
  const largeClasses = ["SUV - STANDARD", "PICKUP TRUCK - STANDARD", "VAN - CARGO", "VAN - PASSENGER", "FULL-SIZE"]
  const smallClasses = ["COMPACT", "SUBCOMPACT", "MINICOMPACT", "TWO-SEATER"]
  
  if (smallClasses.includes(formData.vehicleClass)) {
    explanations.push({
      factor: "Vehicle Class",
      impact: "positive",
      description: `${formData.vehicleClass} is among the most efficient vehicle types`,
      detail: "Smaller, lighter vehicles require less energy to move and are inherently more fuel-efficient."
    })
  } else if (largeClasses.includes(formData.vehicleClass)) {
    explanations.push({
      factor: "Vehicle Class",
      impact: "negative",
      description: `${formData.vehicleClass} typically has higher fuel consumption`,
      detail: "Larger vehicles have more weight and aerodynamic drag, requiring more fuel. Consider if you need this size for your needs."
    })
  } else {
    explanations.push({
      factor: "Vehicle Class",
      impact: "neutral",
      description: `${formData.vehicleClass} has moderate fuel efficiency characteristics`,
      detail: "This vehicle class offers a balance between space/utility and fuel efficiency."
    })
  }

  return explanations
}

export default function ExplainableAIPanel({ formData, fuelConsumption }: ExplainableAIPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  
  const explanations = generateExplanations(formData, fuelConsumption)

  if (!formData || !fuelConsumption) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Explainable AI Panel</h3>
            <p className="text-sm text-gray-400">Run a prediction to see explanations</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Complete a prediction to understand the factors</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Explainable AI Panel</h3>
          <p className="text-sm text-gray-400">Understanding your prediction breakdown</p>
        </div>
      </div>

      <div className="space-y-3">
        {explanations.map((exp, index) => (
          <div
            key={exp.factor}
            className={`rounded-xl border transition-all duration-300 ${
              exp.impact === "positive" ? "bg-emerald-500/5 border-emerald-500/20" :
              exp.impact === "negative" ? "bg-red-500/5 border-red-500/20" :
              "bg-gray-700/30 border-gray-600/30"
            }`}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-4 flex items-start gap-3 text-left"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                exp.impact === "positive" ? "bg-emerald-500/20" :
                exp.impact === "negative" ? "bg-red-500/20" :
                "bg-gray-600/30"
              }`}>
                {exp.impact === "positive" ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : exp.impact === "negative" ? (
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{exp.factor}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedIndex === index ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className={`text-sm mt-1 ${
                  exp.impact === "positive" ? "text-emerald-300" :
                  exp.impact === "negative" ? "text-red-300" :
                  "text-gray-400"
                }`}>
                  {exp.description}
                </p>
              </div>
            </button>
            {expandedIndex === index && (
              <div className="px-4 pb-4 pt-0 ml-11">
                <p className="text-sm text-gray-400 leading-relaxed">{exp.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

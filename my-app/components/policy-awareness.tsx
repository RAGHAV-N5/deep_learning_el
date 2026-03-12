"use client"

import { useState } from "react"

interface PolicyAwarenessProps {
  fuelConsumption: number | null
  co2Rating: number
}

// Generic emission standards (not country-specific)
const emissionStandards = {
  low: { maxConsumption: 6.5, maxCO2: 130, label: "Low Emission Compliant" },
  moderate: { maxConsumption: 9.5, maxCO2: 180, label: "Moderate Emission" },
  high: { label: "High Emission Vehicle" }
}

function getEmissionCategory(fuelConsumption: number | null, co2Rating: number): "low" | "moderate" | "high" {
  if (!fuelConsumption) return "moderate"
  
  const estimatedCO2 = fuelConsumption * 23.1 // g/km approximation
  
  if (fuelConsumption <= emissionStandards.low.maxConsumption && estimatedCO2 <= emissionStandards.low.maxCO2) {
    return "low"
  }
  if (fuelConsumption <= emissionStandards.moderate.maxConsumption && estimatedCO2 <= emissionStandards.moderate.maxCO2) {
    return "moderate"
  }
  return "high"
}

export default function PolicyAwareness({ fuelConsumption, co2Rating }: PolicyAwarenessProps) {
  const [isEnabled, setIsEnabled] = useState(true)
  
  const category = getEmissionCategory(fuelConsumption, co2Rating)
  const estimatedCO2 = fuelConsumption ? fuelConsumption * 23.1 : 0

  const categoryStyles = {
    low: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    moderate: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    high: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const style = categoryStyles[category]

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Environmental Policy Awareness</h3>
            <p className="text-sm text-gray-400">Emission standards compliance check</p>
          </div>
        </div>
        
        {/* Toggle */}
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? 'left-7' : 'left-1'}`}
          />
        </button>
      </div>

      {isEnabled ? (
        <>
          {!fuelConsumption ? (
            <div className="bg-gray-700/30 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400">Run a prediction to check emission compliance</p>
            </div>
          ) : (
            <>
              {/* Compliance Status */}
              <div className={`${style.bg} ${style.border} border rounded-xl p-4 mb-4`}>
                <div className="flex items-center gap-3">
                  <div className={style.text}>
                    {style.icon}
                  </div>
                  <div>
                    <p className={`font-semibold ${style.text}`}>
                      {emissionStandards[category].label}
                    </p>
                    <p className="text-sm text-gray-400">Based on predicted consumption and CO2 rating</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Estimated CO2</p>
                  <p className="text-xl font-bold text-white">{estimatedCO2.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">g/km</p>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">CO2 Rating</p>
                  <p className="text-xl font-bold text-white">{co2Rating}</p>
                  <p className="text-xs text-gray-500">out of 10</p>
                </div>
              </div>

              {/* Standards Reference */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium mb-2">Emission Thresholds (Generic)</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-gray-400">Low: Less than 6.5 L/100km, Less than 130 g/km CO2</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-gray-400">Moderate: 6.5-9.5 L/100km, 130-180 g/km CO2</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-400">High: Above 9.5 L/100km or 180 g/km CO2</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-400">Disclaimer:</strong> These values are indicative and based on generic emission standards. Actual compliance depends on local regulations, vehicle age, and testing conditions. Consult official sources for regulatory compliance.
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <p className="text-gray-400">Policy awareness mode is disabled</p>
          <p className="text-xs text-gray-500 mt-1">Toggle on to see emission compliance</p>
        </div>
      )}
    </div>
  )
}

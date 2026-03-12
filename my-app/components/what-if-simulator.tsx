"use client"

import { useState, useEffect } from "react"

interface WhatIfSimulatorProps {
  baselineData: {
    engineSize: number
    cylinders: number
    transmission: string
    fuelConsumption: number
  } | null
}

// Simulated prediction based on changes (rule-based interpolation)
function calculatePrediction(
  baseConsumption: number,
  baseEngine: number,
  baseCylinders: number,
  baseTransmission: string,
  newEngine: number,
  newCylinders: number,
  newTransmission: string
): number {
  let predicted = baseConsumption

  // Engine size impact: ~0.8 L/100km per 0.5L change
  const engineDiff = newEngine - baseEngine
  predicted += engineDiff * 1.6

  // Cylinder impact: ~0.7 L/100km per cylinder
  const cylinderDiff = newCylinders - baseCylinders
  predicted += cylinderDiff * 0.7

  // Transmission impact
  const transmissionEfficiency: Record<string, number> = {
    AV: 0,    // CVT - most efficient
    M: 0.2,   // Manual
    AM: 0.3,  // Automated Manual
    AS: 0.4,  // Auto Select
    A: 0.5,   // Automatic
  }
  
  const baseTrans = transmissionEfficiency[baseTransmission] || 0.3
  const newTrans = transmissionEfficiency[newTransmission] || 0.3
  predicted += (newTrans - baseTrans) * 1.5

  return Math.max(4, Math.min(25, predicted))
}

export default function WhatIfSimulator({ baselineData }: WhatIfSimulatorProps) {
  const [engineSize, setEngineSize] = useState(2.0)
  const [cylinders, setCylinders] = useState(4)
  const [transmission, setTransmission] = useState("A")
  const [predictedConsumption, setPredictedConsumption] = useState<number | null>(null)

  useEffect(() => {
    if (baselineData) {
      setEngineSize(baselineData.engineSize)
      setCylinders(baselineData.cylinders)
      setTransmission(baselineData.transmission)
      setPredictedConsumption(baselineData.fuelConsumption)
    }
  }, [baselineData])

  useEffect(() => {
    if (baselineData) {
      const newPrediction = calculatePrediction(
        baselineData.fuelConsumption,
        baselineData.engineSize,
        baselineData.cylinders,
        baselineData.transmission,
        engineSize,
        cylinders,
        transmission
      )
      setPredictedConsumption(newPrediction)
    }
  }, [engineSize, cylinders, transmission, baselineData])

  const difference = baselineData && predictedConsumption
    ? predictedConsumption - baselineData.fuelConsumption
    : 0

  const co2Before = baselineData ? baselineData.fuelConsumption * 2.31 : 0
  const co2After = predictedConsumption ? predictedConsumption * 2.31 : 0

  if (!baselineData) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">What-If Scenario Simulator</h3>
            <p className="text-sm text-gray-400">Run a prediction first to enable simulation</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Complete a fuel prediction above to unlock the what-if simulator</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">What-If Scenario Simulator</h3>
          <p className="text-sm text-gray-400">Adjust parameters to see potential impact</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Engine Size Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Engine Size</label>
              <span className="text-sm text-emerald-400 font-mono">{engineSize.toFixed(1)} L</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.1"
              value={engineSize}
              onChange={(e) => setEngineSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0L</span>
              <span>6.0L</span>
            </div>
          </div>

          {/* Cylinders Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Cylinders</label>
              <span className="text-sm text-emerald-400 font-mono">{cylinders}</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={cylinders}
              onChange={(e) => setCylinders(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span>
              <span>12</span>
            </div>
          </div>

          {/* Transmission Select */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Transmission</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: "AV", label: "CVT" },
                { value: "M", label: "Manual" },
                { value: "AM", label: "AM" },
                { value: "AS", label: "AS" },
                { value: "A", label: "Auto" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTransmission(t.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    transmission === t.value
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Comparison */}
        <div className="space-y-4">
          {/* Before vs After */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/30 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Before</p>
              <p className="text-2xl font-bold text-white">{baselineData.fuelConsumption.toFixed(2)}</p>
              <p className="text-xs text-gray-500">L/100km</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${difference > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
              <p className="text-xs text-gray-400 mb-1">After</p>
              <p className={`text-2xl font-bold ${difference > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {predictedConsumption?.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">L/100km</p>
            </div>
          </div>

          {/* Change Indicator */}
          <div className={`rounded-xl p-4 ${difference > 0 ? 'bg-red-500/10' : difference < 0 ? 'bg-emerald-500/10' : 'bg-gray-700/30'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Change</span>
              <span className={`text-lg font-bold ${difference > 0 ? 'text-red-400' : difference < 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                {difference > 0 ? '+' : ''}{difference.toFixed(2)} L/100km
              </span>
            </div>
          </div>

          {/* CO2 Impact */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-3">CO2 Impact (per 100km)</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-yellow-500"
                    style={{ width: `${Math.min(100, (co2Before / 50) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{co2Before.toFixed(1)} kg</p>
              </div>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${co2After > co2Before ? 'bg-gradient-to-r from-yellow-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                    style={{ width: `${Math.min(100, (co2After / 50) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{co2After.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

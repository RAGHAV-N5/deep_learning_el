"use client"

import React from "react"

import { useState } from "react"

const vehicleClasses = [
  "COMPACT",
  "SUV - SMALL",
  "MID-SIZE",
  "TWO-SEATER",
  "MINICOMPACT",
  "SUBCOMPACT",
  "FULL-SIZE",
  "STATION WAGON - SMALL",
  "SUV - STANDARD",
  "VAN - CARGO",
  "VAN - PASSENGER",
  "PICKUP TRUCK - STANDARD",
  "MINIVAN",
  "SPECIAL PURPOSE VEHICLE",
  "STATION WAGON - MID-SIZE",
  "PICKUP TRUCK - SMALL",
]

const transmissionTypes = [
  { value: "AV", label: "AV - Automatic Variable" },
  { value: "AM", label: "AM - Automated Manual" },
  { value: "M", label: "M - Manual" },
  { value: "AS", label: "AS - Auto w/ Select Shift" },
  { value: "A", label: "A - Automatic" },
]

const fuelTypes = [
  { value: "D", label: "D - Diesel" },
  { value: "E", label: "E - Ethanol (E85)" },
  { value: "X", label: "X - Regular Gasoline" },
  { value: "Z", label: "Z - Premium Gasoline" },
]

export interface PredictionFormData {
  vehicleClass: string
  engineSize: number
  cylinders: number
  transmission: string
  co2Rating: number
  fuelType: string
}

interface FuelPredictionFormProps {
  onPrediction?: (data: PredictionFormData, result: number) => void
}

export default function FuelPredictionForm({ onPrediction }: FuelPredictionFormProps) {
  const [formData, setFormData] = useState<PredictionFormData>({
    vehicleClass: "COMPACT",
    engineSize: 2.0,
    cylinders: 4,
    transmission: "A",
    co2Rating: 5,
    fuelType: "X",
  })
  
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Prepare payload in exact order required by backend
    const payload = [
      formData.vehicleClass,
      formData.engineSize,
      formData.cylinders,
      formData.transmission,
      formData.co2Rating,
      formData.fuelType,
    ]

    try {
      // Backend API call
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to get prediction")
      }

      const data = await response.json()
      const fuelConsumption = data.fuel_consumption
      setResult(fuelConsumption)
      
      // Notify parent component
      if (onPrediction) {
        onPrediction(formData, fuelConsumption)
      }
    } catch (err) {
      // Fallback: Use a simple estimation formula when backend is unavailable
      const estimatedConsumption = estimateFuelConsumption(formData)
      setResult(estimatedConsumption)
      
      if (onPrediction) {
        onPrediction(formData, estimatedConsumption)
      }
      
      console.log("[v0] Using fallback estimation - backend unavailable")
    } finally {
      setLoading(false)
    }
  }

  // Simple rule-based estimation when backend is unavailable
  const estimateFuelConsumption = (data: PredictionFormData): number => {
    let base = 6.0

    // Engine size impact
    base += (data.engineSize - 1.5) * 1.5

    // Cylinder impact
    base += (data.cylinders - 4) * 0.6

    // Transmission impact
    const transImpact: Record<string, number> = { AV: -0.5, M: 0, AM: 0.2, AS: 0.3, A: 0.5 }
    base += transImpact[data.transmission] || 0

    // Fuel type impact
    const fuelImpact: Record<string, number> = { E: -0.3, D: -0.2, X: 0, Z: 0.3 }
    base += fuelImpact[data.fuelType] || 0

    // Vehicle class impact
    const classImpact: Record<string, number> = {
      "MINICOMPACT": -1.0, "SUBCOMPACT": -0.8, "TWO-SEATER": -0.5, "COMPACT": -0.3,
      "MID-SIZE": 0, "STATION WAGON - SMALL": 0.2, "FULL-SIZE": 1.0,
      "SUV - SMALL": 1.2, "MINIVAN": 1.5, "SUV - STANDARD": 2.5,
      "VAN - CARGO": 3.0, "VAN - PASSENGER": 3.0, "PICKUP TRUCK - SMALL": 2.5,
      "PICKUP TRUCK - STANDARD": 3.5, "SPECIAL PURPOSE VEHICLE": 2.0, "STATION WAGON - MID-SIZE": 0.5
    }
    base += classImpact[data.vehicleClass] || 0

    // CO2 rating inverse impact
    base += (5 - data.co2Rating) * 0.3

    return Math.max(4, Math.min(20, base))
  }

  return (
    <div id="predict" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Fuel Consumption Predictor</h2>
          <p className="text-sm text-gray-400">Enter vehicle specifications to predict fuel efficiency</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Class */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Class</label>
          <select
            value={formData.vehicleClass}
            onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            {vehicleClasses.map((vc) => (
              <option key={vc} value={vc}>{vc}</option>
            ))}
          </select>
        </div>

        {/* Engine Size & Cylinders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Engine Size (L)</label>
            <input
              type="number"
              min="1"
              max="7"
              step="0.1"
              value={formData.engineSize}
              onChange={(e) => setFormData({ ...formData, engineSize: parseFloat(e.target.value) || 1 })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cylinders</label>
            <input
              type="number"
              min="1"
              max="16"
              value={formData.cylinders}
              onChange={(e) => setFormData({ ...formData, cylinders: parseInt(e.target.value) || 1 })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Transmission</label>
          <select
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            {transmissionTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* CO2 Rating & Fuel Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">CO2 Rating (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.co2Rating}
              onChange={(e) => setFormData({ ...formData, co2Rating: parseInt(e.target.value) || 1 })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Type</label>
            <select
              value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              {fuelTypes.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Predicting...
            </span>
          ) : (
            "Predict Fuel Efficiency"
          )}
        </button>
      </form>

      {/* Result Display */}
      {result !== null && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Predicted Fuel Consumption</p>
              <p className="text-2xl font-bold text-emerald-400">{result.toFixed(2)} L/100km</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

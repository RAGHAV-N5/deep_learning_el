"use client"

import { useState, useEffect } from "react"

interface CarbonCostEstimatorProps {
  fuelConsumption: number | null
  fuelType: string
}

const fuelPrices: Record<string, { inr: number; usd: number; label: string }> = {
  X: { inr: 105, usd: 1.26, label: "Regular Gasoline" },
  Z: { inr: 115, usd: 1.38, label: "Premium Gasoline" },
  D: { inr: 95, usd: 1.14, label: "Diesel" },
  E: { inr: 85, usd: 1.02, label: "Ethanol (E85)" },
}

const co2Factors: Record<string, number> = {
  X: 2.31,
  Z: 2.31,
  D: 2.68,
  E: 1.61,
}

export default function CarbonCostEstimator({ fuelConsumption, fuelType }: CarbonCostEstimatorProps) {
  const [kmPerMonth, setKmPerMonth] = useState(1500)
  const [customFuelPrice, setCustomFuelPrice] = useState<number | null>(null)
  const [currency, setCurrency] = useState<"inr" | "usd">("inr")

  const currentFuelPrice = fuelPrices[fuelType] || fuelPrices.X
  const effectivePrice = customFuelPrice !== null ? customFuelPrice : currentFuelPrice[currency]
  const co2Factor = co2Factors[fuelType] || 2.31

  // Calculations
  const monthlyFuelLiters = fuelConsumption ? (kmPerMonth / 100) * fuelConsumption : 0
  const monthlyCost = monthlyFuelLiters * effectivePrice
  const annualCost = monthlyCost * 12
  const monthlyCO2 = monthlyFuelLiters * co2Factor
  const annualCO2 = monthlyCO2 * 12

  // Trees equivalent (1 tree absorbs ~21.77 kg CO2/year)
  const treesNeeded = annualCO2 / 21.77

  if (!fuelConsumption) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Carbon Footprint Cost Estimator</h3>
            <p className="text-sm text-gray-400">Run a prediction to see cost estimates</p>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">Complete a fuel prediction to calculate costs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Carbon Footprint Cost Estimator</h3>
          <p className="text-sm text-gray-400">Calculate your monthly and annual costs</p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* KM per Month */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">Monthly Distance (km)</label>
          <input
            type="number"
            value={kmPerMonth}
            onChange={(e) => setKmPerMonth(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">Currency</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setCurrency("inr"); setCustomFuelPrice(null) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currency === "inr" ? "bg-amber-500 text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              INR
            </button>
            <button
              onClick={() => { setCurrency("usd"); setCustomFuelPrice(null) }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currency === "usd" ? "bg-amber-500 text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Fuel Price */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2">
            Fuel Price ({currency === "inr" ? "per L" : "/L"})
          </label>
          <input
            type="number"
            step="0.01"
            value={customFuelPrice !== null ? customFuelPrice : currentFuelPrice[currency]}
            onChange={(e) => setCustomFuelPrice(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Monthly Fuel */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-xs text-gray-400">Monthly Fuel</span>
          </div>
          <p className="text-2xl font-bold text-white">{monthlyFuelLiters.toFixed(1)}</p>
          <p className="text-xs text-gray-500">liters</p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400">Monthly Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {currency === "inr" ? "Rs" : "$"}{monthlyCost.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">{currentFuelPrice.label}</p>
        </div>

        {/* Annual Cost */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">Annual Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {currency === "inr" ? "Rs" : "$"}{annualCost.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">per year</p>
        </div>

        {/* Annual CO2 */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400">Annual CO2</span>
          </div>
          <p className="text-2xl font-bold text-white">{(annualCO2 / 1000).toFixed(2)}</p>
          <p className="text-xs text-gray-500">tonnes/year</p>
        </div>
      </div>

      {/* Trees Equivalent */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌳</div>
            <div>
              <p className="text-white font-medium">Trees needed to offset your emissions</p>
              <p className="text-sm text-gray-400">Based on average tree CO2 absorption (21.77 kg/year)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">{Math.ceil(treesNeeded)}</p>
            <p className="text-xs text-gray-500">trees/year</p>
          </div>
        </div>
      </div>
    </div>
  )
}

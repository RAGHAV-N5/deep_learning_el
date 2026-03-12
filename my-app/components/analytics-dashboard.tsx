"use client"

import { useState } from "react"

// Sample data for analytics visualization
const fuelDistributionData = [
  { range: "4-6", count: 15, percentage: 15 },
  { range: "6-8", count: 35, percentage: 35 },
  { range: "8-10", count: 28, percentage: 28 },
  { range: "10-12", count: 14, percentage: 14 },
  { range: "12+", count: 8, percentage: 8 },
]

const co2DistributionData = [
  { range: "<120", count: 12, percentage: 12 },
  { range: "120-150", count: 30, percentage: 30 },
  { range: "150-180", count: 32, percentage: 32 },
  { range: "180-220", count: 18, percentage: 18 },
  { range: ">220", count: 8, percentage: 8 },
]

const vehicleClassEfficiency = [
  { class: "Two-Seater", avgConsumption: 7.2, efficiency: 85 },
  { class: "Compact", avgConsumption: 7.5, efficiency: 82 },
  { class: "Subcompact", avgConsumption: 7.8, efficiency: 78 },
  { class: "Mid-Size", avgConsumption: 8.5, efficiency: 70 },
  { class: "SUV-Small", avgConsumption: 9.2, efficiency: 62 },
  { class: "Full-Size", avgConsumption: 10.5, efficiency: 50 },
  { class: "SUV-Standard", avgConsumption: 12.0, efficiency: 38 },
  { class: "Pickup Truck", avgConsumption: 13.5, efficiency: 28 },
]

type TabKey = "fuel" | "co2" | "trends"

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("fuel")

  const tabs: { key: TabKey; label: string }[] = [
    { key: "fuel", label: "Fuel Distribution" },
    { key: "co2", label: "CO2 Distribution" },
    { key: "trends", label: "Class Trends" },
  ]

  return (
    <div id="analytics" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Research Analytics Dashboard</h3>
          <p className="text-sm text-gray-400">Academic-style visualizations for analysis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700/50 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-cyan-500 text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "fuel" && (
        <div>
          <h4 className="text-white font-medium mb-4">Fuel Consumption Distribution (L/100km)</h4>
          <div className="space-y-3">
            {fuelDistributionData.map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <span className="w-16 text-sm text-gray-400 font-mono">{item.range}</span>
                <div className="flex-1 h-8 bg-gray-700/50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                    {item.percentage}%
                  </span>
                </div>
                <span className="w-12 text-sm text-gray-500 text-right">n={item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-700/20 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Figure 1:</strong> Distribution of fuel consumption across vehicle samples. 
              Mean consumption: 8.2 L/100km, Median: 7.8 L/100km, SD: 2.1
            </p>
          </div>
        </div>
      )}

      {activeTab === "co2" && (
        <div>
          <h4 className="text-white font-medium mb-4">CO2 Emission Distribution (g/km)</h4>
          <div className="space-y-3">
            {co2DistributionData.map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <span className="w-16 text-sm text-gray-400 font-mono">{item.range}</span>
                <div className="flex-1 h-8 bg-gray-700/50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                    {item.percentage}%
                  </span>
                </div>
                <span className="w-12 text-sm text-gray-500 text-right">n={item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-700/20 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Figure 2:</strong> CO2 emission distribution across analyzed vehicles. 
              Mean emission: 165 g/km, Median: 158 g/km, SD: 38
            </p>
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div>
          <h4 className="text-white font-medium mb-4">Vehicle Class Efficiency Comparison</h4>
          <div className="space-y-4">
            {vehicleClassEfficiency.map((item) => (
              <div key={item.class} className="bg-gray-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">{item.class}</span>
                  <span className="text-sm text-emerald-400 font-mono">{item.avgConsumption} L/100km</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.efficiency >= 70 ? "bg-emerald-500" :
                      item.efficiency >= 50 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${item.efficiency}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Efficiency Score</span>
                  <span className="text-xs text-gray-400">{item.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-700/20 rounded-lg">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Figure 3:</strong> Comparative efficiency analysis across vehicle classes. 
              Efficiency score calculated as inverse function of fuel consumption relative to class baseline.
            </p>
          </div>
        </div>
      )}

      {/* Statistical Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <h4 className="text-white font-medium mb-3">Statistical Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">156</p>
            <p className="text-xs text-gray-500">Total Samples</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">8.2</p>
            <p className="text-xs text-gray-500">Mean L/100km</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">165</p>
            <p className="text-xs text-gray-500">Mean g/km CO2</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">0.89</p>
            <p className="text-xs text-gray-500">R Squared</p>
          </div>
        </div>
      </div>
    </div>
  )
}

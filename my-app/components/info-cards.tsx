"use client"

import { useState } from "react"
import { JSX } from "react/jsx-runtime"

type TabKey = "comparison" | "tips" | "sustainable" | "future"

const tabs: { key: TabKey; label: string; icon: JSX.Element }[] = [
  {
    key: "comparison",
    label: "Fuel Comparison",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: "tips",
    label: "Emission Tips",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    key: "sustainable",
    label: "Sustainable Driving",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "future",
    label: "Future Scope",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

const tabContent: Record<TabKey, JSX.Element> = {
  comparison: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Fuel Type Comparison</h3>
      <div className="space-y-3">
        {[
          { name: "Petrol (X)", co2: "2.31 kg/L", efficiency: "Moderate", color: "bg-orange-500" },
          { name: "Diesel (D)", co2: "2.68 kg/L", efficiency: "High", color: "bg-yellow-500" },
          { name: "Ethanol (E)", co2: "1.61 kg/L", efficiency: "Moderate", color: "bg-green-500" },
          { name: "Premium (Z)", co2: "2.31 kg/L", efficiency: "Moderate", color: "bg-blue-500" },
        ].map((fuel) => (
          <div key={fuel.name} className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{fuel.name}</span>
              <span className={`${fuel.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                {fuel.efficiency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">CO₂ Emission:</span>
              <span className="text-emerald-400 text-sm font-medium">{fuel.co2}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  tips: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Emission Awareness Tips</h3>
      <ul className="space-y-3">
        {[
          "Regular vehicle maintenance reduces emissions by up to 10%",
          "Properly inflated tires improve fuel efficiency by 3%",
          "Avoid excessive idling - turn off engine when stationary",
          "Use air conditioning sparingly - it increases fuel consumption",
          "Remove roof racks when not in use to reduce drag",
          "Plan trips to avoid peak traffic and reduce stop-and-go driving",
        ].map((tip, i) => (
          <li key={i} className="flex items-start gap-3 bg-gray-700/50 rounded-lg p-3">
            <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
              {i + 1}
            </span>
            <span className="text-gray-300 text-sm">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
  sustainable: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Sustainable Driving Practices</h3>
      <div className="grid gap-3">
        {[
          { title: "Eco-Driving", desc: "Accelerate smoothly and anticipate traffic flow", icon: "🚗" },
          { title: "Carpooling", desc: "Share rides to reduce per-person emissions", icon: "👥" },
          { title: "Route Optimization", desc: "Use GPS to find the most efficient routes", icon: "🗺️" },
          { title: "Regular Service", desc: "Keep your vehicle well-maintained", icon: "🔧" },
          { title: "Speed Management", desc: "Optimal fuel efficiency is between 50-80 km/h", icon: "⚡" },
          { title: "Load Reduction", desc: "Remove unnecessary weight from your vehicle", icon: "📦" },
        ].map((practice) => (
          <div key={practice.title} className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3">
            <span className="text-2xl">{practice.icon}</span>
            <div>
              <h4 className="text-white font-medium text-sm">{practice.title}</h4>
              <p className="text-gray-400 text-xs">{practice.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  future: (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Future of Transportation</h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <span>🔋</span> Electric Vehicles (EVs)
          </h4>
          <p className="text-gray-300 text-sm">
            Zero direct emissions, rapidly improving battery technology, and expanding charging infrastructure.
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <span>⚡</span> Hybrid Technology
          </h4>
          <p className="text-gray-300 text-sm">
            Combining electric and combustion engines for optimal efficiency during the transition period.
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <span>🌿</span> Policy Impact
          </h4>
          <p className="text-gray-300 text-sm">
            Government regulations and incentives driving the shift toward cleaner transportation.
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <span>🔬</span> Hydrogen Fuel Cells
          </h4>
          <p className="text-gray-300 text-sm">
            Emerging technology offering zero emissions with fast refueling times similar to traditional fuels.
          </p>
        </div>
      </div>
    </div>
  ),
}

export default function InfoCards() {
  const [activeTab, setActiveTab] = useState<TabKey>("comparison")

  return (
    <div id="info" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">{tabContent[activeTab]}</div>
    </div>
  )
}

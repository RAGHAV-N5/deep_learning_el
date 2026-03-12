"use client"

import { useState } from "react"
import Header from "@/components/header"
import LandingHero from "@/components/landing-hero"
import FuelPredictionForm, { type PredictionFormData } from "@/components/fuel-prediction-form"
import WhatIfSimulator from "@/components/what-if-simulator"
import CarbonCostEstimator from "@/components/carbon-cost-estimator"
import EfficiencyBenchmark from "@/components/efficiency-benchmark"
import ExplainableAIPanel from "@/components/explainable-ai-panel"
import SustainabilityScore from "@/components/sustainability-score"
import SmartRecommendations from "@/components/smart-recommendations"
import PolicyAwareness from "@/components/policy-awareness"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import InfoCards from "@/components/info-cards"
import Chatbot from "@/components/chatbot"

interface PredictionState {
  formData: PredictionFormData | null
  fuelConsumption: number | null
}

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [prediction, setPrediction] = useState<PredictionState>({
    formData: null,
    fuelConsumption: null,
  })

  const handlePrediction = (formData: PredictionFormData, result: number) => {
    setPrediction({ formData, fuelConsumption: result })
  }

  const predictionContext = prediction.formData && prediction.fuelConsumption
    ? { formData: prediction.formData, fuelConsumption: prediction.fuelConsumption }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      {/* Landing Hero */}
      <LandingHero />
      
      <main className="container mx-auto px-4 py-12">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Fuel Prediction & Analysis</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter your vehicle specifications to get comprehensive fuel consumption predictions, 
            sustainability analysis, and personalized recommendations.
          </p>
        </div>

        {/* Primary Tools - Prediction Form & Sustainability Score */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FuelPredictionForm onPrediction={handlePrediction} />
          </div>
          <div>
            <SustainabilityScore
              fuelConsumption={prediction.fuelConsumption}
              vehicleClass={prediction.formData?.vehicleClass || "COMPACT"}
              fuelType={prediction.formData?.fuelType || "X"}
              co2Rating={prediction.formData?.co2Rating || 5}
            />
          </div>
        </div>

        {/* Analysis Tools Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <WhatIfSimulator
            baselineData={prediction.formData && prediction.fuelConsumption ? {
              engineSize: prediction.formData.engineSize,
              cylinders: prediction.formData.cylinders,
              transmission: prediction.formData.transmission,
              fuelConsumption: prediction.fuelConsumption,
            } : null}
          />
          <CarbonCostEstimator
            fuelConsumption={prediction.fuelConsumption}
            fuelType={prediction.formData?.fuelType || "X"}
          />
        </div>

        {/* Analysis Tools Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <EfficiencyBenchmark
            fuelConsumption={prediction.fuelConsumption}
            vehicleClass={prediction.formData?.vehicleClass || "COMPACT"}
          />
          <ExplainableAIPanel
            formData={prediction.formData}
            fuelConsumption={prediction.fuelConsumption}
          />
        </div>

        {/* Analysis Tools Row 3 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <SmartRecommendations
            formData={prediction.formData}
            fuelConsumption={prediction.fuelConsumption}
          />
          <PolicyAwareness
            fuelConsumption={prediction.fuelConsumption}
            co2Rating={prediction.formData?.co2Rating || 5}
          />
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <AnalyticsDashboard />
        </div>

        {/* Info Cards Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Educational Resources</h2>
            <p className="text-gray-400">Learn more about fuel efficiency and sustainable driving</p>
          </div>
          <InfoCards />
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-700/50">
          <p className="text-gray-500 text-sm">
            Fuel Efficiency & Emissions Intelligence System
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Built for research and educational purposes. No paid APIs used.
          </p>
        </footer>
      </main>

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
        aria-label="Open chatbot"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {predictionContext && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-gray-900" />
        )}
      </button>

      {/* Chatbot Panel */}
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        predictionContext={predictionContext}
      />
    </div>
  )
}

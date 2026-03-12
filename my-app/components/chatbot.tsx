"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import type { PredictionFormData } from "./fuel-prediction-form"

interface Message {
  id: number
  type: "user" | "bot"
  text: string
}

interface PredictionContext {
  formData: PredictionFormData
  fuelConsumption: number
}

// Knowledge base for rule-based chatbot
const knowledgeBase: Record<string, string> = {
  "co2 emission": `**What is CO2 Emission?**\n\nCO2 (Carbon Dioxide) emission refers to the release of carbon dioxide gas into the atmosphere, primarily from burning fossil fuels. In vehicles:\n\n- A typical car emits about 4.6 metric tons of CO2 per year\n- CO2 emissions are directly proportional to fuel consumption\n- Higher fuel consumption = more CO2 released\n- CO2 is a major greenhouse gas contributing to climate change`,
  
  "eco-friendly fuel": `**Eco-Friendly Fuels Comparison**\n\n**Electric (EV)**: Zero direct emissions, cleanest option\n\n**Ethanol (E85)**: Made from plants, reduces CO2 by 20-40%\n\n**Hybrid**: Combines electric + gasoline, 30-50% less emissions\n\n**Diesel**: 15-20% more efficient than petrol, but higher NOx\n\n**Petrol (Gasoline)**: Most common, moderate emissions\n\nFor eco-friendliness: EV > Hybrid > Ethanol > Diesel > Petrol`,
  
  "cylinders fuel": `**How Cylinders Affect Fuel Efficiency**\n\nMore cylinders generally mean:\n\n- **More power** but **higher fuel consumption**\n- 4-cylinder: Most fuel-efficient, suitable for daily driving\n- 6-cylinder: Balanced power and efficiency\n- 8+ cylinders: High performance, lowest fuel efficiency\n\n**Tip:** Choose the minimum cylinders needed for your driving requirements to maximize fuel efficiency.`,
  
  "petrol diesel": `**Petrol vs Diesel Emissions**\n\n**Petrol (Gasoline):**\n- Lower particulate matter\n- Higher CO2 per liter burned\n- Better for short trips\n\n**Diesel:**\n- 15-20% better fuel economy\n- Higher NOx emissions\n- More CO2 efficient per km\n- Better for long-distance driving\n\n**Overall:** Diesel produces less CO2 per kilometer but more harmful particulates.`,
  
  "estimate co2": `**Estimating CO2 Output**\n\n**Formula:** CO2 (kg) = Fuel Consumed (L) x Emission Factor\n\n**Emission Factors:**\n- Petrol: 2.31 kg CO2/liter\n- Diesel: 2.68 kg CO2/liter\n- E85 Ethanol: 1.61 kg CO2/liter\n\n**Example:**\nIf you consume 10 L/100km of petrol:\n10 x 2.31 = **23.1 kg CO2 per 100 km**\n\n**High fuel consumption** (>12 L/100km) = **>27.7 kg CO2/100km**`,
  
  "transmission": `**Transmission Types & Fuel Efficiency**\n\n**M (Manual):** Best control, can be most efficient with skilled driving\n\n**A (Automatic):** Convenient, modern ones are very efficient\n\n**AM (Automated Manual):** Clutchless manual, good efficiency\n\n**AV (Automatic Variable/CVT):** Optimizes engine RPM, often most fuel-efficient\n\n**AS (Auto Select Shift):** Combines auto convenience with manual control\n\n**Ranking (Efficiency):** CVT > Manual >= Modern Auto > AM > Older Auto`,
  
  "engine size": `**Engine Size & Fuel Consumption**\n\nEngine size (displacement in liters) directly affects fuel efficiency:\n\n- **1.0-1.5L:** Most economical, city driving\n- **1.6-2.0L:** Balanced performance and efficiency\n- **2.1-3.0L:** Higher power, moderate consumption\n- **3.0L+:** Performance-focused, highest consumption\n\n**Rule of thumb:** Each 0.5L increase can mean 1-2 L/100km more fuel consumption.`,
  
  "vehicle class": `**Vehicle Classes & Fuel Efficiency**\n\n**Most Efficient:**\n- Two-Seater\n- Subcompact\n- Compact\n\n**Moderate:**\n- Mid-Size\n- Station Wagon - Small\n- SUV - Small\n\n**Least Efficient:**\n- Full-Size\n- SUV - Standard\n- Pickup Truck\n- Van - Passenger/Cargo\n\n**Tip:** Choose the smallest vehicle class that meets your needs.`,
  
  "reduce emissions": `**Tips to Reduce Vehicle Emissions**\n\n1. **Maintain tire pressure** - Proper inflation improves efficiency by 3%\n2. **Regular maintenance** - Clean air filters, oil changes\n3. **Smooth driving** - Avoid rapid acceleration/braking\n4. **Reduce idling** - Turn off engine when stationary\n5. **Plan routes** - Combine trips, avoid traffic\n6. **Remove excess weight** - Lighter load = less fuel\n7. **Use cruise control** - Maintains steady speed\n8. **Consider carpooling** - Share rides when possible`,
  
  "ev electric": `**Electric Vehicles (EVs)**\n\n**Benefits:**\n- Zero direct CO2 emissions\n- Lower running costs\n- Reduced maintenance\n- Quiet operation\n\n**Considerations:**\n- Higher initial cost\n- Range limitations\n- Charging infrastructure\n- Battery production emissions\n\n**Future:** EVs are becoming more affordable with increasing range and charging options.`,
  
  "hybrid": `**Hybrid Vehicles Explained**\n\n**Types:**\n- **Mild Hybrid:** Small electric assist\n- **Full Hybrid:** Can run on electric alone short distances\n- **Plug-in Hybrid (PHEV):** Larger battery, 30-50km electric range\n\n**Benefits:**\n- 30-50% better fuel economy\n- Regenerative braking recovers energy\n- Lower emissions than pure combustion\n- No range anxiety like pure EVs\n\n**Best for:** Mixed city/highway driving`,
}

function findAnswer(query: string, predictionContext: PredictionContext | null): string {
  const lowerQuery = query.toLowerCase()
  
  // Context-aware responses based on prediction
  if (predictionContext) {
    const { formData, fuelConsumption } = predictionContext
    const co2Estimate = fuelConsumption * 2.31

    // Why is my emission high?
    if (lowerQuery.includes("why") && (lowerQuery.includes("emission") || lowerQuery.includes("high") || lowerQuery.includes("consumption"))) {
      const reasons: string[] = []
      
      if (formData.engineSize >= 3.0) reasons.push(`- Large engine size (${formData.engineSize}L) significantly increases fuel consumption`)
      if (formData.cylinders >= 6) reasons.push(`- ${formData.cylinders} cylinders require more fuel than a 4-cylinder engine`)
      if (formData.transmission === "A") reasons.push("- Traditional automatic transmission is typically less efficient than CVT or manual")
      if (formData.fuelType === "Z") reasons.push("- Premium gasoline vehicles often have performance-focused engines")
      if (["SUV - STANDARD", "PICKUP TRUCK - STANDARD", "VAN - CARGO", "VAN - PASSENGER"].includes(formData.vehicleClass)) {
        reasons.push(`- ${formData.vehicleClass} is a larger, heavier vehicle class`)
      }
      if (formData.co2Rating <= 4) reasons.push(`- Low CO2 rating (${formData.co2Rating}/10) indicates higher emissions for this class`)
      
      if (reasons.length > 0) {
        return `**Analysis of Your Vehicle's Emissions**\n\nYour predicted consumption: **${fuelConsumption.toFixed(2)} L/100km**\nEstimated CO2: **${co2Estimate.toFixed(1)} g/km**\n\n**Contributing Factors:**\n${reasons.join("\n")}\n\n**Tip:** Consider eco-driving techniques or exploring more efficient alternatives for your next vehicle.`
      }
      return `Your predicted fuel consumption is ${fuelConsumption.toFixed(2)} L/100km, which translates to approximately ${co2Estimate.toFixed(1)} g/km of CO2. This is ${fuelConsumption > 10 ? "above" : fuelConsumption > 7 ? "around" : "below"} average.`
    }

    // How can I reduce fuel cost?
    if (lowerQuery.includes("reduce") && (lowerQuery.includes("fuel") || lowerQuery.includes("cost") || lowerQuery.includes("consumption"))) {
      const tips: string[] = []
      
      if (formData.transmission === "A") tips.push("- Consider a CVT or manual transmission for your next vehicle")
      if (formData.engineSize >= 2.5) tips.push(`- A smaller engine could save 15-25% on fuel`)
      if (formData.cylinders >= 6) tips.push("- A 4-cylinder turbocharged engine can provide similar power with better efficiency")
      
      tips.push("- Practice eco-driving: accelerate smoothly, maintain steady speeds")
      tips.push("- Keep tires properly inflated (can improve efficiency by 3%)")
      tips.push("- Remove unnecessary weight from your vehicle")
      tips.push("- Use cruise control on highways")
      
      return `**How to Reduce Your Fuel Costs**\n\nCurrent consumption: **${fuelConsumption.toFixed(2)} L/100km**\n\n**Recommendations:**\n${tips.join("\n")}\n\nWith these changes, you could potentially save 10-25% on fuel costs.`
    }

    // Is my vehicle eco-friendly?
    if (lowerQuery.includes("eco") || lowerQuery.includes("friendly") || lowerQuery.includes("green") || lowerQuery.includes("sustainable")) {
      let assessment = ""
      if (fuelConsumption <= 6.5) {
        assessment = "**Excellent!** Your vehicle is highly efficient and eco-friendly."
      } else if (fuelConsumption <= 8.5) {
        assessment = "**Good.** Your vehicle has reasonable environmental impact."
      } else if (fuelConsumption <= 11) {
        assessment = "**Moderate.** There's room for improvement in fuel efficiency."
      } else {
        assessment = "**Below average.** Consider ways to reduce your environmental impact."
      }
      
      return `**Eco-Friendliness Assessment**\n\nFuel Consumption: **${fuelConsumption.toFixed(2)} L/100km**\nCO2 Emissions: **${co2Estimate.toFixed(1)} g/km**\nVehicle Class: **${formData.vehicleClass}**\nFuel Type: **${formData.fuelType === "E" ? "Ethanol (Good)" : formData.fuelType === "D" ? "Diesel (Moderate)" : "Gasoline"}**\n\n${assessment}\n\n${fuelConsumption > 8 ? "**Suggestions:** Consider hybrid or electric alternatives for your next vehicle, or implement eco-driving practices." : ""}`
    }

    // My prediction / my vehicle
    if (lowerQuery.includes("my prediction") || lowerQuery.includes("my vehicle") || lowerQuery.includes("my result") || lowerQuery.includes("my car")) {
      return `**Your Latest Prediction Summary**\n\n**Vehicle Specs:**\n- Class: ${formData.vehicleClass}\n- Engine: ${formData.engineSize}L, ${formData.cylinders} cylinders\n- Transmission: ${formData.transmission}\n- Fuel Type: ${formData.fuelType === "X" ? "Regular Gasoline" : formData.fuelType === "Z" ? "Premium Gasoline" : formData.fuelType === "D" ? "Diesel" : "Ethanol (E85)"}\n- CO2 Rating: ${formData.co2Rating}/10\n\n**Results:**\n- Fuel Consumption: **${fuelConsumption.toFixed(2)} L/100km**\n- Est. CO2 Emission: **${co2Estimate.toFixed(1)} g/km**\n- Annual CO2 (15,000 km): **${((fuelConsumption * 150) * 2.31 / 1000).toFixed(2)} tonnes**\n\nAsk me "Why is my emission high?" or "How can I reduce fuel cost?" for personalized advice!`
    }
  }
  
  // Default knowledge base responses
  if (lowerQuery.includes("co2") || lowerQuery.includes("carbon") || lowerQuery.includes("emission")) {
    if (lowerQuery.includes("estimate") || lowerQuery.includes("calculate") || lowerQuery.includes("output") || lowerQuery.includes("high")) {
      return knowledgeBase["estimate co2"]
    }
    if (lowerQuery.includes("reduce") || lowerQuery.includes("lower") || lowerQuery.includes("decrease")) {
      return knowledgeBase["reduce emissions"]
    }
    return knowledgeBase["co2 emission"]
  }
  
  if (lowerQuery.includes("eco") || lowerQuery.includes("friendly") || lowerQuery.includes("green") || lowerQuery.includes("best fuel")) {
    return knowledgeBase["eco-friendly fuel"]
  }
  
  if (lowerQuery.includes("cylinder")) {
    return knowledgeBase["cylinders fuel"]
  }
  
  if ((lowerQuery.includes("petrol") || lowerQuery.includes("gasoline")) && lowerQuery.includes("diesel")) {
    return knowledgeBase["petrol diesel"]
  }
  
  if (lowerQuery.includes("diesel")) {
    return knowledgeBase["petrol diesel"]
  }
  
  if (lowerQuery.includes("transmission") || lowerQuery.includes("manual") || lowerQuery.includes("automatic") || lowerQuery.includes("cvt")) {
    return knowledgeBase["transmission"]
  }
  
  if (lowerQuery.includes("engine") || lowerQuery.includes("displacement") || lowerQuery.includes("liter") || lowerQuery.includes("litre")) {
    return knowledgeBase["engine size"]
  }
  
  if (lowerQuery.includes("vehicle") || lowerQuery.includes("class") || lowerQuery.includes("type") || lowerQuery.includes("suv") || lowerQuery.includes("sedan")) {
    return knowledgeBase["vehicle class"]
  }
  
  if (lowerQuery.includes("reduce") || lowerQuery.includes("tip") || lowerQuery.includes("save") || lowerQuery.includes("improve efficiency")) {
    return knowledgeBase["reduce emissions"]
  }
  
  if (lowerQuery.includes("electric") || lowerQuery.includes("ev") || lowerQuery.includes("battery")) {
    return knowledgeBase["ev electric"]
  }
  
  if (lowerQuery.includes("hybrid") || lowerQuery.includes("phev")) {
    return knowledgeBase["hybrid"]
  }
  
  if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
    const contextMsg = predictionContext 
      ? `\n\nI see you've run a prediction (${predictionContext.fuelConsumption.toFixed(2)} L/100km). Ask me "Why is my emission high?" or "Is my vehicle eco-friendly?" for personalized analysis!`
      : ""
    return `Hello! I'm EcoBot, your fuel efficiency assistant. I can help you with:\n\n- CO2 emissions information\n- Fuel type comparisons\n- Vehicle efficiency tips\n- Engine & transmission effects\n- Sustainable driving practices\n\nWhat would you like to know?${contextMsg}`
  }
  
  if (lowerQuery.includes("help") || lowerQuery.includes("what can you")) {
    const contextMsg = predictionContext 
      ? `\n\n**Since you have a prediction**, you can also ask:\n- "Why is my emission high?"\n- "How can I reduce my fuel cost?"\n- "Is my vehicle eco-friendly?"`
      : ""
    return `I can answer questions about:\n\n- **CO2 Emissions** - What they are, how to calculate\n- **Fuel Types** - Petrol, diesel, ethanol, EV comparison\n- **Vehicle Factors** - Cylinders, engine size, transmission\n- **Eco Tips** - How to reduce your carbon footprint\n- **Vehicle Classes** - Which are most efficient\n\nTry asking: "Which fuel is eco-friendly?" or "How do cylinders affect efficiency?"${contextMsg}`
  }
  
  return `I'm sorry, I don't have specific information about that topic. I'm an informational assistant focused on fuel efficiency and emissions.\n\nTry asking about:\n- CO2 emissions\n- Fuel comparisons (petrol vs diesel)\n- Cylinder effects on fuel efficiency\n- Eco-friendly driving tips\n- Electric or hybrid vehicles${predictionContext ? "\n- Questions about your prediction" : ""}`
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  predictionContext?: PredictionContext | null
}

export default function Chatbot({ isOpen, onClose, predictionContext = null }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm EcoBot, your fuel efficiency assistant. Ask me anything about CO2 emissions, fuel types, or sustainable driving!",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update welcome message when prediction context changes
  useEffect(() => {
    if (predictionContext && messages.length === 1) {
      setMessages([{
        id: 1,
        type: "bot",
        text: `Hello! I'm EcoBot, your fuel efficiency assistant.\n\nI see you've predicted fuel consumption of **${predictionContext.fuelConsumption.toFixed(2)} L/100km** for your ${predictionContext.formData.vehicleClass}.\n\nAsk me:\n- "Why is my emission high?"\n- "How can I reduce my fuel cost?"\n- "Is my vehicle eco-friendly?"\n\nOr ask general questions about fuel efficiency!`,
      }])
    }
  }, [predictionContext, messages.length])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: input,
    }

    setMessages((prev) => [...prev, userMessage])
    
    // Get bot response with prediction context
    const botResponse = findAnswer(input, predictionContext)
    
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: botResponse,
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)

    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Chat Panel */}
      <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">EcoBot</h3>
              <p className="text-emerald-100 text-xs">
                {predictionContext ? "Context-Aware Mode" : "Informational Assistant"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close chatbot"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Context Indicator */}
        {predictionContext && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-emerald-300">
              Using your prediction: {predictionContext.fuelConsumption.toFixed(2)} L/100km
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-emerald-500 text-white rounded-br-md"
                    : "bg-gray-700 text-gray-100 rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={predictionContext ? "Ask about your prediction..." : "Ask about fuel efficiency..."}
              className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
              aria-label="Send message"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {predictionContext ? "Personalized answers based on your prediction" : "Answers based on knowledge base"}
          </p>
        </div>
      </div>
    </div>
  )
}

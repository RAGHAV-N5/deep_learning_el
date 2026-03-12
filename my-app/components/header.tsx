"use client"

import { useState } from "react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Fuel Efficiency & Emissions</h1>
              <p className="text-xs text-emerald-400">Intelligence System</p>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("predict")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm">
              Predict
            </button>
            <button onClick={() => scrollToSection("analytics")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm">
              Analytics
            </button>
            <button onClick={() => scrollToSection("info")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm">
              Learn
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-700/50 flex flex-col gap-3">
            <button onClick={() => scrollToSection("predict")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm text-left py-2">
              Predict
            </button>
            <button onClick={() => scrollToSection("analytics")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm text-left py-2">
              Analytics
            </button>
            <button onClick={() => scrollToSection("info")} className="text-gray-300 hover:text-emerald-400 transition-colors text-sm text-left py-2">
              Learn
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}

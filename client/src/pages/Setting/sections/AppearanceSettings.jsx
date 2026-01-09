"use client"

import { Palette, Sun, Moon, Monitor } from "lucide-react"
import { useState } from "react"

export function AppearanceSettings() {
  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "medium",
    compactMode: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setAppearance((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = () => {
    console.log("[v0] Appearance settings updated:", appearance)
    alert("Appearance settings saved!")
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "auto", label: "Auto", icon: Monitor },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Palette className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
          <p className="text-gray-600">Customize how the app looks</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = appearance.theme === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setAppearance((prev) => ({ ...prev, theme: option.value }))}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                  <p className={`text-sm font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                    {option.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
          <select
            name="fontSize"
            value={appearance.fontSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Compact Mode</p>
            <p className="text-sm text-gray-600">Use a more compact layout</p>
          </div>
          <input
            type="checkbox"
            name="compactMode"
            checked={appearance.compactMode}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

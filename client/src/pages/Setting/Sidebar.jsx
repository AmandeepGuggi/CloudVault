"use client"

import { User, Lock, Bell, Shield, HardDrive, Palette } from "lucide-react"

export default function Sidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "accounts", label: "Accounts", icon: Lock },
    { id: "notification", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <div className="w-64 border-r border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

"use client"

import { Bell } from "lucide-react"
import { useState } from "react"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyDigest: true,
    marketingEmails: false,
  })

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    console.log("[v0] Notification preferences updated:", notifications)
    alert("Notification preferences saved!")
  }

  const notificationItems = [
    { key: "emailNotifications", label: "Email Notifications", description: "Receive emails about your account" },
    { key: "pushNotifications", label: "Push Notifications", description: "Get push notifications on your device" },
    { key: "smsAlerts", label: "SMS Alerts", description: "Receive important alerts via SMS" },
    { key: "weeklyDigest", label: "Weekly Digest", description: "Get a weekly summary of your activity" },
    { key: "marketingEmails", label: "Marketing Emails", description: "Receive promotional offers and updates" },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600">Control how you receive notifications</p>
        </div>
      </div>

      <div className="space-y-4">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="font-medium text-gray-900">{item.label}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                notifications[item.key] ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  notifications[item.key] ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Save Preferences
      </button>
    </div>
  )
}

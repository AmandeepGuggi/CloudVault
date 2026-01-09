"use client"

import { Shield } from "lucide-react"
import { useState } from "react"

export function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    allowMessages: true,
    showOnlineStatus: true,
    allowSearch: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setPrivacy((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = () => {
    console.log("[v0] Privacy settings updated:", privacy)
    alert("Privacy settings saved!")
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
          <p className="text-gray-600">Control your privacy and who can see your information</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
          <select
            name="profileVisibility"
            value={privacy.profileVisibility}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactions</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Allow Direct Messages</p>
                <p className="text-sm text-gray-600">People can send you direct messages</p>
              </div>
              <input
                type="checkbox"
                name="allowMessages"
                checked={privacy.allowMessages}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Show Online Status</p>
                <p className="text-sm text-gray-600">Let others see when you're online</p>
              </div>
              <input
                type="checkbox"
                name="showOnlineStatus"
                checked={privacy.showOnlineStatus}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Allow Search Indexing</p>
                <p className="text-sm text-gray-600">Allow search engines to find your profile</p>
              </div>
              <input
                type="checkbox"
                name="allowSearch"
                checked={privacy.allowSearch}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
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

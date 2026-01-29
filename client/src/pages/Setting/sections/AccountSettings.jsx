"use client"

import { Lock, Smartphone, LogOut, Trash2, AlertCircle, X } from "lucide-react"
import { useState } from "react"
import { BASE_URL } from "../../../utility"
import { useEffect } from "react"
import { useAuth } from "../../../context/AuthContext"

export function AccountSettings() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    username: user.name,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [devices, setDevices] = useState([])
 
  const formatTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};
   const fetchLoggedInDevices = async () => {
  const res = await fetch(`${BASE_URL}/auth/devices`, {
    credentials: "include", // 🔑 important for cookies
  });
   const data = await res.json()
   setDevices(data)
   
  if (!res.ok) {
    throw new Error("Failed to fetch devices");
  }
  
}

useEffect(()=>{
  fetchLoggedInDevices()
}, [])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteVerification, setDeleteVerification] = useState("")
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    alert("Password updated successfully!")
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleLogoutDevice = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/auth/logout-device/${sessionId}`, {
  method: "DELETE",
  credentials: "include",
});
fetchLoggedInDevices()
console.log("device logout res", await response.json());

  }


   const handleLogoutAllDevices = async () => {
      console.log("logout clicked");
    try {
      const response = await fetch(`${BASE_URL}/user/logoutAll`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        // setLoggedIn(false);
      
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } 
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Lock className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600">Manage your account security and devices</p>
        </div>
      </div>

      {/* Password Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Password for mannual Login</h3>

          <div className="space-y-4">
           

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Set Password
        </button>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Devices</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Manage your active sessions and logout from devices where you've logged in
        </p>

        <div className="space-y-3 mb-4">
          {devices.map((device) => (
            <div
              key={device.sessionId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div className="group">
                  <p className="font-medium text-gray-900">
                    {device.deviceName}
                    {device.isCurrentDevice && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Current Device</span>
                    )}
                  </p>
                  <p className="text-sm relative group text-gray-500 cursor-pointer">Last active: {timeAgo(device.lastActiveAt)}</p>
                   <div
    className="absolute  hidden group-hover:block
               bg-gray-200 text-xs px-2 py-1 rounded shadow
               whitespace-nowrap z-50"
  >
    {formatTime(device.lastActiveAt)}
  </div>
                </div>
              </div>
              {!device.isCurrent && (
                <button
                  onClick={() => handleLogoutDevice(device.sessionId)}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          ))}
        </div>
{
  devices.length > 1 ?  <button
          onClick={handleLogoutAllDevices}
          className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout from All Other Devices
        </button> : null
}
       
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data</p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">This action cannot be undone. Please proceed with caution.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "delete my account" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteVerification}
                  onChange={(e) => setDeleteVerification(e.target.value)}
                  placeholder="delete my account"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">I understand that all my data will be permanently deleted</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteVerification.toLowerCase() !== "delete my account" || !deleteConfirmed}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

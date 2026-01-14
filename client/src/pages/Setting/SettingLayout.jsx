
import { useState } from "react"
import { ProfileSettings } from "./sections/ProfileSettings"
import { AccountSettings } from "./sections/AccountSettings"
import { NotificationSettings } from "./sections/NotificationSettings"
import { PrivacySettings } from "./sections/PrivacySettings"
import StorageSettings from "./sections/StorageSettings"
import { AppearanceSettings } from "./sections/AppearanceSettings"
import Sidebar from "./Sidebar"
import { useNavigate } from "react-router-dom";
import SettingHeader from "./sections/SettingHeader"


// import Sidebar from "./Sidebar"
// import { ProfileSettings } from "./Pro"
// import { AccountSettings } from "./sections/AccountSettings"
// import { NotificationSettings } from "./notification-settings"
// import { PrivacySettings } from "./privacy-settings"
// import { StorageSettings } from "./storage-settings"
// import { AppearanceSettings } from "./appearance-settings"

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("accounts")
  const navigate = useNavigate()

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />
      case "accounts":
        return <AccountSettings />
      case "notification":
        return <NotificationSettings />
      case "privacy":
        return <PrivacySettings />
      case "storage":
        return <StorageSettings />
      case "appearance":
        return <AppearanceSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
   <div>

  <SettingHeader />
  {/* <Topbar /> */}


     {/* <div className="flex h-screen bg-gray-50"> */}
     <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </div>
    </div>
   </div>
  )
}

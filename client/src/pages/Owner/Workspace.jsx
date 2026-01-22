'use client';

import { useState } from 'react'
import OwnerDashboardLayout from './components/OwnerDashboardLayout'
import UsersManagement from './components/UsersManagement'
import DeletedUsers from './components/DeletedUsers'
import ActivitySummary from './components/ActivitySummary'
import UserFilesPage from './components/UserFilesPage'

export default function App() {
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewingUserFiles, setViewingUserFiles] = useState(false)

  // If viewing user files, show the files page
  if (viewingUserFiles && selectedUser) {
    return (
      <OwnerDashboardLayout>
        <UserFilesPage
          user={selectedUser}
          onBack={() => {
            setViewingUserFiles(false)
            setSelectedUser(null)
          }}
        />
      </OwnerDashboardLayout>
    )
  }

  return (
    <OwnerDashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="border-b border-(--border) pb-6">
          <h1 className="text-3xl font-bold text-(--foreground)">CloudVault Owner Control</h1>
          <p className="mt-2 text-sm text-(--muted-foreground)">
            Role: <span className="font-semibold text-(--accent)">Owner</span> • Full access and accountability required
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-8 ">
          {/* Primary Content - Users Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-[color:var(--border)]">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'users'
                    ? 'text-[color:var(--accent)]'
                    : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
                }`}
              >
                Active Users
                {activeTab === 'users' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--accent)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'deleted'
                    ? 'text-[color:var(--accent)]'
                    : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
                }`}
              >
                Deleted Users
                {activeTab === 'deleted' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--accent)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'deleted'
                    ? 'text-[color:var(--accent)]'
                    : 'text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]'
                }`}
              >
                Recent activity
                {activeTab === 'activity' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--accent)]" />
                )}
              </button>
            </div>

            {/* Content Sections */}
            {activeTab === 'users' && (
              <UsersManagement
                onSelectUser={(user) => {
                  setSelectedUser(user)
                  setViewingUserFiles(true)
                }}
              />
            )}
            {activeTab === 'deleted' && <DeletedUsers />}
            {activeTab === 'activity' && <ActivitySummary />}
          </div>

          {/* Sidebar - Activity Summary */}
       
        </div>
      </div>
    </OwnerDashboardLayout>
  )
}

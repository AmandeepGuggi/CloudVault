'use client';

import { useState } from 'react'
import OwnerDashboardLayout from './components/OwnerDashboardLayout'
import UsersManagement from './components/UsersManagement'
import DeletedUsers from './components/DeletedUsers'
import ActivitySummary from './components/ActivitySummary'
import UserFilesPage from './components/UserFilesPage'
import { useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewingUserFiles, setViewingUserFiles] = useState(false)
   const [serverError, setServerError] = useState("kf")
  const [secondsLeft, setSecondsLeft] = useState(5);

   useEffect(() => {
     if (!serverError || secondsLeft === 0) return;
   
     const interval = setInterval(() => {
       setSecondsLeft(prev => prev - 1);
     }, 1000);
   
     return () => clearInterval(interval);
   }, [serverError, secondsLeft]);
   
   useEffect(() => {
     if (secondsLeft === 0 && serverError) {
       setServerError("");
     }
   }, [secondsLeft, serverError]);
   
   
  // If viewing user files, show the files page
  if (viewingUserFiles && selectedUser) {
    return (
      <OwnerDashboardLayout>
        <UserFilesPage
        serverError={serverError}
        setServerError={setServerError}
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
                {serverError && (
                  <div onClick={() => {setServerError(""); setSecondsLeft(5)}}  className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
                    <div className="bg-red-200 border border-red-600 text-red-900 px-6 py-3 rounded-md shadow-lg text-sm font-medium">
                      <span>{serverError}</span>
                      <span className="text-xs mx-2 opacity-70">
                        ({secondsLeft}s)
                      </span>
                    </div>
                  </div>
                )}
            {/* Content Sections */}
            {activeTab === 'users' && (
              <UsersManagement
              setServerError={setServerError}
                onSelectUser={(user) => {
                  setSelectedUser(user)
                  setViewingUserFiles(true)
                }}
              />
            )}
            {activeTab === 'deleted' && <DeletedUsers
              setServerError={setServerError} />}
            {activeTab === 'activity' && <ActivitySummary 
            serverError={serverError}
              setServerError={setServerError} />}
          </div>

          {/* Sidebar - Activity Summary */}
       
        </div>
      </div>
    </OwnerDashboardLayout>
  )
}

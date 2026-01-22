'use client';

import { useEffect, useState } from 'react'
import { RotateCcw, Trash2, AlertCircle } from 'lucide-react'
import RestoreUserModal from './modals/RestoreUserModal'
import PermanentDeleteModal from './modals/PermanentDeleteModal'
import { BASE_URL } from '../../../utility';


function formatDateForUser(isoString) {
  if (!isoString) return "";

  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


export default function DeletedUsers({setServerError}) {
  const [deletedUsers, setDeletedUsers] = useState([])
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showPermanentModal, setShowPermanentModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const handleRestore = (userId) => {
    setSelectedUser(deletedUsers.find(u => u.id === userId))
    setShowRestoreModal(true)
  }

  const handlePermanentDelete = (userId) => {
    setSelectedUser(deletedUsers.find(u => u.id === userId))
    setShowPermanentModal(true)
  }

  const confirmRestore = async () => {
    const response = await fetch(`${BASE_URL}/owner/users/${selectedUser.id}/restore`, {
          method: "POST",
          credentials: "include"
          })
          if(!response.ok){
      const data = await response.json()
      setServerError(data.error)
    }
          getDeletedUsers()
    setShowRestoreModal(false)
  }

  const confirmPermanentDelete = async () => {
    try{
      const response = await fetch(`${BASE_URL}/owner/users/${selectedUser.id}/hard-delete`,{
        method: "DELETE",
      credentials: "include",
     
    })
    if(!response.ok){
      const data = await response.json()
      setServerError(data.error)
    }
    if(response.ok){

      getDeletedUsers()
    }
  }catch(err){
    console.log(err);
  }finally{
    setShowPermanentModal(false)
  }
  }

   async function getDeletedUsers() {
        // setIsLoading(true)
        const response = await fetch(`${BASE_URL}/owner/users/getDeletedUsers`, {
          method: "GET",
          credentials: "include"
          })
          const data = await response.json()
         if(!response.ok){
      setServerError(data.error)
    }
          setDeletedUsers(data)
          // setIsLoading(false)
      }

      useEffect(()=> {
        getDeletedUsers()
      
      },[])

  return (
    <>
      <div className="card border-orange-200 bg-orange-50">
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[color:var(--warning)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Deleted Users</h2>
            <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
              Users in this section can be restored within 30 days or permanently deleted.
            </p>
          </div>
        </div>

        {deletedUsers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[color:var(--muted-foreground)]">No deleted users</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Deleted Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Deleted By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Reason</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[color:var(--muted-foreground)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedUsers.length>0 && deletedUsers.map(user => (
                  <tr key={user.id} className="border-b border-[color:var(--border)] hover:bg-orange-100/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-[color:var(--foreground)]">{user.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[color:var(--foreground)]">{user.deletedDate}
                      {formatDateForUser(user.deletedAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[color:var(--foreground)]">{user.deletedBy}</td>
                    <td className="px-4 py-4 text-sm text-[color:var(--muted-foreground)]">{user.reason}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(user.id)}
                          className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-green-200 hover:text-green-700 transition-colors"
                          title="Restore user"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(user.id)}
                          className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)] transition-colors"
                          title="Permanently delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-xs text-[color:var(--muted-foreground)]">
          <p>30-day recovery window applies. After 30 days, accounts are automatically purged.</p>
        </div>
      </div>

      {/* Modals */}
      {showRestoreModal && selectedUser && (
        <RestoreUserModal
          user={selectedUser}
          onClose={() => setShowRestoreModal(false)}
          onConfirm={confirmRestore}
        />
      )}

      {showPermanentModal && selectedUser && (
        <PermanentDeleteModal
          user={selectedUser}
          onClose={() => setShowPermanentModal(false)}
          onConfirm={confirmPermanentDelete}
        />
      )}
    </>
  )
}

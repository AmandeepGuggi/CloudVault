
import { useEffect, useState } from 'react'
import { Trash2, FileText, Shield, UserX, Edit2, ChevronDown, LogOut } from 'lucide-react'
import RoleAssignmentModal from './modals/RoleAssignmentModal'
import DeleteUserModal from './modals/DeleteUserModal'
import FileAccessModal from './modals/FileAccessModal' // Import FileAccessModal
import ForceLogoutModal from './modals/ForceLogoutModal';
import { BASE_URL, formatBytes } from '../../../utility';



const roleColors = {
  Owner: 'bg-purple-100 text-purple-800',
  Admin: 'bg-blue-100 text-blue-800',
  Editor: 'bg-green-100 text-green-800',
  User: 'bg-gray-100 text-gray-800'
}


export default function UsersManagement({ onSelectUser, setServerError }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteReason, setDeleteReason] = useState("");
 

  const handleRoleChange = (userId) => {
    setSelectedUser(users.find(u => u.id === userId))
    setShowRoleModal(true)
  }

  const handleFileAccess = (userId) => {
    const user = users.find(u => u.id === userId)
    setSelectedUser(user)
    setShowFileModal(true)
    // Call parent callback to navigate to files page
    onSelectUser(user)
  }

  const handleDelete = async (userId) => {
   setSelectedUser(users.find(u => u.id === userId))
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
     try{
    setIsLoading(true)
      const response = await fetch(`${BASE_URL}/owner/users/${selectedUser.id}/soft-delete`,{
        method: "DELETE",
       credentials: "include",
      headers: {
  "Content-Type": "application/json"
},
      body: JSON.stringify({deleteReason})
    })
    if(!response.ok){
      const data = await response.json()
      setServerError(data.error)
    }
    if(response.ok){

      getAllUsers()
      setIsLoading(false)
       setShowDeleteModal(false)
    }
  }catch(err){
    setIsLoading(false)
  }finally{
    setIsLoading(false)
  }
    setShowDeleteModal(false)
  }
  const handleForceLogout = (userId) => {
    setSelectedUser(users.find(u => u.id === userId))
    setShowLogoutModal(true)
  }
   const confirmLogout = async () => {
     try{
    setIsLoading(true)
      const response = await fetch(`${BASE_URL}/owner/users/${selectedUser.id}/logout`,{
        method: "POST",
      credentials: "include"
    });
    if(!response.ok){
      const data = await response.json()
      setServerError(data.error)
    }
    getAllUsers()
    setIsLoading(false)
    setShowLogoutModal(false)
    
  }catch(err){
    setIsLoading(false)
    setShowLogoutModal(false)
  }
    setShowLogoutModal(false)
  }

  const ChangeRoleSubmit = async (newRole) => {
    console.log(newRole);
    try {
         const response = await fetch(`${BASE_URL}/owner/users/${selectedUser.id}/role`,{
        method: "PATCH",
      credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({ newRole }),
    })

    if(!response.ok){
      const data = await response.json()
      setServerError(data.error)
    }
    getAllUsers()
    setShowRoleModal(false)
    }catch(err){
      console.log("err changing role", err);
    }
  }



  async function getAllUsers() {
        setIsLoading(true)
        const response = await fetch(`${BASE_URL}/owner/users/getAllUsers`, {
          method: "GET",
          credentials: "include"
          })
          const data = await response.json()
        if(!response.ok){
      setServerError(data.error)
    }
          setUsers(data)
          setIsLoading(false)
      }

   useEffect(()=> {
    getAllUsers()
   },[])

  return (
    <>
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">User Accounts</h2>
          <span className="text-xs text-[color:var(--muted-foreground)]">
            {users.length} active users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Storage</th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-[color:var(--muted-foreground)]">Last Active</th> */}
                <th className="px-4 py-3 text-right text-xs font-medium text-[color:var(--muted-foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-[color:var(--border)] hover:bg-[color:var(--secondary)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] flex items-center justify-center text-xs font-bold">
                        {/* {user.avatar} */}
                        <img src={user.avatar} alt="avatar" className='rounded-full' />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[color:var(--foreground)]">{user.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[color:var(--foreground)]">{formatBytes(user.storage)}/100MB</td>
                  {/* <td className="px-4 py-4 text-sm text-[color:var(--muted-foreground)]">{user.lastActive}</td> */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(user.id)}
                        className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] transition-colors"
                        title="Change role"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFileAccess(user.id)}
                        className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] transition-colors"
                        title="Access files"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)] transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                     {user.isLoggedIn? 
                      <button
                        onClick={() => handleForceLogout(user.id)}
                        className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)] transition-colors"
                        title="Force Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>: <button
                        className="p-2 rounded-md text-[color:var(--muted-foreground)] hover:bg-[color:var(--destructive)] hover:text-[color:var(--destructive-foreground)] transition-colors"
                        title="Not logged"
                      >
                        <UserX className="w-4 h-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="mt-4 text-xs text-[color:var(--muted-foreground)]">
          <p>All user actions are audited and logged</p>
        </div>
      </div>






      {/* Modals */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          user={selectedUser}
          onClose={() => setShowRoleModal(false)}
          onConfirm={ChangeRoleSubmit}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          setDeleteReason={setDeleteReason}
          deleteReason={deleteReason}
          setServerError={setServerError}
        />
      )}

      {showLogoutModal && selectedUser && (
        <ForceLogoutModal
          user={selectedUser}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
          setServerError={setServerError}
        />
      )}
    </>
  )
}

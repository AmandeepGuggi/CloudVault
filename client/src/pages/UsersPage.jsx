import { useEffect, useState } from 'react';
import './UsersPage.css';
import { BASE_URL } from '../utility';
import { useNavigate } from 'react-router-dom';



export default function UsersPage() {
  const [users, setUsers] = useState([]);
    const navigate = useNavigate()
  const [self, setSelt] = useState({})
  const [loading, setLoading] = useState(false)
  const [confirmData, setConfirmData] = useState({
  open: false,
  userId: null,
  type: null, // "logout" | "delete"
  username: ""
});
const openConfirm = (userId, type, username) => {
  setConfirmData({
    open: true,
    userId,
    type,
    username
  });
};

const handleConfirm = async () => {
  const { userId, type } = confirmData;

  if (type === "logout") {
    await logoutSpecificUser(userId);
  }

  if (type === "delete") {
    console.log("hi");
    await deleteSpecificUser(userId);
  }

  setConfirmData({ open: false, userId: null, type: null });
};

const handleCancel = () => {
  setConfirmData({ open: false, userId: null, type: null });
};

  const logoutSpecificUser = async(userId) => {
  try{
    setLoading(true)
      const response = await fetch(`${BASE_URL}/user/${userId}/logout`,{
        method: "POST",
      credentials: "include"
    })
    const data = await response.json()
    getAllUsers()
    setLoading(false)
  }catch(err){
    setLoading(false)
    console.log("cannot logout", err);
  }
  }
  const deleteSpecificUser = async(userId) => {
  try{
    setLoading(true)
      const response = await fetch(`${BASE_URL}/user/${userId}/delete`,{
        method: "DELETE",
      credentials: "include"
    })
    console.log(response);
    if(response.ok){

      getAllUsers()
      setLoading(false)
    }
  }catch(err){
    setLoading(false)
    console.log("cannot delete", err);
  }finally{
    setLoading(false)
  }
  }

   async function getAllUsers() {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
        })
        if(response.status===403){
          navigate("/app")
        }
        const data = await response.json()
        setUsers(data)
        setLoading(false)
    }
  useEffect(()=> {
   
    async function user() {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/user`, {
        method: "GET",
        credentials: "include"
        })
        if(response.status!==200){
          navigate("/app")
        }
        const data = await response.json()
       
        setSelt(data)
        setLoading(false)
    }

    getAllUsers()
    user()
  },[])
if (loading === true) return <div>Loading...</div>

if (self.role === "User") {
  return <div>You think you can spy on this page? Huh! This page is not for you, GET LOST!</div>;
}

  return (
  <>
    
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <h3>{self.name}: {self.role} </h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>logout</th> 
        {  self.role === "Admin" &&  <th>Delete</th> }
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name} {user.email === self.email ? <b>(You)</b>: ""} </td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? 'Logged In' : 'Logged Out'}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => openConfirm(user.id, "logout", user.name)}
                  // onClick={() => logoutUser(user.id)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>
              { self.role==="Admin" &&  <td>
                <button
                  className="delete-button"
                  onClick={() => openConfirm(user.id, "delete", user.name)}
                  disabled={user.email === self.email}
                >
                  Delete
                </button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
  open={confirmData.open}
  message={
    confirmData.type === "logout"
      ? `Are you sure you want to log out ${confirmData.username} ?`
      : `Are you sure you want to delete ${confirmData.username} ?`
  }
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
    </div>
  </>
  );
}




 function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <p className="text-gray-800 text-sm">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
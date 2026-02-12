import { createContext, useContext, useState } from "react";
import { fetchUser, logoutUser } from "../api/userApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 

 const getUser = async () => {
    try {
      const user = await fetchUser();
      setUser(user);
      return user;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔁 used AFTER login / refresh / device change
  const refreshUser = async () => {
    setLoading(true);
    return await getUser();
  };

  const logout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.log("error logging out", err);
    } finally {
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        getUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utility";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔴 CORE: ask backend who you are
  const getUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user/`, {
        method: "GET",
        credentials: "include"
      });
      if (res.status === 401 || res.status === 403) {
      setUser(null);
      return null;
    }
      
      if (!res.ok) {
      setUser(null);
      return null;
    }else{
      const user = await res.json()
      setUser(user);
      return user;
    }
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
      await axios.post(
        `${BASE_URL}/user/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
    }
  };

  // 🧠 Run once on app load
  useEffect(() => {
    getUser();
  }, []);

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

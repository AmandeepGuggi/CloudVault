import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ⏳ WAIT: backend hasn’t answered yet
  if (loading) {
    return null; // or a spinner if you want
  }

  // ❌ NOT LOGGED IN
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }
//   else if(user){
//       return (
//       <Navigate
//         to="/app"
//         replace
//         state={{ from: location }}
//       />
//     );
//   }

  // ✅ LOGGED IN
  return <Outlet />;
};

export default RequireAuth;

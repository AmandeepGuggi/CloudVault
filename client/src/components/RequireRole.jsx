import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireRole = ({ allowed }) => {
  const { user } = useAuth();
  console.log(user);

  if (!allowed.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default RequireRole;

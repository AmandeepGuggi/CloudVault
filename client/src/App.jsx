import Dashboard from "./Dashboard"
import LandingPage from "./pages/LandingPage"

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"
import Starred from "./pages/Starred"
import Bin from "./pages/Bin"
import DashboardLayout from "./DashboardLayout"
import Settings from "./pages/Setting/Settings"
import { AuthProvider } from "./context/AuthContext"
import UsersPage from "./pages/UsersPage"
import Workspace from "./pages/Owner/Workspace"
import Home from "./pages/Home"
import RequireAuth from "./components/RequireAuth"
import RequireRole from "./components/RequireRole"

const router = createBrowserRouter([
   {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/settings",
    element: <Settings />
  },
  {
    path: "/users",
    element: <UsersPage />
  },
  {
    path: "/workspace",
    element: <Workspace />
  },
  {
  element: <RequireAuth />,
  children: [
    {
      path: "/app",
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: ":dirId?", element: <Home /> },
        { path: "starred", element: <Starred /> },
        { path: "bin", element: <Bin /> },
       
      ],
    },
     {
      element: <RequireRole allowed={["Owner", "Admin"]} />,
      children: [
        { path: "/users", element: <UsersPage /> },
        { path: "/workspace", element: <Workspace /> },
      ],
    },
    { path: "/settings", element: <Settings /> },
  ],
  
},
 {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Home /> },         
      { path: ":dirId?", element: <Home /> },  //app/29736e917361976
      { path: "starred", element: <Starred /> },   // /app/starred
      { path: "bin", element: <Bin /> },           // /app/bin
    ]
  }

])

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
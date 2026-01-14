import Dashboard from "./Dashboard"
import LandingPage from "./pages/LandingPage"

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"
import Starred from "./pages/Starred"
import Bin from "./pages/Bin"
import DashboardLayout from "./DashboardLayout"
import Home from "./pages/home"
import Settings from "./pages/Setting/Settings"

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
    <RouterProvider router={router} />
  )
}

export default App
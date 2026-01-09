import Dashboard from "./Dashboard"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"
import Starred from "./pages/Starred"
import Bin from "./pages/Bin"
import DashboardLayout from "./DashboardLayout"
import Home from "./pages/home"

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
  // {
  //   path: "/directory",
  //   element: <Dashboard />,
  // },
  // {
  //   path: "/directory/:dirId?",
  //   element: <Dashboard />
  // },
  // {
  //   path: "/bin",
  //   element: <Bin />
  // },
  // {
  //   path: "/starred",
  //   element: <Starred />
  // },
 {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Home /> },          // /app
      { path: "home", element: <Home /> },          // /app
      { path: ":dirId?", element: <Home /> },
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
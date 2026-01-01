import Dashboard from "./Dashboard"
import HomePage from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"

const router = createBrowserRouter([
  {
    path: "/directory",
    element: <Dashboard />
  },
  {
    path: "/directory/:dirId?",
    element: <Dashboard />
  },
  // {
  //   path: "/login",
  //   element: <Login />
  // },
  // {
  //   path: "/register",
  //   element: <Register />
  // },
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
])

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
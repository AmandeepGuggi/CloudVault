import Dashboard from "./Dashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: "/directory",
    element: <Dashboard />
  },
  {
    path: "/",
    element: <Dashboard />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  }
])

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
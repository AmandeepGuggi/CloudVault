import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext.jsx'

const clientId = "894015875708-tgmt1c9nb33autr0ri8vsjn66t79fhji.apps.googleusercontent.com"
createRoot(document.getElementById('root')).render(
 
    <GoogleOAuthProvider clientId={clientId}>
      {/* <AuthProvider> */}

      <App />
      {/* </AuthProvider> */}
    </GoogleOAuthProvider>

)

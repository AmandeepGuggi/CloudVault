import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import VerifyOtp from "../Register/VerifyOtp";
import { useNavigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import { FaCloud } from "react-icons/fa";
import { loginUser } from "../../api/userApi";

export default function LoginPage() {
  const navigate = useNavigate();
const location = useLocation();

const from = location.state?.from?.pathname || "/app";

const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      email: "gamerzonly369@gmail.com",
      password: "Abcd@12345",
      rememberMe: false
    });
    const [serverError, setServerError] = useState("");
   
 


    const handleChange = (e) => {
  const { name, type, value, checked } = e.target;

  if (serverError) {
    setServerError("");
  }

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};



      const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
          setIsSubmitting(true);
         await loginUser(formData); 
          navigate(from, { replace: true });
        } catch (err) {
          console.error("Login error:", err);
          setServerError("An error occurred. Please try again.");
          setIsSubmitting(false);
        }
      };

   const [currentScreen, setCurrentScreen] = useState("login");



  const navigateToScreen = (screen) => {
  setCurrentScreen(screen);

  if (screen === "login") {
    setOtp("");
    setCountdown(0);
  }

  if (screen === "forgotPassword") {
    setEmailTxt("");
    setOtp("");
  }

  if (screen === "verifyOtp" && otpSent) {
    setOtp("");
  }
};



 const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            emailTxt={formData.email}
            passwordTxt={formData.password}
            handleInputChange={handleChange}
            navigateToScreen={navigateToScreen}
            handleLoginSubmit={handleLoginSubmit}
            isSubmitting={isSubmitting}
            serverError={serverError}
            rememberMe={formData.rememberMe}
            // refreshUser={refreshUser}
            // isSending={isSending}
            // serverError={serverError}
            // showPassword={showPassword}
            // setShowPassword={setShowPassword}
            // isLoading={isLoading}
            />
        );
      case "forgotPassword":
        return (
         <></>
        );
      case "verifyOtp":
        return (
         <VerifyOtp
         emailTxt={formData.email}
         otpTxt={otp}
         onOtpChange={(e) => setOtp(e.target.value)}
         isOtpVerifying={isVerifying}
         otpVerified={otpVerified}
        otpError={otpError}
        handleVerifyOtp={handleRegisterSubmit}
        navigateToScreen={navigateToScreen}
        isSending={isSending}
        resendOtp={resendOtp}
        countdown={countdown}
         />
        );
      case "resetPassword":
        return (
         <></>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
  
        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
           <div onClick={()=> {navigate("/")}} className="flex items-center gap-2.5">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                           <FaCloud className="h-5 w-5 text-white" />
                         </div>
                         <span className="text-xl font-bold tracking-tight text-slate-900">CloudVault</span>
                       </div>
            <nav className=" items-center gap-8 md:flex">
             
              <button onClick={()=> {navigate("/register")}} className="px-6 py-2 border-2 border-blue-600 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors">
                Register
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="my-auto">

       {renderScreen()}
      </main>
     
     
    </div>
  );
}


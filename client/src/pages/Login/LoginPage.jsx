import React, { useState } from "react";
import { FolderOpen, Globe } from "lucide-react";
import VerifyOtp from "../Register/VerifyOtp";
import { useNavigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import { BASE_URL } from "../../utility";

export default function LoginPage() {
  const navigate = useNavigate();

const [otp, setOtp] = useState("");
const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      rememberMe: false
    });
    const [serverError, setServerError] = useState("");
   
  
    // const handleChange = (e) => {
    //   const { name, value } = e.target;
  
    //   // Clear the server error as soon as the user starts typing in either field
    //   if (serverError) {
    //     setServerError("");
    //   }
  
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     [name]: value,
    //   }));
    // };


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
          setIsSubmitting(true)
          const response = await fetch(`${BASE_URL}/user/login`, {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          const data = await response.json();
          if (data.error) {
            setServerError(data.error);
            setIsSubmitting(false)
          } 
          else if(response.status===201) {
              navigate("/app");
             setIsSubmitting(false)
          }
            
    
        } catch (error) {
          setIsSubmitting(false)
          console.error("Error:", error);
          setServerError("Something went wrong. Please try again.");
        }
      }

        const handleOtpSubmit = async () => {
        const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            otp
          }),
        });
      
        const data = await res.json();
      
        if (res.ok) {
          navigate("/directory"); // ✅ ONLY HERE
        } else {
          alert("Invalid OTP");
        }
      };

      const handleVerifyOtp = async () => {
        try {
          setIsVerifyingOtp(true);
      
          const res = await fetch(`${BASE_URL}/user/login-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: formData.email,
              otp,
            }),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
            alert(data.error || "Invalid OTP");
            return;
          }
      
          navigate("/directory");
      
        } finally {
          setIsVerifyingOtp(false);
        }
      };

 //-----------------------------------------------------------------------//
 //-----------------------------------------------------------------------//

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
            <div onClick={()=> navigate("/")} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CloudVault</span>
            </div>
            <nav className=" items-center gap-8 md:flex">
             
              <button onClick={()=> {navigate("/signUp")}} className="px-6 py-2 border-2 border-blue-600 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors">
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


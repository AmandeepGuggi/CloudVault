import React from "react";
import { FolderOpen, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {BASE_URL} from "../../utility/index" 
import RegisterScreen from "./RegisterScreen";
import VerifyOtp from "./VerifyOtp";

export default function RegisterPage() {

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


 const [formData, setFormData] = useState({
    fullname: "Amandeep Kaur",
    email: "a2guggi11052002@gmail.com",
    password: "Abcd@12345",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

   const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

    // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

    // Send OTP handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { email } = formData;
    if (!email) {
      setOtpError("Please enter your email first.");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setOtpError("");
        navigateToScreen("verifyOtp")
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

    const resendOtp = async (e) => {
    e.preventDefault();
    const { email } = formData;
    if (!email) {
      setOtpError("Please enter your email first.");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setOtpError("");
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

    // Verify OTP handler
  const handleVerifyOtp = async (e) => {
     e.preventDefault();
    const { email } = formData;
    if (!otp) {
      setOtpError("Please enter OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpVerified(true);
        setOtpError("");
        navigate("/directory")
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

 

  const handleRegisterSubmit =  async (e) => {
    e.preventDefault()
    setIsSuccess(false)
    //  if (!otpVerified) {
    //   setOtpError("Please verify your email with OTP before registering.");
    //   return;
    // }
      try {
         setIsVerifying(true);
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify({...formData, otp}),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) {
  console.log("Server response:", data);
  setServerError( data.error || data.message || "Registration failed");
}
else if(data.status === 201){
        setIsSuccess(true);
         setOtpVerified(true);
        setOtpError("");
        setTimeout(() => {
          navigate("/directory");
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  }

  //-----------------------------------------------------//
  //-----------------------------------------------------//

  const [currentScreen, setCurrentScreen] = useState("register");



  const navigateToScreen = (screen) => {
  setCurrentScreen(screen);

  if (screen === "register") {
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
      case "register":
        return (
          <RegisterScreen
           fullnameTxt={formData.fullname}
            emailTxt={formData.email}
            passwordTxt={formData.password}
            handleInputChange={handleChange}
            navigateToScreen={navigateToScreen}
            handleSendOtp={handleSendOtp}
            isSending={isSending}
            serverError={serverError}
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div onClick={()=> navigate("/")} className="flex items-center gap-2.5 ">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Cloudex</span>
            </div>
            <nav className="items-center gap-8 md:flex">
             
              <button onClick={()=> {navigate("/login")}} className="px-6 py-2 border-2 border-blue-600 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors">
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>
   {isLoading && (
     <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm font-medium">loading...</p>
      </div>
    </div>
   )}

      {/* Main */}
       {renderScreen()}
    
    </div>
  );
}

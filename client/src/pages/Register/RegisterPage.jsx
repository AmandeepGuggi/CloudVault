import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RegisterScreen from "./RegisterScreen";
import VerifyOtp from "./VerifyOtp";
import { FaCloud } from "react-icons/fa";
import { sendOtp, sendRegisterOtp, verifyOtp, verifyRegisterOtp } from "../../api/authApi";


export default function RegisterPage() {

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [error, setError] = useState("")

 const [formData, setFormData] = useState({
    fullname: " Naina Singh",
    email: "gamerzonly369@gmail.com",
    password: "Abcd@12345",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

   const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === "email" || name === "password" || name === "fullname"){
      setError("");
    }
    if (name === "email") {
      setServerError("");
      setError("");
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
    const { email, password, fullname } = formData;
    if (!email) {
      setError("Please enter you email")
      return;
    }
    if( password.length <8 ){
      setError("Minimum password length should be  8")
      return
    }
    if( fullname.length < 3 ){
      setError("Minimum name length should be 3")
      return
    }

    try {
      setIsSending(true);
      const res = await sendRegisterOtp(email);
      console.log("1. sending-reg-otp", res);
      // const data = await res.json();
       if (res.error ) {
    setError(res.error || "Failed to send OTP.");
    return;
  }
      if (res.message) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setError("");
        navigateToScreen("verifyOtp")
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

    const resendOtp = async (e) => {
    e.preventDefault();
    const { email } = formData;
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      setIsSending(true);
      setError("")
      const res = await sendOtp(email);
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setError("");
       
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault()

    if (!otp) {
    setError("Please enter OTP.");
    return;
  }
 try{
  setIsVerifying(true);
    const res = await verifyRegisterOtp(formData.email, otp, formData.fullname, formData.password);
    console.log({res});
    if(res.error){
      setError(res.error);
      return;
    }
    if (res.message && res.status === 201) {
      navigate("/app", { replace: true });
    }
 }catch(err){
  setError(err.error || "Failed to complete registration.");
} finally {
  setIsVerifying(false);
}
};


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
            error={error}
            setError={setError}
            
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
        navigateToScreen={navigateToScreen}
        isSending={isSending}
        resendOtp={resendOtp}
        countdown={countdown}
        handleFinalRegister={handleFinalRegister}
        otpError={error}
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
            <div onClick={()=> {navigate("/")}} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <FaCloud className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CloudVault</span>
            </div>
            <nav className="items-center gap-8 md:flex">
             
              <button onClick={()=> {navigate("/login")}} className="px-6 py-2 border-2 border-blue-600 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors">
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>
 


      {/* Main */}

       {renderScreen()}
    
    </div>
  );
}

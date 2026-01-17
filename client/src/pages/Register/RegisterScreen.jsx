import React from 'react'

import { GoogleLogin } from '@react-oauth/google'
import { GithubIcon } from "../../components/Icons/GithubIcon";
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../utility';
import FloatingInput from '../../components/FloatingInput';
import { MdEmail } from 'react-icons/md';
import { FiMail } from "react-icons/fi";

import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { FaUser } from "react-icons/fa";

const RegisterScreen = ({handleSendOtp, handleInputChange, fullnameTxt, emailTxt, passwordTxt, isSending, navigateToScreen, serverError}) => {
  const navigate = useNavigate()
    const [focus, setFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
      const [loginError, setLoginError] = useState("")
  const githubLogin = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = "http://localhost:4000/auth/github/callback";

  window.location.href =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=user:email`;
};
  return (
      <div className="flex items-center justify-center px-4 py-">
        <div className="w-full max-w-120 bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h1>

          <form className="space-y-6" onSubmit={handleSendOtp} >
            {/* Full Name */}
            <div>
            
              <FloatingInput
                          icon={<FaUser />}
                          name="fullnameTxt"
                          value={fullnameTxt}
                          onChange={handleInputChange}
                          label="Full name"
                          type="text"
                          />
            </div>

            {/* Email */}
            <div>
              
              <FloatingInput 
                          icon={<FiMail />}
                          name="email"
                          value={emailTxt}
                          onChange={handleInputChange}
                          label="Email Address"
                          type="email"
                          />
            </div>

            {/* Password */}

             <div className="relative mb-6 w-full">
            <label
              className={`absolute transition-all duration-200 pointer-events-none 
        ${
          focus
            ? "-top-3 text-sm text-gray-500"
            : "top-3 text-base text-gray-400"
        }`}
            >
              Password
            </label>

            <input
              value={passwordTxt}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              name="password"
              onFocus={() => setFocus(true)}
              onBlur={(e) => e.target.value === "" && setFocus(false)}
              className="w-full border-b-[1.5px] border-gray-300 focus:border-black outline-none py-3 text-gray-800 pr-8"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3"
            >
              {showPassword ? (
                <Eye className="w-5 text-gray-800" />
              ) : (
                <EyeOff className="w-5 text-gray-800" />
              )}
            </span>

            {/* {<EyeOff /> && <span className="absolute right-0 top-3">{<Eye className="text-gray-400" />}</span>} */}
          </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-[#0061D5] hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#0061D5] hover:underline">Privacy Policy</a>
              </label>
            </div>

             {serverError && <span className="text-sm text-red-500">{serverError}</span>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSending}
              className={` ${isSending ? "bg-blue-300 cursor-not-allowed" : "bg-[#0061D5] hover:bg-[#0052B4] cursor-pointer"} w-full h-12   text-white font-medium rounded text-base transition-colors`}
            >
              {isSending
                ? "Verifing email..."
                : "Get started"}
            </button>


            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or</span>
              </div>
            </div>

            <div className="my-1  gap-2 ">
                    
          
                    <div className="flex w-full mb-2"> 
                      <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        const data = await loginWithGoogle(credentialResponse.credential);
                        console.log(data);
                        if(data.error){
                setLoginError(data.error)
                return
              }
                        if (data.user) {
                          // Handle failed login
                          navigate("/app");
                          return;
                        }
                        return;
                      }}
                      width="500px"
                      onError={() => {
                        console.log("Login Failed");
                      }}
                      useOneTap
                      
                      logo_alignment="center"
                      
                    />
                    </div>
          
                    <button onClick={githubLogin}
                      type="button"
                      className="w-full h-10 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <GithubIcon />
                      <span className="text-gray-700 text-sm font-medium text-nowrap">
                        Sign in with Github
                      </span>
                    </button>
                  </div>
                   {loginError && <p className="text-red-600 text-sm text-center m-3">{loginError}</p> }

            {/* Footer */}
            <div onClick={()=>navigate("/login")} className="text-center pt-4 border-t border-gray-200 mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <span className="text-[#0061D5] cursor-pointer hover:underline font-medium">
                  Login
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
  )
}

export default RegisterScreen
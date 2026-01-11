import React from 'react'

import { GoogleLogin } from '@react-oauth/google'
import { GithubIcon } from "../../components/Icons/GithubIcon";
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../../utility';

const RegisterScreen = ({handleSendOtp, handleInputChange, fullnameTxt, emailTxt, passwordTxt, isSending, navigateToScreen, serverError}) => {
  const navigate = useNavigate()
  return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-12">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h1>

          <form className="space-y-6" onSubmit={handleSendOtp} >
            {/* Full Name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                name="fullname"
                value={fullnameTxt}
                onChange={(e)=> {handleInputChange(e)}}
                placeholder="Enter your full name"
                className="w-full h-12 px-4 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0061D5]"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={emailTxt}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full h-12 px-4 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0061D5]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={passwordTxt}
                onChange={handleInputChange}
                placeholder="Create a password"
                className="w-full h-12 px-4 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0061D5]"
                required
              />
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

            {/* OAuth */}
            <div className="space-y-3">
             
              <GoogleLogin
  onSuccess={credentialResponse => {
    loginWithGoogle(credentialResponse)
    console.log(credentialResponse);
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>;


              <button
                type="button"
                className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <GithubIcon />
                <span className="text-gray-700 font-medium">Sign up with GitHub</span>
              </button>
            </div>

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
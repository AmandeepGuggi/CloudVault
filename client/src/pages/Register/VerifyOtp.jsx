import React from 'react'
import Button from '../../components/Button'

const VerifyOtp = ({emailTxt, otpTxt, onOtpChange, isOtpVerifying, otpVerified, otpError, isSending, handleVerifyOtp, navigateToScreen, resendOtp, countdown, handleFinalRegister}) => {
  return (
    <div className="flex items-center justify-center px-4 py-16">
          {/* Main Content */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-12">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">Verify Your Account</h1>

          <p className="text-center text-gray-600 text-sm">
            We've sent a verification code <span className='text-sm text-gray-400'>{emailTxt}</span> 
          </p>
          <p className="text-center text-gray-600 text-sm mb-8">
           Please enter the code below to continue.
          </p>


          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="text-sm font-semibold text-gray-700 mb-3 block">
                Verification Code
              </label>
              <input type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpTxt}
              onChange={onOtpChange}
              required
  maxLength={4}  
  placeholder="Enter 4-digit OTP" className='w-full h-12 border border-gray-300 rounded-md
             px-4 text-center tracking-widest text-lg font-semibold
             focus:outline-none focus:ring-2 focus:ring-blue-500
             transition no-spinner'/>

 {otpError && <span className="text-red-400">{otpError}</span>}
            
            </div>

            <button type='submit' onClick={handleVerifyOtp} 
            className={`${isOtpVerifying ? "bg-blue-300 cursor-not-allowed": "bg-[#0061D5] cursor-pointer hover:bg-[#0052B4]"} ${otpVerified ? "hidden" : ""} transition-colors duration-200 w-full h-12  text-white font-medium rounded-md text-base`}>
              
               {isOtpVerifying
                  ? "Verifying..."
                  : otpVerified
                    ? "Verified"
                    : "Verify OTP"}
            </button>
            <button type='button' onClick={handleFinalRegister} 
            className={`${ otpVerified ? " hover:bg-green-600 cursor-pointer bg-green-400": " hidden bg-[#76a3d9] cursor-not-allowed "} w-full h-12 transition-colors duration-200 text-white font-medium rounded-md text-base`}>
          
                  Complete Registration
                  
            </button>
               
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <button onClick={resendOtp}
                type="button"
                className={` ${isOtpVerifying || isSending ? "cursor-not-allowed text-blue-300" : "text-[#0061D5] hover:text-[#0052B4] cursor-pointer"}  font-medium text-sm transition-colors`}
              >
                {isOtpVerifying ? "Resend OTP" : isSending ? "sending Otp..." : countdown > 0 ? `${countdown}s` : "Resend otp"}
               
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <button onClick={()=> {navigateToScreen("register")}} type="button" className="text-gray-600 cursor-pointer hover:text-gray-900 text-sm transition-colors">
                ← Back to Sign In
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}

export default VerifyOtp
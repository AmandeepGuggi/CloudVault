import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GithubIcon } from "../../components/Icons/GithubIcon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginWithGoogle } from "../../utility";
import FloatingInput from "../../components/FloatingInput"
import { MdEmail } from "react-icons/md"; 
import { Eye, EyeOff } from "lucide-react";

const LoginScreen = ({
  emailTxt,
  passwordTxt,
  handleInputChange,
  handleLoginSubmit,
  navigateToScreen,
  isSubmitting,
  serverError,
  rememberMe,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    <main className="flex items-center justify-center px-4 py-4">
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded">Loading…</div>
        </div>
      )}
      <div className="w-full max-w-120 bg-white rounded-lg shadow-sm p-10">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Sign In to Your Account
        </h1>

        <form className="space-y-4 w-full" onSubmit={handleLoginSubmit}>
          <div>
            <FloatingInput 
            icon={<MdEmail />}
            name="email"
            value={emailTxt}
            onChange={handleInputChange}
            label="Email Address"
            type="email"
            />
          </div>
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
                <Eye className="text-gray-400" />
              ) : (
                <EyeOff className="text-gray-400" />
              )}
            </span>

            {/* {<EyeOff /> && <span className="absolute right-0 top-3">{<Eye className="text-gray-400" />}</span>} */}
          </div>
          {serverError && <span className="text-red-700">{serverError}</span>}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-12 rounded text-white font-medium transition ${
              isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-[#0061D5] hover:bg-[#0052B4]"
            }`}
          >
            {isSubmitting ? "Signing in…" : "Continue"}
          </button>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                name="rememberMe"
                onChange={handleInputChange}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => navigateToScreen("forgot-password")}
              className="text-sm font-medium text-[#0061D5] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>
        </form>

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
        <p className="text-center text-sm text-gray-600 pt-4 ">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-[#0061D5] cursor-pointer font-medium hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </main>
  );
};

export default LoginScreen;

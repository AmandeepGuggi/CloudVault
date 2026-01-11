import React from "react";
import { GoogleIcon } from "../../components/Icons/GoogleIcon";
import { GoogleLogin } from "@react-oauth/google";
import { GithubIcon } from "../../components/Icons/GithubIcon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginWithGoogle } from "../../utility";

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

  useEffect(() => {
    function handleMessage(event) {
      // ✅ SECURITY CHECK
      if (event.origin !== "http://localhost:4000") return;

      const { data } = event;

      if (data?.message === "success") {
        // hide loader via state (not DOM)
        setLoading(false);
        navigate("/app");
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  return (
    <main className="flex items-center justify-center px-4 py-16">
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded">Loading…</div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-12">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Sign In to Your Account
        </h1>

        <form className="space-y-6" onSubmit={handleLoginSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
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
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={passwordTxt}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              className="w-full h-12 px-4 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0061D5]"
            />
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

        <div className="my-4">
          

          <div className="flex w-full justify-center mb-2"> 
            <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const data = await loginWithGoogle(credentialResponse.credential);
              if (data.email) {
                // Handle failed login
                navigate("/app");
                return;
              }
              console.log(data);
              return;
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            useOneTap
            width="300"
            logo_alignment="center"
            
          />
          </div>

          <button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <GithubIcon />
            <span className="text-gray-700 font-medium text-base">
              Sign in with Github
            </span>
          </button>
        </div>

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

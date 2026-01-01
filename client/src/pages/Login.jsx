import { useNavigate } from "react-router-dom";
import { FaGoogleDrive } from "react-icons/fa";
import { useState } from "react";
import {BASE_URL} from "../utility/index.js"

export default function Login() {
const [showOtpModal, setShowOtpModal] = useState(false);
const [otp, setOtp] = useState("");
const [isSendingOtp, setIsSendingOtp] = useState(false);
const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);



  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "a2guggi11052002@gmail.com",
    password: "Abcd@12345",
  });
  const [serverError, setServerError] = useState("");
  const hasError = Boolean(serverError);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear the server error as soon as the user starts typing in either field
    if (serverError) {
      setServerError("");
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleLoginSubmit = async (e) => {
     e.preventDefault();

    try {
      setIsSendingOtp(true);
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
      } 
      // else if(response.status===201) {
      //    navigate("/directory");
      // }
      else if (data.otpRequired) {
  setShowOtpModal(true); // 🔑 open popup
}

    } catch (error) {
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

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
      
        <div className="flex items-center justify-center gap-2 mb-6">
          <FaGoogleDrive className="text-blue-500 text-3xl" />
          <span className="text-xl font-medium">Drive</span>
        </div>

        <h2 className="text-xl font-semibold text-center mb-1">
          Sign in
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          to continue to Drive
        </p>
      <form className="form" onSubmit={handleLoginSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            className={`w-full mb-4 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? "input-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className={`w-full mb-4 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? "input-error" : ""}`}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          {/* Absolutely-positioned error message below password field */}
          {serverError && <span className="text-red-700">{serverError}</span>}
        </div>

        {/* <button type="submit" className="w-full rounded-full bg-blue-600 py-2 text-white hover:bg-blue-700">
          Login with otp
        </button> */}
        <button
  type="submit"
  disabled={isSendingOtp || showOtpModal}
  className={`w-full rounded-full py-2 text-white
    ${
      isSendingOtp || showOtpModal
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }
  `}
>
  {isSendingOtp ? "Sending OTP..." : "Login with OTP"}
</button>

      </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <span
            className="cursor-pointer text-blue-600 hover:underline"
            onClick={() => navigate("/register")}
          >
            Create account
          </span>
        </p>
      </div>
{showOtpModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-80">
      <h3 className="text-lg font-semibold mb-3">Enter OTP</h3>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full border px-3 py-2 mb-4"
        placeholder="6-digit OTP"
      />

      {/* <button
        onClick={handleOtpSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Verify OTP
      </button> */}
      <button
  onClick={handleVerifyOtp}
  disabled={isVerifyingOtp}
  className={`w-full py-2 rounded text-white
    ${
      isVerifyingOtp
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-600"
    }
  `}
>
  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
</button>

    </div>
  </div>
)}


    </div>
  );
}

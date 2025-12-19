import { useNavigate } from "react-router-dom";
import { FaGoogleDrive } from "react-icons/fa";
import { useState } from "react";
import {BASE_URL} from "../utility/index.js"

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "anurag@gmail.com",
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
      } else if(response.status===201) {
         navigate("/directory");
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  }
  

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

        <button type="submit" className="w-full rounded-full bg-blue-600 py-2 text-white hover:bg-blue-700">
          Login
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
    </div>
  );
}

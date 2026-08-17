import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (!showOTP) {
        const data = await login(email, password);
        navigate(data.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const data = await verifyOTP(email, otp);
        navigate(data.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      if (err?.needsVerification) setShowOTP(true);
      setError(err?.message || err || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full">
      <div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2><p className="text-gray-500">Sign in to your Eventora account</p></div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOTP ? <>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label><input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Password</label><input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        </> : <div><label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (OTP)</label><input type="text" inputMode="numeric" required placeholder="6-digit code" maxLength="6" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 outline-none font-bold tracking-widest text-center text-lg" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} /></div>}
        <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black disabled:opacity-60 transition">{loading ? "Processing..." : showOTP ? "Verify OTP & Log In" : "Sign In"}</button>
      </form>
      <p className="text-center mt-8 text-gray-600">Don't have an account? <Link to="/register" className="text-gray-900 font-bold hover:underline">Sign up</Link></p>
    </div>
  );
};
export default Login;

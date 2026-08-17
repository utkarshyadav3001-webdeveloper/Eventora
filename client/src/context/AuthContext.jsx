import React, { createContext, useEffect, useState } from "react";
import api from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = (data) => {
    setUser(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
    if (data.token) localStorage.setItem("token", data.token);
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Login failed";
      if (error.response?.status === 400 && message.toLowerCase().includes("not verified")) {
        throw { needsVerification: true, message };
      }
      throw message;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.response?.data?.error || "Registration failed";
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await api.post("/auth/verify-Otp", { email, otp });
      saveSession(data);
      return data;
    } catch (error) {
      throw error.response?.data?.error || error.response?.data?.message || "OTP verification failed";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
  };

  return <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, loading }}>{!loading && children}</AuthContext.Provider>;
};

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.message).join(", "));
      } else {
        setError(err.response?.data?.message || "An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-login flex items-center justify-center relative overflow-hidden py-10">
      {/* Decorative Waves */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <img src="/images/logo.png" alt="BookHeaven Logo" className="h-16 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-[#1E293B] dark:text-slate-100">Create an Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#64748B] dark:text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-[#1E293B] dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B] dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-[#1E293B] dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B] dark:text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-[#1E293B] dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B] dark:text-slate-400 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-[#1E293B] dark:text-slate-100"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A2E] text-white py-3 rounded-lg font-semibold hover:bg-[#2d2d4a] transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? "Registering..." : "REGISTER"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B] dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3B4FE8] dark:text-indigo-400 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

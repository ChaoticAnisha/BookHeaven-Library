"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successUser, setSuccessUser] = useState<{ name: string; role: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data.data;
        // Authenticate context but skip immediate redirect
        login(token, loggedUser, true);
        
        // Show success animation/popup
        setSuccessUser({ name: loggedUser.name, role: loggedUser.role });
        
        // Animate progress bar
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 5;
          setProgress(Math.min(currentProgress, 100));
          if (currentProgress >= 100) {
            clearInterval(interval);
            
            // Redirect to appropriate dashboard
            if (loggedUser.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          }
        }, 60); // 1200ms total animation time
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-login flex items-center justify-center relative overflow-hidden">
      {/* Success Notification Popup */}
      {successUser && (
        <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-500">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 text-center max-w-sm mx-4 transform scale-100 transition-all duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Login Successful!</h3>
            <p className="text-sm text-slate-500 mt-2">
              Welcome back, <span className="font-semibold text-slate-700">{successUser.name}</span>!
            </p>
            <div className="mt-4 inline-block px-3 py-1 bg-indigo-50 text-[#3B4FE8] text-xs font-semibold rounded-full uppercase tracking-wider">
              {successUser.role} Account
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Redirecting to dashboard...
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-emerald-500 h-full transition-all duration-75 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Waves */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <img src="/images/logo.png" alt="BookHeaven Logo" className="h-16 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-[#1E293B]">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#3B4FE8] focus:border-transparent outline-none transition-all text-[#1E293B]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#64748B] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#3B4FE8] focus:border-transparent outline-none transition-all text-[#1E293B]"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A2E] text-white py-3 rounded-lg font-semibold hover:bg-[#2d2d4a] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#3B4FE8] font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

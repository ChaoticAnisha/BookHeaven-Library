"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  membership: string;
  avatar?: string;
  address?: string;
  phone?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, skipRedirect?: boolean) => void;
  logout: () => void;
  updateProfile: (fields: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, skipRedirect = false) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    
    if (!skipRedirect) {
      if (newUser.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  const updateProfile = async (fields: Partial<User>): Promise<void> => {
    if (!user) return;
    const { data } = await api.put('/users/profile', fields);
    const updatedUser: User = { ...user, ...data.data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

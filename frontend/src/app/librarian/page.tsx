"use client";

import { useAuth } from "@/context/AuthContext";
import { BookOpen, LogOut, CheckCircle } from "lucide-react";

export default function LibrarianDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Librarian Sidebar */}
      <aside className="w-64 bg-[#1E3A8A] text-white h-screen flex flex-col sticky top-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">BookHeaven</h2>
          <p className="text-xs text-white/50">Librarian Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg font-medium text-white">
            <BookOpen className="w-5 h-5" /> Stock Management
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors">
            <CheckCircle className="w-5 h-5" /> Returns
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white w-full">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-8">Stock Management</h1>
        
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <input type="text" placeholder="Search by ISBN or Title..." className="border border-[#E2E8F0] p-2 rounded-lg w-96 text-sm" />
            <button className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#64748B] uppercase">
                <th className="p-4">ISBN</th>
                <th className="p-4">Title</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#E2E8F0]">
                <td className="p-4">9780321965516</td>
                <td className="p-4">Don't Make Me Think</td>
                <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">3</span></td>
                <td className="p-4"><button className="text-blue-600 hover:underline">Update Stock</button></td>
              </tr>
              <tr className="border-b border-[#E2E8F0]">
                <td className="p-4">9780465050659</td>
                <td className="p-4">The Design of Everyday Things</td>
                <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">0</span></td>
                <td className="p-4"><button className="text-blue-600 hover:underline">Update Stock</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

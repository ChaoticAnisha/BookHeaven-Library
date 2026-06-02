"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, BookOpen, Clock, AlertCircle, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#1A1A2E] text-white h-screen flex flex-col sticky top-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">BookHeaven</h2>
          <p className="text-xs text-white/50">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg text-[#60A5FA] font-medium">
            <BookOpen className="w-5 h-5" /> Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5" /> All Books
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors">
            <Users className="w-5 h-5" /> All Members
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors">
            <Clock className="w-5 h-5" /> All Rentals
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-white/70 hover:bg-white/5 rounded-lg transition-colors">
            <AlertCircle className="w-5 h-5" /> Reports
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
        <h1 className="text-2xl font-bold text-[#1E293B] mb-8">System Overview</h1>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-[#64748B] text-sm mb-1">Total Books</h3>
            <p className="text-3xl font-bold text-[#1E293B]">1,245</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-[#64748B] text-sm mb-1">Active Members</h3>
            <p className="text-3xl font-bold text-[#1E293B]">842</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-[#64748B] text-sm mb-1">Current Rentals</h3>
            <p className="text-3xl font-bold text-[#1E293B]">156</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="text-[#64748B] text-sm mb-1">Revenue</h3>
            <p className="text-3xl font-bold text-[#1E293B]">₹12,450</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#1E293B]">Recent Activity</h2>
            <button className="text-sm text-[#3B4FE8] font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] last:border-0">
              <div>
                <p className="font-medium text-[#1E293B]">New member registration</p>
                <p className="text-xs text-[#64748B]">John Doe (john@example.com)</p>
              </div>
              <span className="text-xs text-[#64748B]">10 mins ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] last:border-0">
              <div>
                <p className="font-medium text-[#1E293B]">Book rented</p>
                <p className="text-xs text-[#64748B]">"The Design of Everyday Things" by Sarah Smith</p>
              </div>
              <span className="text-xs text-[#64748B]">1 hour ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#E2E8F0] last:border-0">
              <div>
                <p className="font-medium text-[#1E293B]">Payment received</p>
                <p className="text-xs text-[#64748B]">₹50.00 via Khalti (Penalty)</p>
              </div>
              <span className="text-xs text-[#64748B]">2 hours ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

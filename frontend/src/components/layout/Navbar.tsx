"use client";

import Link from "next/link";
import { BookOpen, Search, ScanLine, Bell, ChevronDown, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Button from "@/components/ui/Button";
import api from "@/lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("All");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    api.get("/notifications/unread-count")
      .then(res => { if (res.data.success) setUnreadCount(res.data.data.count); })
      .catch(err => console.error("Failed to load unread count", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&filter=${searchFilter}`);
    }
  };

  return (
    <nav className="h-16 bg-white dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center">
        <img src="/images/logo.png" alt="BookHeaven Logo" className="h-10 object-contain" />
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 flex items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-full border border-[#E2E8F0] dark:border-slate-700 px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#3B4FE8] dark:focus-within:ring-indigo-400 focus-within:border-transparent transition-all">
        <select 
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="bg-transparent text-sm text-[#64748B] dark:text-slate-400 outline-none border-r border-[#E2E8F0] dark:border-slate-700 pr-2 py-1 mr-2 cursor-pointer"
        >
          <option value="All">All</option>
          <option value="Title">Title</option>
          <option value="Author">Author</option>
          <option value="Genre">Genre</option>
          <option value="ISBN">ISBN</option>
        </select>
        
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-[#1E293B] dark:text-slate-100 placeholder-[#64748B] dark:placeholder-slate-500"
        />
        
        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
          <Search className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 ml-1 border-l border-[#E2E8F0] dark:border-slate-700 rounded-none text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
          <ScanLine className="w-4 h-4" />
        </Button>
      </form>

      {/* Right Links & Profile */}
      <div className="flex items-center space-x-6 text-sm font-medium text-[#64748B] dark:text-slate-400">
        <Link href="/browse" className="hover:text-[#3B4FE8] dark:hover:text-indigo-400 transition-colors">Browse</Link>
        <Link href="/new-arrivals" className="hover:text-[#3B4FE8] dark:hover:text-indigo-400 transition-colors">New Arrival</Link>
        <Link href="/rent" className="hover:text-[#3B4FE8] dark:hover:text-indigo-400 transition-colors">Rent</Link>
        <Link href="/support" className="hover:text-[#3B4FE8] dark:hover:text-indigo-400 transition-colors flex items-center gap-1" title="Help & FAQ">
          <HelpCircle className="w-4 h-4" /> Help
        </Link>

        {/* Notifications Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold leading-none min-w-[16px] h-4 px-1 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-[#E2E8F0] dark:border-slate-700 py-2 mt-2 w-80 z-50 text-sm" sideOffset={8}>
              <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-[#1E293B] dark:text-slate-100">Notifications</span>
                <span className="text-[10px] bg-[#EEF2FF] dark:bg-indigo-950 text-[#3B4FE8] dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">{unreadCount} New</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer bg-[#F8FAFC] dark:bg-slate-900">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-xs text-[#3B4FE8] dark:text-indigo-400 mb-1">Rental Confirmed</div>
                    <div className="w-2 h-2 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full mt-1"></div>
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400">Your rental for "The Great Gatsby" is confirmed.</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">2 hours ago</div>
                </div>
                <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer bg-[#F8FAFC] dark:bg-slate-900">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-xs text-[#10B981] mb-1">Book Available</div>
                    <div className="w-2 h-2 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full mt-1"></div>
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400">"Atomic Habits" from your wishlist is now available!</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">1 day ago</div>
                </div>
                <div className="px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer bg-[#F8FAFC] dark:bg-slate-900">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-xs text-[#F59E0B] mb-1">Due Date Reminder</div>
                    <div className="w-2 h-2 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full mt-1"></div>
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400">"1984" is due tomorrow. Please return it on time.</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">2 days ago</div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[#E2E8F0] dark:border-slate-700 text-center bg-[#F8FAFC] dark:bg-slate-900">
                <button className="text-xs text-[#3B4FE8] dark:text-indigo-400 hover:underline font-semibold">Mark all as read</button>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center space-x-2 outline-none">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-[#1E293B] dark:text-slate-100">{user?.name?.split(" ")[0] || "User"}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[#E2E8F0] dark:border-slate-700 py-2 mt-2 w-48 z-50 text-sm" sideOffset={5}>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer">
                <Link href="/account" className="block w-full">Profile</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer">
                <Link href="/wishlist" className="block w-full">Wishlist</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer">
                <Link href="/payments" className="block w-full">Payments</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[#E2E8F0] dark:bg-slate-700 my-1" />
              <DropdownMenu.Item 
                className="px-4 py-2 outline-none hover:bg-red-50 text-red-600 cursor-pointer"
                onClick={logout}
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </nav>
  );
}

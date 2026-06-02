"use client";

import Link from "next/link";
import { BookOpen, Search, ScanLine, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("All");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&filter=${searchFilter}`);
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center">
        <img src="/images/logo.png" alt="BookHeaven Logo" className="h-10 object-contain" />
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 flex items-center bg-[#F8FAFC] rounded-full border border-[#E2E8F0] px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#3B4FE8] focus-within:border-transparent transition-all">
        <select 
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="bg-transparent text-sm text-[#64748B] outline-none border-r border-[#E2E8F0] pr-2 py-1 mr-2 cursor-pointer"
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
          className="flex-1 bg-transparent outline-none text-sm text-[#1E293B] placeholder-[#64748B]"
        />
        
        <button type="submit" className="text-[#64748B] hover:text-[#3B4FE8] p-1">
          <Search className="w-4 h-4" />
        </button>
        <button type="button" className="text-[#64748B] hover:text-[#3B4FE8] p-1 ml-1 border-l border-[#E2E8F0] pl-2">
          <ScanLine className="w-4 h-4" />
        </button>
      </form>

      {/* Right Links & Profile */}
      <div className="flex items-center space-x-6 text-sm font-medium text-[#64748B]">
        <Link href="/browse" className="hover:text-[#3B4FE8] transition-colors">Browse</Link>
        <Link href="/new-arrivals" className="hover:text-[#3B4FE8] transition-colors">New Arrival</Link>
        <Link href="/rent" className="hover:text-[#3B4FE8] transition-colors">Rent</Link>

        {/* Notifications (Mocked Unread) */}
        <button className="relative hover:text-[#3B4FE8] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        {/* Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center space-x-2 outline-none">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-[#1E293B]">{user?.name?.split(" ")[0] || "User"}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-2 mt-2 w-48 z-50 text-sm" sideOffset={5}>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] cursor-pointer">
                <Link href="/account" className="block w-full">Profile</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] cursor-pointer">
                <Link href="/wishlist" className="block w-full">Wishlist</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-4 py-2 outline-none hover:bg-[#F8FAFC] cursor-pointer">
                <Link href="/payments" className="block w-full">Payments</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[#E2E8F0] my-1" />
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

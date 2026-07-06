"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookMarked, Heart, Info, HelpCircle, FileText } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "My Library", href: "/my-library", icon: BookMarked },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <aside className="w-[160px] bg-white dark:bg-slate-800 h-[calc(100vh-64px)] flex flex-col justify-between sticky top-16 border-r border-[#E2E8F0] dark:border-slate-700">
      <div className="py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name} className="relative">
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#3B82F6] to-[#1E3A8A]" />
                )}
                <Link 
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-4 px-2 space-y-1 transition-colors ${
                    isActive ? "text-[#3B4FE8] dark:text-indigo-400" : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="py-6 border-t border-[#E2E8F0] dark:border-slate-700">
        <ul className="space-y-4 px-6 text-xs font-medium text-[#64748B] dark:text-slate-400">
          <li>
            <Link href="/about" className="flex items-center space-x-2 hover:text-[#1E293B] dark:hover:text-slate-100">
              <Info className="w-4 h-4" /> <span>About</span>
            </Link>
          </li>
          <li>
            <Link href="/support" className="flex items-center space-x-2 hover:text-[#1E293B] dark:hover:text-slate-100">
              <HelpCircle className="w-4 h-4" /> <span>Support</span>
            </Link>
          </li>
          <li>
            <Link href="/terms" className="flex items-center space-x-2 hover:text-[#1E293B] dark:hover:text-slate-100">
              <FileText className="w-4 h-4" /> <span>Terms & Condition</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

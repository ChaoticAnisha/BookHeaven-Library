"use client";

import { useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Account Setting");
  const tabs = ["Account Setting", "Login & Security", "Notifications", "Interface"];

  return (
    <AuthLayout>
      <div className="max-w-4xl mx-auto pb-10">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="flex border-b border-[#E2E8F0]">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors outline-none ${
                  activeTab === tab 
                    ? "text-[#3B4FE8] border-b-2 border-[#3B4FE8]" 
                    : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "Account Setting" && (
              <div>
                <div className="flex gap-8 mb-8">
                  {/* Left col - Avatar & Stats */}
                  <div className="flex flex-col items-center w-48">
                    <div className="w-24 h-24 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-md relative group cursor-pointer">
                      {user?.name?.charAt(0) || "U"}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs">Edit</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col w-full gap-2 mt-4">
                      <div className="bg-[#14B8A6] text-white p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-2xl font-bold">120</span>
                        <span className="text-[10px] uppercase tracking-wide">Readings</span>
                      </div>
                      <div className="bg-[#EC4899] text-white p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-2xl font-bold">10</span>
                        <span className="text-[10px] uppercase tracking-wide">Wishlist</span>
                      </div>
                    </div>
                  </div>

                  {/* Right col - Form */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#64748B] mb-1">Full Name</label>
                        <input type="text" defaultValue={user?.name} className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#64748B] mb-1">Email</label>
                        <input type="email" defaultValue={user?.email} className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">Address</label>
                      <input type="text" defaultValue="Kathmandu, Nepal" className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">Phone Number</label>
                      <input type="text" defaultValue="+977 9823456789" className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] mb-1">Bio</label>
                      <textarea rows={3} defaultValue="I'm a Student" className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] resize-none"></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button className="px-6 py-2 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Reset</button>
                      <button className="px-6 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2d2d4a]">Update Profile</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="max-w-md">
                <h3 className="font-bold text-[#1E293B] mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'n1', label: 'Restock Alerts', checked: true },
                    { id: 'n2', label: 'Reservation Confirmations', checked: true },
                    { id: 'n3', label: 'Due Date Reminders (24h before)', checked: true },
                    { id: 'n4', label: 'New Arrivals', checked: true },
                    { id: 'n5', label: 'Weekly Digest', checked: false },
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
                      <span className="text-sm text-[#1E293B]">{n.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={n.checked} />
                        <div className="w-9 h-5 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B4FE8]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(activeTab === "Login & Security" || activeTab === "Interface") && (
              <div className="py-10 text-center text-[#64748B]">
                Settings coming soon
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";
import { MEMBERSHIP_TIERS } from "@/lib/membershipTiers";
import { useTheme } from "@/context/ThemeContext";

export default function AccountPage() {
  // Tab navigation
  const [activeTab, setActiveTab] = useState("Account Setting");
  const { theme, setTheme } = useTheme();
  const tabs = ["Account Setting", "Login & Security", "Payment Methods", "Notifications", "Interface"];

  // Profile picture handling
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const { user, updateProfile } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<{ readings: number; wishlist: number; active: number } | null>(null);

  useEffect(() => {
    api.get("/users/dashboard-stats")
      .then(res => { if (res.data.success) setDashboardStats(res.data.data); })
      .catch(err => console.error("Failed to load dashboard stats", err));
  }, []);

  const tierMaxBooks = MEMBERSHIP_TIERS[user?.membership || "Basic"]?.maxBooks ?? MEMBERSHIP_TIERS.Basic.maxBooks;
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  // Sync form when user loads from context
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        address: user.address ?? prev.address,
        phone: user.phone ?? prev.phone,
        bio: user.bio ?? prev.bio,
      }));
    }
  }, [user]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: profileData.name,
        address: profileData.address,
        phone: profileData.phone,
        bio: profileData.bio,
        avatar: profilePic || undefined,
      });
      showToast("success", "Profile updated successfully!");
    } catch {
      showToast("error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthLayout>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto pb-10">
        <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-6">Settings</h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
          <div className="flex border-b border-[#E2E8F0] dark:border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors outline-none ${
                  activeTab === tab 
                    ? "text-[#3B4FE8] dark:text-indigo-400 border-b-2 border-[#3B4FE8] dark:border-indigo-400" 
                    : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900"
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
                    <label className="w-24 h-24 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-md relative group cursor-pointer overflow-hidden">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || "U"
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-white">Edit</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                    </label>
                    
                    <div className="flex flex-col w-full gap-2 mt-4">
                      <div className="bg-[#14B8A6] text-white p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-2xl font-bold">{dashboardStats?.readings ?? "—"}</span>
                        <span className="text-[10px] uppercase tracking-wide">Readings</span>
                      </div>
                      <div className="bg-[#EC4899] text-white p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-2xl font-bold">{dashboardStats?.wishlist ?? "—"}</span>
                        <span className="text-[10px] uppercase tracking-wide">Wishlist</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 p-3 rounded-lg text-center shadow-sm">
                        <span className="block text-lg font-bold text-[#1E293B] dark:text-slate-100">
                          {dashboardStats?.active ?? 0} of {tierMaxBooks}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[#64748B] dark:text-slate-400">Active Rentals</span>
                        <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-[#3B4FE8] dark:bg-indigo-500 transition-all"
                            style={{ width: `${Math.min(100, ((dashboardStats?.active ?? 0) / tierMaxBooks) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right col - Form */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                      />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                        readOnly
                      />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Bio</label>
                      <textarea
                        rows={3}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 resize-none"
                        placeholder="I'm a Student"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setProfileData({
                            name: user?.name || "",
                            email: user?.email || "",
                            address: user?.address || "",
                            phone: user?.phone || "",
                            bio: user?.bio || "",
                          })
                        }
                        className="px-6 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm font-medium text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                        className="px-6 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2d2d4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving && (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isSaving ? "Saving..." : "Update Profile"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Payment Methods" && (
              <div className="max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[#1E293B] dark:text-slate-100">Saved Payment Methods</h3>
                  <button className="px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2d2d4a] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add New
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#3B4FE8] dark:border-indigo-400 bg-[#F8FAFC] dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[#1A1A2E] rounded flex items-center justify-center text-white font-bold text-xs">VISA</div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">Visa ending in 4242</h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">Expires 12/24</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-[#3B4FE8] dark:text-indigo-400 bg-[#EEF2FF] dark:bg-indigo-950 px-2 py-1 rounded">Default</span>
                      <button className="text-[#64748B] dark:text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[#F59E0B] rounded flex items-center justify-center text-white font-bold text-xs italic">MC</div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">Mastercard ending in 8899</h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">Expires 08/25</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-xs font-medium text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">Set as Default</button>
                      <button className="text-[#64748B] dark:text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4 mt-8">Billing History</h3>
                <div className="border border-[#E2E8F0] dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#64748B] dark:text-slate-400 uppercase bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E2E8F0] dark:border-slate-700">
                        <td className="px-4 py-3 font-medium text-[#1E293B] dark:text-slate-100">May 24, 2026</td>
                        <td className="px-4 py-3 text-[#64748B] dark:text-slate-400">Book Rental - The Great Gatsby</td>
                        <td className="px-4 py-3 text-[#1E293B] dark:text-slate-100">$4.50</td>
                        <td className="px-4 py-3 text-right"><span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded">Paid</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-[#1E293B] dark:text-slate-100">Apr 10, 2026</td>
                        <td className="px-4 py-3 text-[#64748B] dark:text-slate-400">Library Membership - Monthly</td>
                        <td className="px-4 py-3 text-[#1E293B] dark:text-slate-100">$12.00</td>
                        <td className="px-4 py-3 text-right"><span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded">Paid</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="max-w-md">
                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'n1', label: 'Restock Alerts', checked: true },
                    { id: 'n2', label: 'Reservation Confirmations', checked: true },
                    { id: 'n3', label: 'Due Date Reminders (24h before)', checked: true },
                    { id: 'n4', label: 'New Arrivals', checked: true },
                    { id: 'n5', label: 'Weekly Digest', checked: false },
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-2 border-b border-[#F8FAFC] dark:border-slate-800">
                      <span className="text-sm text-[#1E293B] dark:text-slate-100">{n.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={n.checked} />
                        <div className="w-9 h-5 bg-[#E2E8F0] dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B4FE8] dark:peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "Login & Security" && (
              <div className="max-w-2xl">
                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-6">Change Password</h3>
                <div className="space-y-4 mb-10">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400" />
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2d2d4a]">Update Password</button>
                </div>

                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-slate-700 rounded-lg mb-10">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">Secure Your Account</h4>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-4 py-2 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm font-medium text-[#1A1A2E] hover:bg-[#F8FAFC] dark:hover:bg-slate-900">Enable 2FA</button>
                </div>

                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F8FAFC] dark:bg-slate-900 rounded-full flex items-center justify-center text-[#64748B] dark:text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">Windows PC - Chrome</h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">Kathmandu, Nepal • Active now</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F8FAFC] dark:bg-slate-900 rounded-full flex items-center justify-center text-[#64748B] dark:text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">iPhone 13 - Safari</h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">Kathmandu, Nepal • Last active 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-red-500 hover:text-red-700">Revoke</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Interface" && (
              <div className="max-w-2xl">
                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-6">Theme Preferences</h3>
                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div onClick={() => setTheme("Light")} className={`border-2 ${theme === "Light" ? "border-[#3B4FE8] dark:border-indigo-400" : "border-[#E2E8F0] dark:border-slate-700"} rounded-lg p-4 cursor-pointer relative`}>
                    {theme === "Light" && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                    <div className="w-full h-20 bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded shadow-sm"></div>
                    </div>
                    <span className={`block text-center text-sm font-medium ${theme === "Light" ? "text-[#1E293B] dark:text-slate-100" : "text-[#64748B] dark:text-slate-400"}`}>Light</span>
                  </div>
                  <div onClick={() => setTheme("Dark")} className={`border-2 ${theme === "Dark" ? "border-[#3B4FE8] dark:border-indigo-400" : "border-[#E2E8F0] dark:border-slate-700"} rounded-lg p-4 cursor-pointer hover:border-[#3B4FE8] dark:hover:border-indigo-400 relative`}>
                    {theme === "Dark" && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                    <div className="w-full h-20 bg-gray-800 rounded mb-3 flex items-center justify-center">
                      <div className="w-10 h-10 bg-gray-900 rounded shadow-sm"></div>
                    </div>
                    <span className={`block text-center text-sm font-medium ${theme === "Dark" ? "text-[#1E293B] dark:text-slate-100" : "text-[#64748B] dark:text-slate-400"}`}>Dark</span>
                  </div>
                  <div onClick={() => setTheme("System")} className={`border-2 ${theme === "System" ? "border-[#3B4FE8] dark:border-indigo-400" : "border-[#E2E8F0] dark:border-slate-700"} rounded-lg p-4 cursor-pointer hover:border-[#3B4FE8] dark:hover:border-indigo-400 relative`}>
                    {theme === "System" && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#3B4FE8] dark:bg-indigo-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    )}
                    <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-800 rounded mb-3 flex items-center justify-center">
                      <div className="w-5 h-10 bg-white dark:bg-slate-800 rounded-l shadow-sm"></div>
                      <div className="w-5 h-10 bg-gray-900 rounded-r shadow-sm"></div>
                    </div>
                    <span className={`block text-center text-sm font-medium ${theme === "System" ? "text-[#1E293B] dark:text-slate-100" : "text-[#64748B] dark:text-slate-400"}`}>System</span>
                  </div>
                </div>

                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4">Language & Region</h3>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Language</label>
                    <select className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 bg-white dark:bg-slate-800">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Timezone</label>
                    <select className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 bg-white dark:bg-slate-800">
                      <option>(GMT+05:45) Kathmandu</option>
                      <option>(GMT+00:00) UTC</option>
                      <option>(GMT-05:00) Eastern Time</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4">Accessibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC] dark:border-slate-800">
                    <div>
                      <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100 block">Reduce Motion</span>
                      <span className="text-xs text-[#64748B] dark:text-slate-400">Minimize animations throughout the app</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#E2E8F0] dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B4FE8] dark:peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC] dark:border-slate-800">
                    <div>
                      <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100 block">High Contrast</span>
                      <span className="text-xs text-[#64748B] dark:text-slate-400">Increase contrast for better readability</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-[#E2E8F0] dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3B4FE8] dark:peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Users, BookOpen, Clock, AlertCircle, LogOut } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Tab = "Overview" | "All Books" | "All Members" | "All Rentals" | "Reports";

function AdminDashboardInner() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("Overview");

  const [bookStats, setBookStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [rentalStats, setRentalStats] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [b, u, r] = await Promise.all([
        api.get("/books/stats"),
        api.get("/users/stats"),
        api.get("/rentals/stats"),
      ]);
      setBookStats(b.data.data);
      setUserStats(u.data.data);
      setRentalStats(r.data.data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/books/all?limit=50");
      setBooks(res.data.data.books || []);
    } catch (err) {
      console.error("Failed to load books", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/all?limit=50");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRentals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/rentals/all?limit=50");
      setRentals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load rentals", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "Overview" || tab === "Reports") loadOverview();
    else if (tab === "All Books") loadBooks();
    else if (tab === "All Members") loadUsers();
    else if (tab === "All Rentals") loadRentals();
  }, [tab, loadOverview, loadBooks, loadUsers, loadRentals]);

  const handleSuspend = async (user: any) => {
    try {
      const res = await api.patch(`/users/${user._id}/suspend`);
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.data : u));
      toast({ title: res.data.data.isActive ? "Member activated" : "Member suspended" });
    } catch (err: any) {
      toast({ title: "Action failed", description: err.response?.data?.message || "Try again.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast({ title: "Member deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.response?.data?.message || "Try again.", variant: "destructive" });
    }
  };

  const navItems: { label: Tab; icon: React.ReactNode }[] = [
    { label: "Overview", icon: <BookOpen className="w-5 h-5" /> },
    { label: "All Books", icon: <BookOpen className="w-5 h-5" /> },
    { label: "All Members", icon: <Users className="w-5 h-5" /> },
    { label: "All Rentals", icon: <Clock className="w-5 h-5" /> },
    { label: "Reports", icon: <AlertCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#1A1A2E] text-white h-screen flex flex-col sticky top-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">BookHeaven</h2>
          <p className="text-xs text-white/50">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => setTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                tab === item.label ? "bg-white/10 text-[#60A5FA] font-medium" : "text-white/70 hover:bg-white/5"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white w-full">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-8">{tab}</h1>

        {loading ? (
          <div className="p-10 text-center text-[#64748B] dark:text-slate-400">Loading...</div>
        ) : tab === "Overview" ? (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm">
              <h3 className="text-[#64748B] dark:text-slate-400 text-sm mb-1">Total Books</h3>
              <p className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">{bookStats?.total ?? bookStats?.totalBooks ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm">
              <h3 className="text-[#64748B] dark:text-slate-400 text-sm mb-1">Total Members</h3>
              <p className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">{userStats?.members ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm">
              <h3 className="text-[#64748B] dark:text-slate-400 text-sm mb-1">Active Rentals</h3>
              <p className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">{rentalStats?.active ?? rentalStats?.activeCount ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm">
              <h3 className="text-[#64748B] dark:text-slate-400 text-sm mb-1">Overdue Rentals</h3>
              <p className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">{rentalStats?.overdue ?? rentalStats?.overdueCount ?? 0}</p>
            </div>
          </div>
        ) : tab === "All Books" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B] dark:text-slate-400 uppercase">
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {books.map(b => (
                  <tr key={b._id} className="border-b border-[#E2E8F0] dark:border-slate-700 last:border-0">
                    <td className="p-4">{b.title}</td>
                    <td className="p-4">{b.author}</td>
                    <td className="p-4">{b.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded font-medium ${b.hardCopyCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {b.hardCopyCount}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "All Members" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B] dark:text-slate-400 uppercase">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Membership</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(u => (
                  <tr key={u._id} className="border-b border-[#E2E8F0] dark:border-slate-700 last:border-0">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 capitalize">{u.role}</td>
                    <td className="p-4">{u.membership}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 space-x-3">
                      <button onClick={() => handleSuspend(u)} className="text-blue-600 hover:underline">
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "All Rentals" ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B] dark:text-slate-400 uppercase">
                  <th className="p-4">Book</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rentals.map(r => (
                  <tr key={r._id} className="border-b border-[#E2E8F0] dark:border-slate-700 last:border-0">
                    <td className="p-4">{r.book?.title ?? '—'}</td>
                    <td className="p-4">{r.user?.name ?? '—'}</td>
                    <td className="p-4">{new Date(r.fromDate).toLocaleDateString()}</td>
                    <td className="p-4">{new Date(r.toDate).toLocaleDateString()}</td>
                    <td className="p-4 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">System Report</h2>
            <ul className="text-sm text-[#1E293B] dark:text-slate-100 space-y-2">
              <li>Total books: <strong>{bookStats?.total ?? 0}</strong> ({bookStats?.inShelf ?? 0} in-shelf, {bookStats?.borrowed ?? 0} borrowed, {bookStats?.reserved ?? 0} reserved)</li>
              <li>Total users: <strong>{userStats?.total ?? 0}</strong> ({userStats?.admins ?? 0} admins, {userStats?.librarians ?? 0} librarians, {userStats?.members ?? 0} members)</li>
              <li>Total rentals: <strong>{rentalStats?.total ?? 0}</strong> ({rentalStats?.active ?? 0} active, {rentalStats?.overdue ?? 0} overdue, {rentalStats?.returned ?? 0} returned)</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminDashboardInner />
    </RoleGuard>
  );
}

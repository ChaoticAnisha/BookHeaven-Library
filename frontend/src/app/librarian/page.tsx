"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { BookOpen, LogOut, CheckCircle } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Tab = "All Rentals" | "Returns";

function LibrarianDashboardInner() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("All Rentals");
  const [rentals, setRentals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        api.get("/rentals/all?limit=50"),
        api.get("/rentals/stats"),
      ]);
      setRentals(r.data.data || []);
      setStats(s.data.data);
    } catch (err) {
      console.error("Failed to load rentals", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dueForReturn = rentals.filter(r => r.status === "active" || r.status === "overdue");

  const handleReturn = async (rental: any) => {
    setReturningId(rental._id);
    try {
      await api.post("/rentals/return", { rentalId: rental._id, serialNumber: rental.serialNumber });
      setRentals(prev => prev.map(r => r._id === rental._id ? { ...r, status: "returned" } : r));
      toast({ title: "Book marked as returned" });
    } catch (err: any) {
      toast({ title: "Return failed", description: err.response?.data?.message || "Try again.", variant: "destructive" });
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex">
      {/* Librarian Sidebar */}
      <aside className="w-64 bg-[#1E3A8A] text-white h-screen flex flex-col sticky top-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">BookHeaven</h2>
          <p className="text-xs text-white/50">Librarian Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setTab("All Rentals")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${tab === "All Rentals" ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5"}`}
          >
            <BookOpen className="w-5 h-5" /> All Rentals
          </button>
          <button
            onClick={() => setTab("Returns")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${tab === "Returns" ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5"}`}
          >
            <CheckCircle className="w-5 h-5" /> Returns
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white w-full">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">{tab}</h1>
        {stats && (
          <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
            {stats.total ?? 0} total rentals · {stats.active ?? 0} active · {stats.overdue ?? 0} overdue · {stats.returned ?? 0} returned
          </p>
        )}

        {loading ? (
          <div className="p-10 text-center text-[#64748B] dark:text-slate-400">Loading...</div>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Books due / overdue for return</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B] dark:text-slate-400 uppercase">
                  <th className="p-4">Book</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">Due</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dueForReturn.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-[#64748B] dark:text-slate-400">Nothing due for return.</td></tr>
                ) : dueForReturn.map(r => (
                  <tr key={r._id} className="border-b border-[#E2E8F0] dark:border-slate-700 last:border-0">
                    <td className="p-4">{r.book?.title ?? '—'}</td>
                    <td className="p-4">{r.user?.name ?? '—'}</td>
                    <td className="p-4">{new Date(r.toDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleReturn(r)}
                        disabled={returningId === r._id}
                        className="text-blue-600 hover:underline disabled:opacity-50"
                      >
                        {returningId === r._id ? "Processing..." : "Mark Returned"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LibrarianDashboard() {
  return (
    <RoleGuard allow={["librarian", "admin"]}>
      <LibrarianDashboardInner />
    </RoleGuard>
  );
}

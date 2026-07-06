"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import Button from "@/components/ui/Button";

export default function MyLibrary() {
  const [activeTab, setActiveTab] = useState("All Books");
  const tabs = ["All Books", "Wishlist", "Rented Books", "E-Books", "Audio Books", "Articles & Journals"];

  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState<any>(null);
  const [returning, setReturning] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const CANCEL_GRACE_MINUTES = 30;
  const isCancellable = (rental: any) =>
    rental.status === 'active' &&
    rental.createdAt &&
    (Date.now() - new Date(rental.createdAt).getTime()) / 60000 < CANCEL_GRACE_MINUTES;

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await api.get("/rentals/my");
        if (res.data.success) {
          setRentals(res.data.data);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const getFilteredRentals = () => {
    if (activeTab === "Rented Books") return rentals.filter(r => r.status === 'active' || r.status === 'overdue');
    // Note: E-Books/Audio filtering would depend on book flags, kept simple for prototype
    return rentals;
  };

  const filtered = getFilteredRentals();

  const handleReturn = async () => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      const res = await api.post("/rentals/return", {
        rentalId: returnTarget._id,
        serialNumber: returnTarget.serialNumber,
      });
      if (res.data.success) {
        setRentals(prev => prev.map(r => r._id === returnTarget._id ? res.data.data : r));
        toast({ title: "Book returned", description: "Thanks for returning it on time.", className: "bg-[#22C55E] text-white border-none" });
        setReturnTarget(null);
      }
    } catch (err: any) {
      toast({
        title: "Return failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReturning(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.post("/rentals/cancel", { rentalId: cancelTarget._id });
      if (res.data.success) {
        setRentals(prev => prev.map(r => r._id === cancelTarget._id ? res.data.data : r));
        toast({ title: "Rental cancelled", description: "No charges applied.", className: "bg-[#22C55E] text-white border-none" });
        setCancelTarget(null);
      }
    } catch (err: any) {
      toast({
        title: "Cancellation failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string, isEbook: boolean = false) => {
    if (status === 'overdue') return <span className="bg-[#EF4444] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Overdue</span>;
    if (isEbook) return <span className="bg-[#3B4FE8] dark:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">E-Book</span>;
    if (status === 'active') return <span className="bg-[#7C3AED] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Borrowed</span>;
    return <span className="bg-[#22C55E] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Returned</span>;
  };

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-6">My Library</h1>

        <div className="flex space-x-6 border-b border-[#E2E8F0] dark:border-slate-700 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap outline-none ${
                activeTab === tab 
                  ? "text-[#3B4FE8] dark:text-indigo-400 border-b-2 border-[#3B4FE8] dark:border-indigo-400" 
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#64748B] dark:text-slate-400">Loading...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(rental => {
              const book = rental.book;
              if (!book) return null;
              
              const isOverdue = new Date(rental.toDate) < new Date() && rental.status !== 'returned';
              
              return (
                <div key={rental._id} className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 flex gap-4 shadow-sm relative">
                  {isOverdue && <div className="absolute top-2 right-2 w-3 h-3 bg-[#EF4444] rounded-full shadow-md"></div>}
                  
                  <div className="w-24 h-36 flex-shrink-0">
                    <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-full h-full object-cover rounded shadow-sm" />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm line-clamp-2">{book.title}</h4>
                    </div>
                    
                    <div className="mb-2">
                      {getStatusBadge(rental.status, book.eBookAvailable)}
                    </div>
                    
                    <div className="text-xs text-[#64748B] dark:text-slate-400 mt-auto space-y-1">
                      <p>Borrowed on {new Date(rental.fromDate).toLocaleDateString()}</p>
                      <p className={isOverdue ? "text-[#EF4444] font-medium" : ""}>
                        {rental.status === 'returned' ? 'Returned on ' + (rental.returnedDate ? new Date(rental.returnedDate).toLocaleDateString() : '') : 'Submission Due ' + new Date(rental.toDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-700">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100">{book.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      
                      {rental.status !== 'returned' && (
                        <div className="flex items-center gap-2">
                          {isCancellable(rental) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#64748B] dark:text-slate-400 hover:bg-[#FEF2F2] dark:hover:bg-red-950 hover:text-[#EF4444] dark:hover:text-red-400 hover:border-[#FCA5A5] dark:hover:border-red-800"
                              onClick={() => setCancelTarget(rental)}
                            >
                              Cancel
                            </Button>
                          )}
                          {book.eBookAvailable ? (
                            <Link href={`/read/${book._id}`} className="bg-[#10B981] text-white px-3 h-9 inline-flex items-center text-xs rounded-lg font-semibold hover:bg-[#059669] transition-colors">
                              Read Now
                            </Link>
                          ) : (
                            <Button variant="primary" size="sm" onClick={() => setReturnTarget(rental)}>
                              Return
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
            <p className="text-[#64748B] dark:text-slate-400 mb-4">No borrowed books yet — start browsing</p>
            <Link href="/search" className="bg-[#1A1A2E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2d2d4a] transition-colors">
              Browse Books
            </Link>
          </div>
        )}

        {/* Notes & Bookmarks Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-4">Notes & Bookmarks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['#F97316', '#EC4899', '#10B981', '#8B5CF6'].map((color, i) => (
              <div key={i} className="h-32 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
                <span className="text-sm font-medium opacity-80">Collection {i+1}</span>
                <span className="font-bold">View Notes →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog.Root open={!!returnTarget} onOpenChange={(open) => !open && !returning && setReturnTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm z-50 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Return this book?</Dialog.Title>
              <Dialog.Close className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100" disabled={returning}>
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              {returnTarget?.book?.title ? `"${returnTarget.book.title}" ` : "This book "}
              will be marked as returned. You'll need to bring the physical copy to the library counter.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReturnTarget(null)}
                disabled={returning}
                className="flex-1 py-2.5 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm font-semibold text-[#1E293B] dark:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={returning}
                className="flex-1 py-2.5 bg-[#1E293B] text-white rounded-lg text-sm font-semibold hover:bg-[#0f172a] transition-colors disabled:opacity-60"
              >
                {returning ? "Returning..." : "Confirm Return"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!cancelTarget} onOpenChange={(open) => !open && !cancelling && setCancelTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm z-50 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Cancel this rental?</Dialog.Title>
              <Dialog.Close className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100" disabled={cancelling}>
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              {cancelTarget?.book?.title ? `"${cancelTarget.book.title}" ` : "This rental "}
              will be cancelled and the copy released back to the shelf. No charges apply within the {CANCEL_GRACE_MINUTES}-minute grace window.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm font-semibold text-[#1E293B] dark:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors disabled:opacity-60"
              >
                Keep Rental
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-semibold hover:bg-[#DC2626] transition-colors disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AuthLayout>
  );
}

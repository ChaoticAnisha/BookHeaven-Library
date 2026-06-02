"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star } from "lucide-react";

export default function MyLibrary() {
  const [activeTab, setActiveTab] = useState("All Books");
  const tabs = ["All Books", "Wishlist", "Rented Books", "E-Books", "Audio Books", "Articles & Journals"];
  
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status: string, isEbook: boolean = false) => {
    if (status === 'overdue') return <span className="bg-[#EF4444] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Overdue</span>;
    if (isEbook) return <span className="bg-[#3B4FE8] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">E-Book</span>;
    if (status === 'active') return <span className="bg-[#7C3AED] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Borrowed</span>;
    return <span className="bg-[#22C55E] text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Returned</span>;
  };

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">My Library</h1>

        <div className="flex space-x-6 border-b border-[#E2E8F0] mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap outline-none ${
                activeTab === tab 
                  ? "text-[#3B4FE8] border-b-2 border-[#3B4FE8]" 
                  : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#64748B]">Loading...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(rental => {
              const book = rental.book;
              if (!book) return null;
              
              const isOverdue = new Date(rental.toDate) < new Date() && rental.status !== 'returned';
              
              return (
                <div key={rental._id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex gap-4 shadow-sm relative">
                  {isOverdue && <div className="absolute top-2 right-2 w-3 h-3 bg-[#EF4444] rounded-full shadow-md"></div>}
                  
                  <div className="w-24 h-36 flex-shrink-0">
                    <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-full h-full object-cover rounded shadow-sm" />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-[#1E293B] text-sm line-clamp-2">{book.title}</h4>
                    </div>
                    
                    <div className="mb-2">
                      {getStatusBadge(rental.status, book.eBookAvailable)}
                    </div>
                    
                    <div className="text-xs text-[#64748B] mt-auto space-y-1">
                      <p>Borrowed on {new Date(rental.fromDate).toLocaleDateString()}</p>
                      <p className={isOverdue ? "text-[#EF4444] font-medium" : ""}>
                        {rental.status === 'returned' ? 'Returned on ' + (rental.returnedDate ? new Date(rental.returnedDate).toLocaleDateString() : '') : 'Submission Due ' + new Date(rental.toDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E2E8F0]">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-[#1E293B]">{book.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      
                      {rental.status !== 'returned' && (
                        book.eBookAvailable ? (
                          <Link href={`/read/${book._id}`} className="bg-[#10B981] text-white px-3 py-1 text-xs rounded font-medium hover:bg-[#059669] transition-colors">
                            Read Now
                          </Link>
                        ) : (
                          <button className="bg-[#1E293B] text-white px-3 py-1 text-xs rounded font-medium hover:bg-[#0f172a] transition-colors">
                            Return
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-[#E2E8F0]">
            <p className="text-[#64748B] mb-4">No borrowed books yet — start browsing</p>
            <Link href="/search" className="bg-[#1A1A2E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2d2d4a] transition-colors">
              Browse Books
            </Link>
          </div>
        )}

        {/* Notes & Bookmarks Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-[#1E293B] mb-4">Notes & Bookmarks</h3>
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
    </AuthLayout>
  );
}

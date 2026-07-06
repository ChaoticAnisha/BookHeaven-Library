"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Maximize, Settings2, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function ReadNow() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBookAndAccess = async () => {
      try {
        const [bookRes, rentalsRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get("/rentals/my"),
        ]);
        if (bookRes.data.success) {
          setBook(bookRes.data.data);
        }
        if (rentalsRes.data.success) {
          const rentals = rentalsRes.data.data || [];
          const owned = rentals.some(
            (r: any) => r.book?._id === id && (r.status === "active" || r.status === "overdue")
          );
          setHasAccess(owned);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
        setAccessChecked(true);
      }
    };
    if (id) fetchBookAndAccess();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`read-progress-${id}`);
    if (saved) setCurrentPage(Number(saved) || 1);
  }, [id]);

  const goToPage = (page: number) => {
    if (!book) return;
    const clamped = Math.min(Math.max(page, 1), book.pages || 1);
    setCurrentPage(clamped);
    localStorage.setItem(`read-progress-${id}`, String(clamped));
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900">Loading...</div>;
  if (!book) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-900">Book not found</div>;

  const eBookOffered = !!book.eBookAvailable;
  const canRead = accessChecked && eBookOffered && hasAccess;

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-900 overflow-hidden font-sans">
      {/* Top bar */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-[#E2E8F0] dark:bg-slate-700"></div>
          <div>
            <h1 className="font-bold text-[#1E293B] dark:text-slate-100 text-sm leading-tight">{book.title}</h1>
            <span className="text-xs text-[#64748B] dark:text-slate-400">Chapter 1: Introduction</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canRead && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-[#64748B] dark:text-slate-400 font-medium tabular-nums">Page {currentPage} / {book.pages}</span>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= book.pages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="h-6 w-px bg-[#E2E8F0] dark:bg-slate-700"></div>

          <select className="bg-transparent text-sm font-medium text-[#1E293B] dark:text-slate-100 outline-none cursor-pointer">
            <option>Single</option>
            <option>Double</option>
            <option>Continuous</option>
          </select>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
            <Settings2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {canRead && (
        <div className="h-1 bg-[#E2E8F0] dark:bg-slate-700 flex-shrink-0">
          <div
            className="h-full bg-[#3B4FE8] dark:bg-indigo-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (currentPage / (book.pages || 1)) * 100)}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        
        {!canRead ? (
          <div className="flex-1 bg-[#F8FAFC] dark:bg-slate-900 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-[#E2E8F0] dark:border-slate-700 text-center">
              <div className="w-16 h-16 bg-[#EEF2FF] dark:bg-indigo-950 text-[#3B4FE8] dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              {!eBookOffered ? (
                <>
                  <h2 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">No E-Book Available</h2>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm mb-8">"{book.title}" doesn't have an e-book edition yet — only the hard copy can be rented.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">Rent This Book to Read</h2>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm mb-8">You need an active rental of "{book.title}" to read the e-book. Rent it first, then come back here.</p>
                </>
              )}
              <button
                onClick={() => router.push(`/books/${id}`)}
                className="w-full bg-[#1A1A2E] text-white py-3 rounded-lg font-semibold hover:bg-[#2d2d4a] transition-colors"
              >
                {eBookOffered ? "Go Rent This Book" : "Back to Book"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Left reading panel (70%) */}
            <div className="flex-[7] bg-[#F8FAFC] dark:bg-slate-900 relative flex items-center justify-center p-4">
              <div className="w-full h-full bg-white dark:bg-slate-800 shadow-lg rounded-sm overflow-hidden border border-[#E2E8F0] dark:border-slate-700">
                <iframe
                  src={book.eBookUrl || book.pdfUrl || "/sample.pdf"}
                  className="w-full h-full"
                  title="PDF Reader"
                ></iframe>
              </div>
            </div>

            {/* Right notes panel (30%) */}
            <div className="flex-[3] bg-white dark:bg-slate-800 border-l border-[#E2E8F0] dark:border-slate-700 flex flex-col relative shadow-[-4px_0_15px_rgba(0,0,0,0.03)]">
              <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-700 flex justify-between items-center bg-[#F8FAFC] dark:bg-slate-900">
                <h3 className="font-bold text-[#1E293B] dark:text-slate-100">Notes & Highlights</h3>
                <button className="text-[#3B4FE8] dark:text-indigo-400"><BookmarkPlus className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <label className="text-xs font-semibold uppercase text-[#64748B] dark:text-slate-400 mb-2 tracking-wider">Add Note</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-40 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 text-sm text-[#1E293B] dark:text-slate-100 outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 focus:ring-1 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 resize-none mb-4 shadow-sm"
                  placeholder="Write your notes here..."
                ></textarea>
                
                <button className="bg-[#1A1A2E] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#2d2d4a] transition-colors shadow-sm self-end">
                  Save Note
                </button>
                
                <div className="mt-8">
                  <h4 className="text-xs font-semibold uppercase text-[#64748B] dark:text-slate-400 mb-4 tracking-wider">Saved (1)</h4>
                  <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-3 rounded text-sm text-[#92400E]">
                    <p className="italic mb-2">"Sed ut perspiciatis unde omnis iste natus error"</p>
                    <p className="font-medium text-xs text-[#B45309]">Important concept for the exam.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

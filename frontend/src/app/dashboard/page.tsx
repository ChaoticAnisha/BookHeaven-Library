"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Star, BookOpen, ChevronRight } from "lucide-react";

interface Book {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
  year: number;
  rating: number;
  category: string;
  rentPrice: number;
  buyPrice: number;
  hardCopyCount: number;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [recentReadings, setRecentReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [arrivalsRes, recRes, historyRes] = await Promise.all([
          api.get("/books/new-arrivals?limit=8"),
          api.get("/books/recommended?limit=8"),
          api.get("/users/reading-history"),
        ]);

        if (arrivalsRes.data.success) {
          setNewArrivals(arrivalsRes.data.data);
        }
        if (recRes.data.success) {
          setRecommended(recRes.data.data);
        }
        if (historyRes.data.success) {
          setRecentReadings(historyRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-12 space-y-10">
        {/* Hero Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Quote Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#C026D3] to-[#7C3AED] rounded-2xl p-8 text-white relative shadow-xl flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="text-[10px] tracking-widest font-bold uppercase text-white/70 block mb-2">Today's Quote</span>
              <p className="text-lg md:text-xl font-medium italic leading-relaxed text-white/95">
                "There is more treasure in books than in all the pirate's loot on Treasure Island."
              </p>
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span className="w-2 h-2 rounded-full bg-white/40"></span>
                <span className="w-2 h-2 rounded-full bg-white/40"></span>
              </div>
              <span className="text-sm font-semibold opacity-90">- Walt Disney</span>
            </div>
          </div>

          {/* New Arrivals Strip */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-md border border-[#E2E8F0] overflow-hidden flex relative min-h-[220px]">
            {/* Indigo left strip */}
            <div className="bg-[#4F46E5] w-12 flex items-center justify-center relative shrink-0">
              <span className="text-white text-xs font-black uppercase tracking-widest rotate-180 writing-mode-vertical whitespace-nowrap" style={{ writingMode: "vertical-lr" }}>
                New Arrivals
              </span>
            </div>

            {/* Book cover scroll */}
            <div className="flex-1 flex items-center overflow-x-auto py-4 px-6 gap-4 no-scrollbar">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-24 h-32 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                ))
              ) : newArrivals.length === 0 ? (
                <div className="text-xs text-[#64748B] flex items-center h-full">No new arrivals seeded.</div>
              ) : (
                newArrivals.map((book) => (
                  <Link
                    key={book._id}
                    href={`/books/${book._id}`}
                    className="w-24 shrink-0 transition-transform duration-300 hover:scale-105"
                  >
                    <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg overflow-hidden aspect-[3/4] shadow-sm">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-[8px] font-bold text-slate-400 bg-slate-100">
                          {book.title}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Blue triangle decoration on right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#3B4FE8] clip-triangle pointer-events-none" />
          </div>
        </div>

        {/* Welcome Text */}
        <div>
          <h2 className="text-3xl font-bold text-[#1E293B]">
            Good Morning, <span className="text-[#3B4FE8]">{user?.name || "Member"}</span>
          </h2>
        </div>

        {/* Recommended for You Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#1E293B]">Recommended for You</h3>
            <Link href="/search" className="text-xs text-[#3B4FE8] hover:underline font-semibold flex items-center gap-0.5">
              Show All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-48 bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-3 animate-pulse shrink-0 shadow-sm">
                  <div className="bg-slate-100 aspect-[3/4] w-full rounded-lg" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))
            ) : recommended.length === 0 ? (
              <div className="text-sm text-[#64748B] py-4 bg-white/50 w-full rounded-xl text-center border border-dashed border-[#E2E8F0]">
                Browse books and add them to your reading history to get tailored recommendations!
              </div>
            ) : (
              recommended.map((book) => (
                <Link
                  key={book._id}
                  href={`/books/${book._id}`}
                  className="w-44 bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-3 shrink-0 hover:shadow-md hover:border-[#3B4FE8]/30 transition-all group"
                >
                  <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] aspect-[3/4] w-full rounded-lg overflow-hidden relative shadow-sm border border-[#F1F5F9]">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] font-semibold text-slate-400">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1E293B] line-clamp-1 group-hover:text-[#3B4FE8] transition-colors leading-tight">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-1">{book.author}</p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-[#94A3B8]">{book.year}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-[#1E293B]">{book.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Readings Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#1E293B]">Recent Readings</h3>
            <Link href="/my-library" className="text-xs text-[#3B4FE8] hover:underline font-semibold flex items-center gap-0.5">
              Show All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-48 bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-3 animate-pulse shrink-0 shadow-sm" />
              ))}
            </div>
          ) : recentReadings.length === 0 ? (
            <div className="text-sm text-[#64748B] py-8 bg-white/50 w-full rounded-xl text-center border border-dashed border-[#E2E8F0]">
              Start reading to see your history here
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar">
              {recentReadings.map((rental) => {
                const book = rental.book;
                if (!book) return null;
                return (
                  <Link
                    key={rental._id}
                    href={`/books/${book._id}`}
                    className="w-44 bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-3 shrink-0 hover:shadow-md hover:border-[#3B4FE8]/30 transition-all group"
                  >
                    <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] aspect-[3/4] w-full rounded-lg overflow-hidden relative shadow-sm border border-[#F1F5F9]">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] font-semibold text-slate-400">
                          {book.title}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#1E293B] line-clamp-1 group-hover:text-[#3B4FE8] transition-colors leading-tight">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#64748B] line-clamp-1">{book.author}</p>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-[#94A3B8]">{book.year}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-bold text-[#1E293B]">{book.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

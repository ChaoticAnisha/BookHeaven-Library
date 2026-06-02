"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star, Sparkles, Clock } from "lucide-react";

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
  status: string;
  createdAt?: string;
}

export default function NewArrivalsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoading(true);
      try {
        const res = await api.get("/books/new-arrivals?limit=24");
        if (res.data.success) {
          setBooks(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch new arrivals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-2.5 rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">New Arrivals</h1>
            <p className="text-[#64748B] mt-0.5">Recently added to our collection</p>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="bg-slate-100 aspect-[3/4] w-full rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="w-16 h-16 text-[#E2E8F0] mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No new arrivals yet</h3>
            <p className="text-[#64748B] text-sm">Check back soon for the latest additions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {books.map((book, index) => (
              <Link key={book._id} href={`/books/${book._id}`} className="group relative block">
                {index < 6 && (
                  <span className="absolute top-2 left-2 z-10 bg-[#4F46E5] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    New
                  </span>
                )}
                <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] aspect-[3/4] w-full rounded-xl overflow-hidden shadow-sm border border-[#E2E8F0] group-hover:shadow-md group-hover:border-[#3B4FE8]/30 transition-all">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] font-semibold text-slate-400">
                      {book.title}
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-0.5">
                  <h3 className="font-semibold text-sm text-[#1E293B] line-clamp-1 group-hover:text-[#3B4FE8] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-1">{book.author}</p>
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-[#1E293B]">{book.rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-[#3B4FE8] font-semibold">Rs.{book.rentPrice}/day</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

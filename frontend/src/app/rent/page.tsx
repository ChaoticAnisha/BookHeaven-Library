"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star, BookOpen, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getStockLevel, stockTextClass } from "@/lib/stock";

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

export default function RentPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRentableBooks = async () => {
      setLoading(true);
      try {
        // Fetch books that are available for rent (in-shelf and have hard copies)
        const res = await api.get("/books/search?q=&filter=All");
        if (res.data.success) {
          const allBooks = res.data.data.books ?? res.data.data;
          // Filter to books that have hard copies (rentable)
          setBooks(allBooks.filter((b: Book) => b.hardCopyCount > 0 || b.rentPrice > 0));
        }
      } catch (err) {
        console.error("Failed to fetch books for rent", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRentableBooks();
  }, []);

  const handleRent = (book: Book) => {
    toast({
      title: "Redirecting to book detail",
      description: `View rental options for "${book.title}"`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-shelf": return "bg-emerald-100 text-emerald-700";
      case "borrowed": return "bg-purple-100 text-purple-700";
      case "reserved": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#059669] to-[#0D9488] p-2.5 rounded-xl shadow-sm">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">Rent a Book</h1>
              <p className="text-[#64748B] dark:text-slate-400 mt-0.5">Borrow physical copies from our library</p>
            </div>
          </div>
          <div className="bg-[#EEF2FF] dark:bg-indigo-950 border border-[#C7D2FE] dark:border-indigo-800 rounded-xl px-4 py-3 text-sm text-[#4338CA] dark:text-indigo-300 hidden md:block">
            <p className="font-semibold">How it works</p>
            <p className="text-xs text-[#6366F1] mt-0.5">Pick a book → Reserve → Collect from library</p>
          </div>
        </div>

        {/* Books List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 p-4 flex gap-4 animate-pulse">
                <div className="bg-slate-100 w-16 h-22 rounded-lg shrink-0" style={{ height: "88px" }} />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-16 h-16 text-[#E2E8F0] mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] dark:text-slate-100 mb-2">No books available for rent</h3>
            <p className="text-[#64748B] dark:text-slate-400 text-sm">Check back later for available physical copies.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
            <div className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 px-6 py-3 grid grid-cols-12 text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
              <span className="col-span-5">Book</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-1 text-center">Rating</span>
              <span className="col-span-2 text-center">Copies</span>
              <span className="col-span-2 text-right">Action</span>
            </div>
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="px-6 py-4 grid grid-cols-12 items-center hover:bg-[#F8FAFC]/50 transition-colors"
                >
                  {/* Book info */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-lg overflow-hidden shrink-0 shadow-sm border border-[#E2E8F0] dark:border-slate-700">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-semibold text-center p-1">
                          {book.title}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-[#1E293B] dark:text-slate-100 truncate">{book.title}</h3>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">{book.author}</p>
                      <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(book.status)}`}>
                        {book.status === "in-shelf" ? "Available" : book.status}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 text-sm text-[#64748B] dark:text-slate-400">{book.category}</div>

                  {/* Rating */}
                  <div className="col-span-1 flex items-center justify-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100">{book.rating?.toFixed(1)}</span>
                  </div>

                  {/* Copies */}
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${stockTextClass[getStockLevel(book.hardCopyCount)]}`}>
                      {book.hardCopyCount} left{getStockLevel(book.hardCopyCount) === 'low' ? ' (Low)' : ''}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className="text-xs font-bold text-[#3B4FE8] dark:text-indigo-400">Rs.{book.rentPrice}/day</span>
                    <Link
                      href={`/books/${book._id}`}
                      onClick={() => handleRent(book)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        book.hardCopyCount > 0 && book.status === "in-shelf"
                          ? "bg-[#3B4FE8] dark:bg-indigo-500 text-white hover:bg-[#2d3dd4]"
                          : "bg-[#F1F5F9] dark:bg-slate-800 text-[#94A3B8] dark:text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {book.hardCopyCount > 0 && book.status === "in-shelf" ? "Rent" : "Unavailable"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

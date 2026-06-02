"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star, Heart, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
}

const GENRES = ["All", "Fiction", "Non-Fiction", "Science", "History", "Academic", "Technology", "Biography"];

export default function BrowsePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("All");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const url = activeGenre === "All"
          ? "/books/search?q=&filter=All"
          : `/books/search?q=&filter=All&genre=${encodeURIComponent(activeGenre)}`;
        const res = await api.get(url);
        if (res.data.success) {
          setBooks(res.data.data.books ?? res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [activeGenre]);

  const toggleWishlist = async (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: "Removed from Wishlist" });
      } else {
        next.add(id);
        toast({ title: "Added to Wishlist", className: "bg-green-50 text-green-900 border-green-200" });
      }
      return next;
    });
  };

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E293B]">Browse Books</h1>
          <p className="text-[#64748B] mt-1">Explore our full collection</p>
        </div>

        {/* Genre Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeGenre === genre
                  ? "bg-[#3B4FE8] text-white shadow-sm"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#3B4FE8] hover:text-[#3B4FE8]"
              }`}
            >
              {genre}
            </button>
          ))}
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
            <BookOpen className="w-16 h-16 text-[#E2E8F0] mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No books found</h3>
            <p className="text-[#64748B] text-sm">Try a different genre or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {books.map((book) => (
              <div key={book._id} className="group relative">
                <Link href={`/books/${book._id}`} className="block">
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
                <button
                  onClick={() => toggleWishlist(book._id)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                >
                  <Heart
                    className={`w-4 h-4 ${wishlist.has(book._id) ? "fill-[#3B4FE8] text-[#3B4FE8]" : "text-[#64748B]"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

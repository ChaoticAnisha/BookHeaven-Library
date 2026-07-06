"use client";

import { useState, useEffect, Suspense } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import { BookOpen } from "lucide-react";
import BookCard from "@/components/books/BookCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useRouter, useSearchParams } from "next/navigation";

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

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGenre = searchParams.get("genre") || "All";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();

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

  const setActiveGenre = (genre: string) => {
    router.push(genre === "All" ? "/browse" : `/browse?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">Browse Books</h1>
        <p className="text-[#64748B] dark:text-slate-400 mt-1">Explore our full collection</p>
      </div>

      {/* Genre Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeGenre === genre
                ? "bg-[#3B4FE8] dark:bg-indigo-500 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:border-[#3B4FE8] dark:hover:border-indigo-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400"
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
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-slate-100 mb-2">No books found</h3>
          <p className="text-[#64748B] dark:text-slate-400 text-sm">Try a different genre or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              wishlisted={isWishlisted(book._id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <BrowseContent />
      </Suspense>
    </AuthLayout>
  );
}

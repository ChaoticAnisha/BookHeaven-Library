"use client";

import { useState, useEffect, Suspense } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Heart, Search as SearchIcon, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useWishlist } from "@/hooks/useWishlist";
import { getStockLevel, stockDotClass } from "@/lib/stock";

interface Book {
  _id: string;
  title: string;
  author: string;
  edition?: string;
  coverUrl: string;
  rating: number;
  category: string;
  hardCopyCount: number;
  eBookAvailable: boolean;
  audioBookAvailable: boolean;
  locationCode?: string;
  status: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "All";
  const genreParam = searchParams.get("genre") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "title">("relevance");
  const { isWishlisted, toggleWishlist } = useWishlist();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/books/search?q=${encodeURIComponent(q)}&filter=${filter}`;
      if (genreParam) url += `&genre=${encodeURIComponent(genreParam)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBooks(res.data.data.books);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [q, filter, genreParam]);

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0; // relevance = server order
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-shelf': return <span className="bg-[#22C55E] text-white text-xs px-2 py-1 rounded">In-Shelf</span>;
      case 'borrowed': return <span className="bg-[#7C3AED] text-white text-xs px-2 py-1 rounded">Borrowed</span>;
      case 'reserved': return <span className="bg-[#3B82F6] text-white text-xs px-2 py-1 rounded">Reserved</span>;
      default: return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100">Search Results</h1>
          {q && <p className="text-[#64748B] dark:text-slate-400 mt-1">Showing results for "{q}"</p>}
        </div>
        
        {/* Filter + sort cluster — kept together so related controls aren't scattered across the page */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg shadow-sm px-2 py-1">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="px-3 py-1.5 rounded-md text-sm font-medium text-[#1E293B] dark:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 flex items-center">
                {genreParam || "All Genres"} <ChevronDown className="ml-1.5 w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[#E2E8F0] dark:border-slate-700 py-2 mt-1 w-48 z-50 text-sm">
                {['Fiction', 'Non-Fiction', 'Science', 'History', 'Academic'].map(g => (
                  <DropdownMenu.Item key={g} className="px-4 py-2 outline-none hover:bg-[#F8FAFC] dark:hover:bg-slate-900 cursor-pointer">
                    <Link href={`/search?genre=${g}`} className="block w-full">{g}</Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div className="h-5 w-px bg-[#E2E8F0] dark:bg-slate-700" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-transparent text-sm font-medium text-[#1E293B] dark:text-slate-100 outline-none px-2 py-1.5 cursor-pointer"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="title">Sort: Title A-Z</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#64748B] dark:text-slate-400">Searching...</div>
        ) : books.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Ratings</th>
                <th className="p-4">Category</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
              {sortedBooks.map(book => (
                <tr key={book._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div>
                      <h4 className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{book.title}</h4>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">{book.author} {book.edition && `• ${book.edition}`}</p>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100">{book.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-sm text-[#1E293B] dark:text-slate-100">{book.category}</td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${stockDotClass[getStockLevel(book.hardCopyCount)]}`}></div>
                        Hard Copy{getStockLevel(book.hardCopyCount) === 'low' ? ' (Low Stock)' : ''}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${book.eBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        E-Book
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${book.audioBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        Audio
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col items-start gap-1">
                      {getStatusBadge(book.status)}
                      {book.locationCode && <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium">{book.locationCode}</span>}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right pr-6 space-x-3">
                    <button onClick={() => toggleWishlist(book._id)} className="text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400 transition-colors outline-none align-middle inline-block">
                      <Heart className={`w-5 h-5 ${isWishlisted(book._id) ? 'fill-[#3B4FE8] text-[#3B4FE8] dark:text-indigo-400' : ''}`} />
                    </button>
                    <Link href={`/books/${book._id}`} className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#1E293B] dark:text-slate-100 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors inline-block align-middle shadow-sm">
                      Preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <SearchIcon className="w-12 h-12 text-[#E2E8F0] mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] dark:text-slate-100 mb-2">No books found for '{q}'</h3>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mb-6 max-w-md">Try a different keyword or browse by genre</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Fiction', 'Non-Fiction', 'Science', 'History', 'Academic'].map(g => (
                <Link key={g} href={`/search?genre=${g}`} className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 px-3 py-1 rounded-full text-xs font-medium hover:text-[#3B4FE8] dark:hover:text-indigo-400 hover:border-[#3B4FE8] dark:hover:border-indigo-400 transition-colors">
                  {g}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </AuthLayout>
  );
}

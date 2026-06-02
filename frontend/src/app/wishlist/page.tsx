"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function WishlistPage() {
  // In a real app, wishlist would be fetched from backend.
  // Using local state and mocked empty/full state for demonstration.
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Mocking wishlist data fetch - reusing new arrivals logic to get SOME books for now
    // If you implemented wishlist backend, hit /api/users/wishlist
    const fetchBooks = async () => {
      try {
        const res = await api.get("/books/all?limit=3");
        if (res.data.success) {
          setBooks(res.data.data.books);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const removeWishlist = (id: string) => {
    setBooks(prev => prev.filter(b => b._id !== id));
    toast({ title: "Removed from Wishlist", description: "Undo" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-shelf': return <span className="bg-[#22C55E] text-white text-xs px-2 py-1 rounded">In-Shelf</span>;
      case 'borrowed': return <span className="bg-[#7C3AED] text-white text-xs px-2 py-1 rounded">Borrowed</span>;
      default: return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">{status}</span>;
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm font-medium text-[#64748B] hover:text-[#3B4FE8] mb-2 inline-block">← Back</Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Your Wishlist</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#64748B]">Loading...</div>
          ) : books.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Ratings</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {books.map(book => (
                  <tr key={book._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-4">
                      <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                      <div>
                        <h4 className="font-semibold text-[#1E293B] text-sm">{book.title}</h4>
                        <p className="text-xs text-[#64748B]">{book.author}</p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-[#1E293B]">{book.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-sm text-[#1E293B]">{book.category}</td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${book.hardCopyCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          Hard Copy
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(book.status)}
                    </td>
                    <td className="p-4 align-middle text-right pr-6 space-x-3">
                      <button onClick={() => removeWishlist(book._id)} className="text-[#3B4FE8] outline-none align-middle inline-block">
                        <Heart className="w-5 h-5 fill-[#3B4FE8]" />
                      </button>
                      <Link href={`/books/${book._id}`} className="bg-white border border-[#E2E8F0] text-[#1E293B] px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#F8FAFC] transition-colors inline-block align-middle shadow-sm">
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <Heart className="w-12 h-12 text-[#E2E8F0] mb-4" />
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">You haven't saved any books yet</h3>
              <p className="text-[#64748B] text-sm mb-6 max-w-md">Start browsing to add books to your wishlist.</p>
              <Link href="/search" className="bg-[#1A1A2E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2d2d4a] transition-colors">
                Browse Books
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

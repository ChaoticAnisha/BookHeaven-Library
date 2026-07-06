"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";

export interface BookCardBook {
  _id: string;
  title: string;
  author: string;
  coverUrl?: string;
  rating?: number;
  rentPrice?: number;
}

export default function BookCard({
  book,
  wishlisted,
  onToggleWishlist,
}: {
  book: BookCardBook;
  wishlisted?: boolean;
  onToggleWishlist?: (bookId: string) => void;
}) {
  return (
    <div className="group relative">
      <Link href={`/books/${book._id}`} className="block">
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] aspect-[3/4] w-full rounded-xl overflow-hidden shadow-sm border border-[#E2E8F0] dark:border-slate-700 group-hover:shadow-md group-hover:border-[#3B4FE8]/30 transition-all">
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
          <h3 className="font-semibold text-sm text-[#1E293B] dark:text-slate-100 line-clamp-1 group-hover:text-[#3B4FE8] dark:group-hover:text-indigo-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-1">{book.author}</p>
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-[#1E293B] dark:text-slate-100">{book.rating?.toFixed(1) ?? "0.0"}</span>
            </div>
            {typeof book.rentPrice === "number" && (
              <span className="text-[10px] text-[#3B4FE8] dark:text-indigo-400 font-semibold">Rs.{book.rentPrice}/day</span>
            )}
          </div>
        </div>
      </Link>
      {onToggleWishlist && (
        <button
          onClick={() => onToggleWishlist(book._id)}
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white dark:hover:bg-slate-800"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-[#3B4FE8] text-[#3B4FE8] dark:text-indigo-400" : "text-[#64748B] dark:text-slate-400"}`} />
        </button>
      )}
    </div>
  );
}

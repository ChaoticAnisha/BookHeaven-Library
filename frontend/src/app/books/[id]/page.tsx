"use client";

import { useState, useEffect } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, Share2, MessageSquare, BookOpen, Heart, ArrowLeft, Headphones, QrCode, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function BookDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const { toast } = useToast();

  const [rentData, setRentData] = useState({
    fromDate: "",
    toDate: "",
    purpose: ""
  });
  const [renting, setRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);
  const [rentModalOpen, setRentModalOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data.success) {
          setBook(res.data.data);
          // Pre-fill dates
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          setRentData({
            ...rentData,
            fromDate: today.toISOString().split('T')[0],
            toDate: nextWeek.toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  const toggleWishlist = () => {
    setWishlist(!wishlist);
    if (!wishlist) {
      toast({ title: "Added to Wishlist", className: "bg-[#3B4FE8] text-white border-none" });
    }
  };

  const handleRent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenting(true);
    try {
      const res = await api.post("/rentals", {
        bookId: book._id,
        serialNumber: book.serialNumber,
        fromDate: rentData.fromDate,
        toDate: rentData.toDate,
        purpose: rentData.purpose
      });
      if (res.data.success) {
        setRentSuccess(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to rent", variant: "destructive" });
    } finally {
      setRenting(false);
    }
  };

  if (loading) return <AuthLayout><div className="p-20 text-center">Loading...</div></AuthLayout>;
  if (!book) return <AuthLayout><div className="p-20 text-center">Book not found</div></AuthLayout>;

  return (
    <AuthLayout>
      <div className="max-w-6xl mx-auto pb-10">
        <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-[#64748B] hover:text-[#3B4FE8] mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
              <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-full aspect-[2/3] object-cover rounded shadow-md mb-6" />
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">Hard Copy</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{book.hardCopyCount > 0 ? `${book.hardCopyCount} Available` : 'Unavailable'}</span>
                    <div className={`w-2 h-2 rounded-full ${book.hardCopyCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">E-Book</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{book.eBookAvailable ? 'Available' : 'Unavailable'}</span>
                    <div className={`w-2 h-2 rounded-full ${book.eBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">Audio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{book.audioBookAvailable ? 'Available' : 'Unavailable'}</span>
                    <div className={`w-2 h-2 rounded-full ${book.audioBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              </div>

              {book.locationCode && (
                <div className="bg-[#F8FAFC] p-3 rounded-lg text-center mb-6">
                  <span className="text-xs text-[#64748B] block mb-1">Shelf Location</span>
                  <span className="font-bold text-[#1E293B]">{book.locationCode}</span>
                </div>
              )}

              <button className="w-full py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#1E293B] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2">
                Add to List
              </button>

              <div className="flex justify-center gap-6 mt-6 text-[#64748B]">
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8]">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Review</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8]">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Notes</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8]">
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* CENTRE COLUMN */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-[#1E293B] leading-tight">{book.title}</h1>
              <button onClick={toggleWishlist} className="mt-1 outline-none">
                <Heart className={`w-8 h-8 transition-colors ${wishlist ? 'fill-[#3B4FE8] text-[#3B4FE8]' : 'text-[#E2E8F0] hover:text-red-400'}`} />
              </button>
            </div>
            
            <p className="text-lg text-[#64748B] mb-4">By <span className="font-medium text-[#3B4FE8]">{book.author}</span>, {book.year} {book.edition && `• ${book.edition}`}</p>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-[#1E293B] ml-2">{book.rating.toFixed(1)}</span>
                <span className="text-sm text-[#64748B] ml-1">({book.ratingCount} Ratings)</span>
              </div>
              <div className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#1E293B]">{book.currentlyReading || 12}</span> Currently reading
              </div>
              <div className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#1E293B]">{book.haveRead || 119}</span> Have read
              </div>
            </div>

            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[#E2E8F0]">
              <Dialog.Root open={rentModalOpen} onOpenChange={setRentModalOpen}>
                <Dialog.Trigger asChild>
                  <button className="bg-[#1A1A2E] text-white px-10 py-3 rounded-lg font-semibold hover:bg-[#2d2d4a] transition-colors shadow-md">
                    RENT
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95">
                    
                    {!rentSuccess ? (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <Dialog.Title className="text-xl font-bold text-[#1E293B]">Fill Up the Details</Dialog.Title>
                          <Dialog.Close className="text-[#64748B] hover:text-[#1E293B]"><X className="w-5 h-5" /></Dialog.Close>
                        </div>
                        <form onSubmit={handleRent} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-[#64748B] mb-1">From</label>
                              <input type="date" value={rentData.fromDate} onChange={e => setRentData({...rentData, fromDate: e.target.value})} className="w-full text-sm border border-[#E2E8F0] p-2 rounded outline-none focus:border-[#3B4FE8]" required />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#64748B] mb-1">To</label>
                              <input type="date" value={rentData.toDate} onChange={e => setRentData({...rentData, toDate: e.target.value})} className="w-full text-sm border border-[#E2E8F0] p-2 rounded outline-none focus:border-[#3B4FE8]" required />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#64748B] mb-1">Book Serial No</label>
                            <div className="relative">
                              <input type="text" value={book.serialNumber} readOnly className="w-full text-sm border border-[#E2E8F0] bg-[#F8FAFC] p-2 rounded outline-none text-[#64748B]" />
                              <QrCode className="absolute right-2 top-2 w-4 h-4 text-[#64748B]" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#64748B] mb-1">Description/Purpose (Optional)</label>
                            <textarea rows={3} value={rentData.purpose} onChange={e => setRentData({...rentData, purpose: e.target.value})} className="w-full text-sm border border-[#E2E8F0] p-2 rounded outline-none focus:border-[#3B4FE8] resize-none" placeholder="e.g. For college assignment"></textarea>
                          </div>
                          <button type="submit" disabled={renting} className="w-full bg-[#1A1A2E] text-white py-3 rounded-lg font-semibold hover:bg-[#2d2d4a] transition-colors mt-2">
                            {renting ? "Processing..." : "RENT"}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Process Completed</h3>
                        <p className="text-[#64748B] mb-8">Rental confirmed — due {new Date(rentData.toDate).toLocaleDateString()}</p>
                        <button onClick={() => setRentModalOpen(false)} className="w-full bg-[#1A1A2E] text-white py-3 rounded-lg font-semibold hover:bg-[#2d2d4a]">
                          Back to Book
                        </button>
                      </div>
                    )}

                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <button className="bg-[#10B981] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#059669] transition-colors shadow-md">
                Read Now
              </button>
              <button className="w-12 h-12 flex items-center justify-center border-2 border-[#E2E8F0] rounded-lg text-[#64748B] hover:border-[#3B4FE8] hover:text-[#3B4FE8] transition-colors">
                <Headphones className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 flex gap-6 text-sm font-medium border-b border-[#E2E8F0]">
              <span className="text-[#3B4FE8] border-b-2 border-[#3B4FE8] pb-2 cursor-pointer">Overview</span>
              <span className="text-[#64748B] hover:text-[#1E293B] pb-2 cursor-pointer">Editions</span>
              <span className="text-[#64748B] hover:text-[#1E293B] pb-2 cursor-pointer">Details</span>
              <span className="text-[#64748B] hover:text-[#1E293B] pb-2 cursor-pointer">Reviews</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <span className="block text-xs text-[#64748B] mb-1">Publish Date</span>
                <span className="font-semibold text-[#1E293B]">{book.year}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] mb-1">Publisher</span>
                <span className="font-semibold text-[#1E293B]">{book.publisher || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] mb-1">Language</span>
                <span className="font-semibold text-[#1E293B]">{book.language || 'English'}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] mb-1">Pages</span>
                <span className="font-semibold text-[#1E293B]">{book.pages}</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[#64748B] leading-relaxed">
                {book.description || "No description provided for this book yet. It remains an enigma waiting to be explored by avid readers."}
                <span className="text-[#3B4FE8] font-medium cursor-pointer ml-1 hover:underline">Read more</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#1E293B] mb-4">Community Reviews</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] uppercase mb-2">Pace</span>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#3B4FE8] h-full w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] uppercase mb-2">Readability</span>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full w-[90%]"></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] uppercase mb-2">Interesting</span>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full md:w-[250px] flex-shrink-0 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-[#1E293B] text-sm mb-4">About Author</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">{book.author.charAt(0)}</div>
                </div>
                <span className="font-semibold text-[#1E293B] text-sm">{book.author}</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                A renowned author known for their deep insights and captivating writing style in the {book.category} genre.
              </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-[#1E293B] text-sm mb-4">Other Books</h4>
              <div className="flex gap-2">
                <div className="w-16 h-24 bg-gray-200 rounded shadow-sm"></div>
                <div className="w-16 h-24 bg-gray-200 rounded shadow-sm"></div>
                <div className="w-16 h-24 bg-gray-200 rounded shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

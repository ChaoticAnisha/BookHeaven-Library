"use client";

import { useState, useEffect, useRef } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, Share2, MessageSquare, BookOpen, Heart, ArrowLeft, Headphones, QrCode, X, Wallet, Landmark, Receipt, ChevronRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useWishlist } from "@/hooks/useWishlist";
import Button from "@/components/ui/Button";
import { getStockLevel, stockDotClass, stockTextClass } from "@/lib/stock";
import { getTierMaxDays } from "@/lib/membershipTiers";
import { useAuth } from "@/context/AuthContext";

type PaymentMethodKey = "khalti" | "esewa" | "credit";
type RentStep = "dates" | "payment" | "confirm" | "complete";

const PAYMENT_METHODS: { key: PaymentMethodKey; label: string; description: string; icon: React.ReactNode; bg: string }[] = [
  {
    key: "khalti",
    label: "Khalti",
    description: "Pay securely with your Khalti digital wallet",
    icon: <Wallet className="w-6 h-6" />,
    bg: "bg-gradient-to-br from-[#5C2D91] to-[#7B3FAF]",
  },
  {
    key: "esewa",
    label: "eSewa",
    description: "Quick payment through eSewa digital wallet",
    icon: <Landmark className="w-6 h-6" />,
    bg: "bg-gradient-to-br from-[#60BB46] to-[#3E8E28]",
  },
  {
    key: "credit",
    label: "Pay Later",
    description: "Defer payment to your account credit balance",
    icon: <Receipt className="w-6 h-6" />,
    bg: "bg-gradient-to-br from-[#4B5563] to-[#6B7280]",
  },
];

const STEP_NUMBER: Record<RentStep, number> = { dates: 1, payment: 2, confirm: 3, complete: 4 };
const STEP_LABEL: Record<RentStep, string> = { dates: "Select Dates", payment: "Payment Method", confirm: "Confirm", complete: "Complete" };

export default function BookDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();
  const maxLoanDays = getTierMaxDays(user?.membership);

  const [rentData, setRentData] = useState({
    fromDate: "",
    toDate: "",
    purpose: ""
  });
  const [renting, setRenting] = useState(false);
  const [rentError, setRentError] = useState<string | null>(null);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [rentStep, setRentStep] = useState<RentStep>("dates");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodKey | null>(null);
  const [redirectingTo, setRedirectingTo] = useState<"khalti" | "esewa" | null>(null);

  const esewaFormRef = useRef<HTMLFormElement>(null);
  const [esewaFormData, setEsewaFormData] = useState<Record<string, string> | null>(null);
  const [esewaPaymentUrl, setEsewaPaymentUrl] = useState("");

  useEffect(() => {
    if (esewaFormData && esewaFormRef.current) {
      esewaFormRef.current.submit();
    }
  }, [esewaFormData]);

  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const [bookRes, rentalsRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get('/rentals/my').catch(() => null),
        ]);
        if (bookRes.data.success) {
          setBook(bookRes.data.data);
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
        if (rentalsRes?.data?.success) {
          const rentals = rentalsRes.data.data || [];
          const owned = rentals.some(
            (r: any) => r.book?._id === id && (r.status === "active" || r.status === "overdue")
          );
          setHasActiveRental(owned);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await api.get(`/books/similar/${id}?limit=6`);
        if (res.data.success) setSimilarBooks(res.data.data);
      } catch (error) {
        console.error("Failed to fetch similar books", error);
      }
    };
    if (id) fetchSimilar();
  }, [id]);

  const rentDays = rentData.fromDate && rentData.toDate
    ? Math.max(1, Math.ceil((new Date(rentData.toDate).getTime() - new Date(rentData.fromDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const rentTotalCost = (book?.rentPrice || 0) * rentDays;

  const handleDatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRentStep("payment");
  };

  const handleSelectPaymentMethod = (method: PaymentMethodKey) => {
    setSelectedPaymentMethod(method);
    setRentStep("confirm");
  };

  const handleConfirmAndPay = async () => {
    if (!selectedPaymentMethod) return;
    setRenting(true);
    setRentError(null);
    try {
      const rentalRes = await api.post("/rentals", {
        bookId: book._id,
        serialNumber: book.serialNumber || `SN-${book._id.substring(0, 5)}`,
        fromDate: rentData.fromDate,
        toDate: rentData.toDate,
        purpose: rentData.purpose
      });
      if (!rentalRes.data.success) {
        throw new Error(rentalRes.data.message || "Could not create rental");
      }
      const rentalId = rentalRes.data.data._id;

      switch (selectedPaymentMethod) {
        case "khalti": {
          const res = await api.post("/payments/khalti/initiate", { rentalId, amount: rentTotalCost });
          if (res.data.success && res.data.data.payment_url) {
            setRentStep("complete");
            setRedirectingTo("khalti");
            window.location.href = res.data.data.payment_url;
            return;
          }
          break;
        }
        case "esewa": {
          const res = await api.post("/payments/esewa/initiate", { rentalId, amount: rentTotalCost });
          if (res.data.success) {
            setRentStep("complete");
            setRedirectingTo("esewa");
            setEsewaPaymentUrl(res.data.data.paymentUrl);
            setEsewaFormData(res.data.data.formData);
            return;
          }
          break;
        }
        case "credit": {
          const res = await api.post("/payments/credit", { rentalId, amount: rentTotalCost });
          if (res.data.success) {
            setRentStep("complete");
          }
          break;
        }
      }
    } catch (err: any) {
      setRentError(err.response?.data?.message || err.message || "Could not complete the rental. Please try again.");
    } finally {
      setRenting(false);
    }
  };

  if (loading) return <AuthLayout><div className="p-20 text-center">Loading...</div></AuthLayout>;
  if (!book) return <AuthLayout><div className="p-20 text-center">Book not found</div></AuthLayout>;

  return (
    <AuthLayout>
      <div className="max-w-6xl mx-auto pb-10">
        <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm">
              <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-full aspect-[2/3] object-cover rounded shadow-md mb-6" />
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B] dark:text-slate-400">Hard Copy</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${stockTextClass[getStockLevel(book.hardCopyCount)]}`}>
                      {book.hardCopyCount > 0
                        ? `${book.hardCopyCount} Available${getStockLevel(book.hardCopyCount) === 'low' ? ' (Low Stock)' : ''}`
                        : 'Unavailable'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${stockDotClass[getStockLevel(book.hardCopyCount)]}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B] dark:text-slate-400">E-Book</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{book.eBookAvailable ? 'Available' : 'Unavailable'}</span>
                    <div className={`w-2 h-2 rounded-full ${book.eBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B] dark:text-slate-400">Audio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{book.audioBookAvailable ? 'Available' : 'Unavailable'}</span>
                    <div className={`w-2 h-2 rounded-full ${book.audioBookAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              </div>

              {book.locationCode && (
                <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-lg text-center mb-6">
                  <span className="text-xs text-[#64748B] dark:text-slate-400 block mb-1">Shelf Location</span>
                  <span className="font-bold text-[#1E293B] dark:text-slate-100">{book.locationCode}</span>
                </div>
              )}

              <button className="w-full py-2.5 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-sm font-semibold text-[#1E293B] dark:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                Add to List
              </button>

              <div className="flex justify-center gap-6 mt-6 text-[#64748B] dark:text-slate-400">
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Review</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Notes</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium uppercase">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* CENTRE COLUMN */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-[#1E293B] dark:text-slate-100 leading-tight">{book.title}</h1>
              <Button variant="ghost" size="icon" className="mt-1 h-10 w-10" onClick={() => toggleWishlist(book._id)}>
                <Heart className={`w-6 h-6 transition-colors ${isWishlisted(book._id) ? 'fill-[#3B4FE8] text-[#3B4FE8] dark:text-indigo-400' : 'text-[#E2E8F0] hover:text-red-400'}`} />
              </Button>
            </div>
            
            <p className="text-lg text-[#64748B] dark:text-slate-400 mb-4">By <span className="font-medium text-[#3B4FE8] dark:text-indigo-400">{book.author}</span>, {book.year} {book.edition && `• ${book.edition}`}</p>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-[#1E293B] dark:text-slate-100 ml-2">{book.rating.toFixed(1)}</span>
                <span className="text-sm text-[#64748B] dark:text-slate-400 ml-1">({book.ratingCount} Ratings)</span>
              </div>
              <div className="text-sm text-[#64748B] dark:text-slate-400">
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.currentlyReading || 12}</span> Currently reading
              </div>
              <div className="text-sm text-[#64748B] dark:text-slate-400">
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.haveRead || 119}</span> Have read
              </div>
            </div>

            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[#E2E8F0] dark:border-slate-700">
              <Dialog.Root
                open={rentModalOpen}
                onOpenChange={(open) => {
                  setRentModalOpen(open);
                  if (!open) {
                    setRentStep("dates");
                    setSelectedPaymentMethod(null);
                    setRentError(null);
                    setRedirectingTo(null);
                    setEsewaFormData(null);
                  }
                }}
              >
                <Dialog.Trigger asChild>
                  <Button variant="primary" size="lg" className="px-10 shadow-md">
                    RENT
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95">

                    {/* Progress Indicator — Nielsen H1: Visibility of System Status */}
                    {rentStep !== "complete" && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">
                            Step {STEP_NUMBER[rentStep]} of 4
                          </span>
                          <span className="text-xs font-medium text-[#3B4FE8] dark:text-indigo-400">{STEP_LABEL[rentStep]}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className={`h-1.5 flex-1 rounded-full ${n <= STEP_NUMBER[rentStep] ? "bg-[#3B4FE8] dark:bg-indigo-500" : "bg-[#E2E8F0] dark:bg-slate-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 1: Dates */}
                    {rentStep === "dates" && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <Dialog.Title className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Fill Up the Details</Dialog.Title>
                          <Dialog.Close className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"><X className="w-5 h-5" /></Dialog.Close>
                        </div>
                        <form onSubmit={handleDatesSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">From</label>
                              <input
                                type="date"
                                value={rentData.fromDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => {
                                  const newFrom = e.target.value;
                                  const maxTo = new Date(newFrom);
                                  maxTo.setDate(maxTo.getDate() + maxLoanDays);
                                  const maxToStr = maxTo.toISOString().split('T')[0];
                                  setRentData({
                                    ...rentData,
                                    fromDate: newFrom,
                                    toDate: rentData.toDate > maxToStr || rentData.toDate <= newFrom ? maxToStr : rentData.toDate,
                                  });
                                }}
                                className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2 rounded outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">To</label>
                              <input
                                type="date"
                                value={rentData.toDate}
                                min={rentData.fromDate}
                                max={(() => {
                                  const maxTo = new Date(rentData.fromDate || new Date());
                                  maxTo.setDate(maxTo.getDate() + maxLoanDays);
                                  return maxTo.toISOString().split('T')[0];
                                })()}
                                onChange={e => setRentData({...rentData, toDate: e.target.value})}
                                className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2 rounded outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400"
                                required
                              />
                            </div>
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-slate-400 -mt-2">
                            Your {user?.membership || "Basic"} plan allows up to {maxLoanDays} days per rental.
                          </p>
                          <div>
                            <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Book Serial No</label>
                            <div className="relative">
                              <input type="text" value={book.serialNumber || `SN-${book._id.substring(0, 5)}`} readOnly className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 p-2 rounded outline-none text-[#64748B] dark:text-slate-400" />
                              <QrCode className="absolute right-2 top-2 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mb-1">Description/Purpose (Optional)</label>
                            <textarea rows={3} value={rentData.purpose} onChange={e => setRentData({...rentData, purpose: e.target.value})} className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2 rounded outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 resize-none" placeholder="e.g. For college assignment"></textarea>
                          </div>
                          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                            Continue
                          </Button>
                        </form>
                      </>
                    )}

                    {/* STEP 2: Payment Method — Nielsen H3: User Control and Freedom (back available) */}
                    {rentStep === "payment" && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <Dialog.Title className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Choose Payment Method</Dialog.Title>
                          <Dialog.Close className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"><X className="w-5 h-5" /></Dialog.Close>
                        </div>
                        <div className="space-y-3">
                          {PAYMENT_METHODS.map((pm) => (
                            <button
                              key={pm.key}
                              onClick={() => handleSelectPaymentMethod(pm.key)}
                              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E2E8F0] dark:border-slate-700 hover:border-[#3B4FE8] dark:hover:border-indigo-400 hover:shadow-md transition-all text-left"
                            >
                              <div className={`w-12 h-12 shrink-0 ${pm.bg} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                                {pm.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{pm.label}</p>
                                <p className="text-xs text-[#94A3B8] dark:text-slate-500 mt-0.5">{pm.description}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#CBD5E1] dark:text-slate-600" />
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setRentStep("dates")}
                          className="flex items-center text-sm text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 mt-5 transition-colors"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
                        </button>
                      </>
                    )}

                    {/* STEP 3: Confirmation */}
                    {rentStep === "confirm" && selectedPaymentMethod && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <Dialog.Title className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Confirm Your Rental</Dialog.Title>
                          <Dialog.Close className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"><X className="w-5 h-5" /></Dialog.Close>
                        </div>

                        <div className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E2E8F0] dark:border-slate-700">
                            <img src={book.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                            <div>
                              <p className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{book.title}</p>
                              <p className="text-xs text-[#64748B] dark:text-slate-400">{book.author}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#64748B] dark:text-slate-400">Rental Period</span>
                              <span className="text-[#1E293B] dark:text-slate-100 font-medium">
                                {new Date(rentData.fromDate).toLocaleDateString()} - {new Date(rentData.toDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#64748B] dark:text-slate-400">Duration</span>
                              <span className="text-[#1E293B] dark:text-slate-100 font-medium">{rentDays} day{rentDays !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#64748B] dark:text-slate-400">Rate</span>
                              <span className="text-[#1E293B] dark:text-slate-100 font-medium">Rs.{book.rentPrice}/day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#64748B] dark:text-slate-400">Payment Method</span>
                              <span className="text-[#1E293B] dark:text-slate-100 font-medium">
                                {PAYMENT_METHODS.find(p => p.key === selectedPaymentMethod)?.label}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-dashed border-[#E2E8F0] dark:border-slate-700">
                              <span className="font-semibold text-[#1E293B] dark:text-slate-100">Total Cost</span>
                              <span className="font-bold text-lg text-[#1E293B] dark:text-slate-100">Rs.{rentTotalCost}</span>
                            </div>
                          </div>
                        </div>

                        {rentError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                            {rentError}
                          </div>
                        )}

                        <Button type="button" variant="primary" size="lg" disabled={renting} className="w-full" onClick={handleConfirmAndPay}>
                          {renting ? "Processing..." : `Confirm & Pay Rs.${rentTotalCost}`}
                        </Button>
                        <button
                          onClick={() => setRentStep("payment")}
                          disabled={renting}
                          className="flex items-center text-sm text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 mt-4 transition-colors disabled:opacity-50"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
                        </button>
                      </>
                    )}

                    {/* STEP 4: Complete — redirecting to gateway, or immediate success (Pay Later) */}
                    {rentStep === "complete" && (
                      <div className="text-center py-8">
                        {redirectingTo ? (
                          <>
                            <div className="w-12 h-12 border-4 border-[#3B4FE8] dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">
                              Redirecting to {redirectingTo === "khalti" ? "Khalti" : "eSewa"}...
                            </h3>
                            <p className="text-[#64748B] dark:text-slate-400 text-sm">Please wait, you&apos;ll be taken to the payment gateway shortly.</p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">Rental Confirmed</h3>
                            <p className="text-[#64748B] dark:text-slate-400 mb-2">Due {new Date(rentData.toDate).toLocaleDateString()} • Payment deferred to account credit</p>
                            <p className="text-[#94A3B8] dark:text-slate-500 text-xs mb-8">Rs.{rentTotalCost} will be added to your account balance.</p>
                            <Button variant="primary" size="lg" className="w-full" onClick={() => setRentModalOpen(false)}>
                              Back to Book
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              {/* Hidden eSewa form for redirect */}
              {esewaFormData && (
                <form ref={esewaFormRef} method="POST" action={esewaPaymentUrl} style={{ display: "none" }}>
                  {Object.entries(esewaFormData).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                  ))}
                </form>
              )}

              <Button onClick={() => router.push(`/read/${id}`)} size="lg" className="bg-[#10B981] hover:bg-[#059669] px-8 shadow-md">
                Read Now
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 border-2 hover:border-[#3B4FE8] dark:hover:border-indigo-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400">
                <Headphones className="w-6 h-6" />
              </Button>
            </div>

            {book.audioBookAvailable && hasActiveRental && book.audioUrl && (
              <div className="mb-8 -mt-6 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="w-4 h-4 text-[#3B4FE8] dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">Listen to Audiobook</span>
                </div>
                <audio controls className="w-full" src={book.audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <div className="mb-6 flex gap-6 text-sm font-medium border-b border-[#E2E8F0] dark:border-slate-700">
              <span className="text-[#3B4FE8] dark:text-indigo-400 border-b-2 border-[#3B4FE8] dark:border-indigo-400 pb-2 cursor-pointer">Overview</span>
              <span className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 pb-2 cursor-pointer">Editions</span>
              <span className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 pb-2 cursor-pointer">Details</span>
              <span className="text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 pb-2 cursor-pointer">Reviews</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <span className="block text-xs text-[#64748B] dark:text-slate-400 mb-1">Publish Date</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.year}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] dark:text-slate-400 mb-1">Publisher</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.publisher || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] dark:text-slate-400 mb-1">Language</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.language || 'English'}</span>
              </div>
              <div>
                <span className="block text-xs text-[#64748B] dark:text-slate-400 mb-1">Pages</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">{book.pages}</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[#64748B] dark:text-slate-400 leading-relaxed">
                {book.description || "No description provided for this book yet. It remains an enigma waiting to be explored by avid readers."}
                <span className="text-[#3B4FE8] dark:text-indigo-400 font-medium cursor-pointer ml-1 hover:underline">Read more</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-slate-100 mb-4">Community Reviews</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase mb-2">Pace</span>
                  <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#3B4FE8] dark:bg-indigo-500 h-full w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase mb-2">Readability</span>
                  <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full w-[90%]"></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase mb-2">Interesting</span>
                  <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full md:w-[250px] flex-shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-[#1E293B] dark:text-slate-100 text-sm mb-4">About Author</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">{book.author.charAt(0)}</div>
                </div>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{book.author}</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                A renowned author known for their deep insights and captivating writing style in the {book.category} genre.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-[#1E293B] dark:text-slate-100 text-sm mb-4">Other Books</h4>
              <div className="flex gap-2">
                {similarBooks.length === 0 ? (
                  <>
                    <div className="w-16 h-24 bg-gray-200 dark:bg-slate-700 rounded shadow-sm"></div>
                    <div className="w-16 h-24 bg-gray-200 dark:bg-slate-700 rounded shadow-sm"></div>
                    <div className="w-16 h-24 bg-gray-200 dark:bg-slate-700 rounded shadow-sm"></div>
                  </>
                ) : (
                  similarBooks.slice(0, 3).map((sb) => (
                    <Link key={sb._id} href={`/books/${sb._id}`} className="w-16 h-24 shrink-0 rounded shadow-sm overflow-hidden bg-gray-200 dark:bg-slate-700 hover:scale-105 transition-transform">
                      {sb.coverUrl ? (
                        <img src={sb.coverUrl} alt={sb.title} className="w-full h-full object-cover" />
                      ) : null}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        {similarBooks.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-4">You Might Also Like</h3>
            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar">
              {similarBooks.map((sb) => (
                <Link
                  key={sb._id}
                  href={`/books/${sb._id}`}
                  className="w-44 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-3 space-y-3 shrink-0 hover:shadow-md hover:border-[#3B4FE8]/30 transition-all group"
                >
                  <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] aspect-[3/4] w-full rounded-lg overflow-hidden relative shadow-sm border border-[#F1F5F9] dark:border-slate-800">
                    {sb.coverUrl ? (
                      <img src={sb.coverUrl} alt={sb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-center text-[10px] font-semibold text-slate-400">
                        {sb.title}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1E293B] dark:text-slate-100 line-clamp-1 group-hover:text-[#3B4FE8] dark:group-hover:text-indigo-400 transition-colors leading-tight">
                      {sb.title}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-1">{sb.author}</p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-[#94A3B8] dark:text-slate-500">{sb.year}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-[#1E293B] dark:text-slate-100">{sb.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

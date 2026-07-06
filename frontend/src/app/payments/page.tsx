"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Landmark,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type PaymentMethodType = "khalti" | "esewa" | "card" | "credit";
type TabType = "pending" | "history";

const METHOD_CONFIG: Record<
  PaymentMethodType,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; description: string }
> = {
  khalti: {
    label: "Khalti",
    color: "#5C2D91",
    bg: "bg-gradient-to-br from-[#5C2D91] to-[#7B3FAF]",
    border: "border-[#5C2D91]/30",
    icon: <Wallet className="w-6 h-6" />,
    description: "Pay securely with your Khalti wallet",
  },
  esewa: {
    label: "eSewa",
    color: "#60BB46",
    bg: "bg-gradient-to-br from-[#60BB46] to-[#3E8E28]",
    border: "border-[#60BB46]/30",
    icon: <Landmark className="w-6 h-6" />,
    description: "Quick payment through eSewa digital wallet",
  },
  card: {
    label: "Card",
    color: "#1E40AF",
    bg: "bg-gradient-to-br from-[#1E40AF] to-[#3B82F6]",
    border: "border-[#1E40AF]/30",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Pay with Visa, Mastercard, or other cards",
  },
  credit: {
    label: "Account Credit",
    color: "#6B7280",
    bg: "bg-gradient-to-br from-[#4B5563] to-[#6B7280]",
    border: "border-[#6B7280]/30",
    icon: <Receipt className="w-6 h-6" />,
    description: "Defer payment to your account balance",
  },
};

function PaymentsContent() {
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedBookTitle, setSelectedBookTitle] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "confirm">("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [processing, setProcessing] = useState(false);
  const [redirecting, setRedirecting] = useState<"khalti" | "esewa" | null>(null);

  // eSewa form ref
  const esewaFormRef = useRef<HTMLFormElement>(null);
  const [esewaFormData, setEsewaFormData] = useState<Record<string, string> | null>(null);
  const [esewaPaymentUrl, setEsewaPaymentUrl] = useState("");

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if coming back from Khalti success
    const khaltiStatus = searchParams.get("khalti");
    const pidx = searchParams.get("pidx");

    // Check if coming back from eSewa
    const esewaStatus = searchParams.get("esewa");
    const esewaData = searchParams.get("data");

    if (khaltiStatus === "success" && pidx) {
      verifyKhalti(pidx);
    } else if (esewaStatus === "success" && esewaData) {
      verifyEsewa(esewaData);
    } else if (esewaStatus === "failed") {
      toast({ title: "Payment Failed", description: "eSewa payment was cancelled or failed", variant: "destructive" });
      fetchPendingPayments();
    } else {
      fetchPendingPayments();
    }
  }, [searchParams]);

  // Auto-submit eSewa form when data is ready
  useEffect(() => {
    if (esewaFormData && esewaFormRef.current) {
      esewaFormRef.current.submit();
    }
  }, [esewaFormData]);

  const verifyKhalti = async (pidx: string) => {
    try {
      const res = await api.post("/payments/khalti/verify", { pidx });
      if (res.data.success) {
        setPaySuccess(true);
        setPayModalOpen(true);
        setTimeout(() => {
          setPayModalOpen(false);
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: "Could not verify Khalti payment", variant: "destructive" });
      fetchPendingPayments();
    }
  };

  const verifyEsewa = async (data: string) => {
    try {
      const res = await api.post("/payments/esewa/verify", { data });
      if (res.data.success) {
        setPaySuccess(true);
        setPayModalOpen(true);
        setTimeout(() => {
          setPayModalOpen(false);
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: "Could not verify eSewa payment", variant: "destructive" });
      fetchPendingPayments();
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const res = await api.get("/rentals/my");
      if (res.data.success) {
        const withPenalty = res.data.data.filter(
          (r: any) => new Date(r.toDate) < new Date() && r.status !== "returned" && !r.penaltyPaid
        );
        setPayments(withPenalty);
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (paymentHistory.length > 0) return; // already fetched
    setHistoryLoading(true);
    try {
      const res = await api.get("/payments/history");
      if (res.data.success) {
        setPaymentHistory(res.data.data);
      }
    } catch (error) {
      console.error("Fetch history failed", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openPayModal = (rentalId: string, amount: number, bookTitle: string) => {
    setSelectedRentalId(rentalId);
    setSelectedAmount(amount || 50);
    setSelectedBookTitle(bookTitle);
    setPaySuccess(false);
    setPaymentStep("select");
    setSelectedMethod(null);
    setProcessing(false);
    setRedirecting(null);
    setPayModalOpen(true);
  };

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setPaymentStep("confirm");
  };

  const handlePayment = async () => {
    if (!selectedMethod || !selectedRentalId) return;
    setProcessing(true);
    let redirectInProgress = false;

    try {
      switch (selectedMethod) {
        case "khalti": {
          const res = await api.post("/payments/khalti/initiate", {
            rentalId: selectedRentalId,
            amount: selectedAmount,
          });
          if (res.data.success && res.data.data.payment_url) {
            redirectInProgress = true;
            setRedirecting("khalti");
            window.location.href = res.data.data.payment_url;
            return; // don't stop processing — page will redirect
          }
          break;
        }
        case "esewa": {
          const res = await api.post("/payments/esewa/initiate", {
            rentalId: selectedRentalId,
            amount: selectedAmount,
          });
          if (res.data.success) {
            redirectInProgress = true;
            setRedirecting("esewa");
            setEsewaPaymentUrl(res.data.data.paymentUrl);
            setEsewaFormData(res.data.data.formData);
            return; // form will auto-submit
          }
          break;
        }
        case "card": {
          const res = await api.post("/payments/card", {
            rentalId: selectedRentalId,
            amount: selectedAmount,
          });
          if (res.data.success) {
            setPaySuccess(true);
            setTimeout(() => {
              setPayModalOpen(false);
              router.push("/dashboard");
            }, 3000);
          }
          break;
        }
        case "credit": {
          const res = await api.post("/payments/credit", {
            rentalId: selectedRentalId,
          });
          if (res.data.success) {
            setPaySuccess(true);
            setTimeout(() => {
              setPayModalOpen(false);
              router.push("/dashboard");
            }, 3000);
          }
          break;
        }
      }
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      if (!redirectInProgress) setProcessing(false);
    }
  };

  const getPenaltyAmount = (toDate: string) => {
    const due = new Date(toDate);
    const now = new Date();
    if (now <= due) return "0.00";
    const diffMs = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return (diffDays * 0.5).toFixed(2);
  };

  const getOverdueDays = (toDate: string) => {
    return Math.ceil((new Date().getTime() - new Date(toDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3 h-3" /> Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodLabel = (method: string) => {
    const cfg = METHOD_CONFIG[method as PaymentMethodType];
    return cfg ? cfg.label : method;
  };

  return (
    <AuthLayout>
      <div className="max-w-5xl mx-auto pb-10">
        <Link href="/dashboard" className="flex items-center text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#3B4FE8] dark:hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-2.5 rounded-xl shadow-sm">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100">Payments</h1>
              <p className="text-sm text-[#64748B] dark:text-slate-400">Manage your pending dues and payment history</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-[#F1F5F9] dark:bg-slate-800 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 shadow-sm"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"
            }`}
          >
            Pending Dues
            {payments.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {payments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              fetchPaymentHistory();
            }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 shadow-sm"
                : "text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100"
            }`}
          >
            Payment History
          </button>
        </div>

        {/* Pending Payments Tab */}
        {activeTab === "pending" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-[#64748B] dark:text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-[#3B4FE8] dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm">Loading pending payments...</p>
                </div>
              ) : payments.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Book</th>
                      <th className="p-4">Overdue</th>
                      <th className="p-4">Format</th>
                      <th className="p-4">Penalty</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
                    {payments.map((rental) => {
                      const penalty = getPenaltyAmount(rental.toDate);
                      const overdueDays = getOverdueDays(rental.toDate);
                      return (
                        <tr key={rental._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  rental.book?.coverUrl ||
                                  "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"
                                }
                                alt="Cover"
                                className="w-10 h-14 object-cover rounded shadow-sm"
                              />
                              <h4 className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">
                                {rental.book?.title || "Unknown Book"}
                              </h4>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-red-500 font-medium">
                              {overdueDays} day{overdueDays !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="bg-gray-100 text-[#1E293B] dark:text-slate-100 text-xs px-2 py-1 rounded">Hard Copy</span>
                          </td>
                          <td className="p-4 text-sm font-medium text-[#EF4444]">Late Return</td>
                          <td className="p-4 text-sm font-bold text-[#1E293B] dark:text-slate-100">Rs.{penalty}</td>
                          <td className="p-4 text-right pr-6">
                            <button
                              onClick={() =>
                                openPayModal(rental._id, parseFloat(penalty), rental.book?.title || "Book")
                              }
                              className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#4F46E5]/25 transition-all duration-200 flex items-center gap-1.5"
                            >
                              Pay Now <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] dark:text-slate-100 mb-2">No pending payments</h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm">You&apos;re all clear! No overdue charges.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Payment History Tab */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
              {historyLoading ? (
                <div className="p-10 text-center text-[#64748B] dark:text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-[#3B4FE8] dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm">Loading payment history...</p>
                </div>
              ) : paymentHistory.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Transaction</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
                    {paymentHistory.map((payment) => (
                      <tr key={payment._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div>
                            <p className="font-semibold text-sm text-[#1E293B] dark:text-slate-100 truncate max-w-[200px]">
                              {payment.purchaseOrderName}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 font-mono mt-0.5">
                              {payment.purchaseOrderId}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                              style={{
                                backgroundColor:
                                  METHOD_CONFIG[payment.method as PaymentMethodType]?.color || "#6B7280",
                              }}
                            >
                              {METHOD_CONFIG[payment.method as PaymentMethodType]?.icon || (
                                <CreditCard className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
                              {getMethodLabel(payment.method)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-bold text-[#1E293B] dark:text-slate-100">Rs.{payment.amount}</td>
                        <td className="p-4">{getStatusBadge(payment.status)}</td>
                        <td className="p-4 text-sm text-[#64748B] dark:text-slate-400">
                          {new Date(payment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] dark:text-slate-100 mb-2">No payment history</h3>
                  <p className="text-[#64748B] dark:text-slate-400 text-sm">Your completed transactions will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Payment Modal ──────────────────────────────────────────── */}
        <Dialog.Root open={payModalOpen} onOpenChange={setPayModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-50 overflow-hidden">
              <AnimatePresence mode="wait">
                {redirecting ? (
                  /* ── Redirecting to external gateway ─────────────── */
                  <motion.div
                    key="redirecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 px-6"
                  >
                    <div className="w-12 h-12 border-4 border-[#3B4FE8] dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">
                      Redirecting to {redirecting === "khalti" ? "Khalti" : "eSewa"}...
                    </h3>
                    <p className="text-[#64748B] dark:text-slate-400 text-sm">Please wait, you'll be taken to the payment gateway shortly. Don't close this tab.</p>
                  </motion.div>
                ) : paySuccess ? (
                  /* ── Success State ────────────────────────────────── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12 px-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
                    >
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 mb-2">Payment Successful!</h3>
                    <p className="text-[#64748B] dark:text-slate-400 mb-2">Thank you for your payment of Rs.{selectedAmount}</p>
                    <p className="text-[#94A3B8] dark:text-slate-500 text-xs">Redirecting to dashboard...</p>
                  </motion.div>
                ) : paymentStep === "select" ? (
                  /* ── Step 1: Method Selector ─────────────────────── */
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    {/* Header */}
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Choose Payment Method</h2>
                      <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                        Paying <span className="font-semibold text-[#1E293B] dark:text-slate-100">Rs.{selectedAmount}</span> for{" "}
                        <span className="font-medium text-[#3B4FE8] dark:text-indigo-400">{selectedBookTitle}</span>
                      </p>
                    </div>

                    {/* Amount Display Card */}
                    <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-xl p-5 text-white mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-8 -mt-8" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-6 -mb-6" />
                      <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1 relative z-10">
                        Total Amount Due
                      </p>
                      <p className="text-3xl font-bold relative z-10">Rs.{selectedAmount}</p>
                      <p className="text-white/50 text-xs mt-1 relative z-10">Late return penalty</p>
                    </div>

                    {/* Method Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(METHOD_CONFIG) as PaymentMethodType[]).map((method) => {
                        const cfg = METHOD_CONFIG[method];
                        return (
                          <button
                            key={method}
                            onClick={() => handleMethodSelect(method)}
                            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md hover:-translate-y-0.5 ${cfg.border} hover:border-opacity-100 border-opacity-40 bg-white dark:bg-slate-800`}
                          >
                            <div
                              className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center text-white mb-3 shadow-sm`}
                            >
                              {cfg.icon}
                            </div>
                            <p className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{cfg.label}</p>
                            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 mt-0.5 leading-tight">{cfg.description}</p>
                            <ChevronRight className="absolute top-4 right-3 w-4 h-4 text-[#CBD5E1] dark:text-slate-600 group-hover:text-[#64748B] dark:group-hover:text-slate-400 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  /* ── Step 2: Confirm Payment ─────────────────────── */
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    {/* Back Button */}
                    <button
                      onClick={() => {
                        setPaymentStep("select");
                        setSelectedMethod(null);
                      }}
                      className="flex items-center text-sm text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-slate-100 mb-4 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>

                    {selectedMethod && (
                      <>
                        {/* Selected Method Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className={`w-12 h-12 ${METHOD_CONFIG[selectedMethod].bg} rounded-xl flex items-center justify-center text-white shadow-sm`}
                          >
                            {METHOD_CONFIG[selectedMethod].icon}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">
                              Pay with {METHOD_CONFIG[selectedMethod].label}
                            </h2>
                            <p className="text-xs text-[#94A3B8] dark:text-slate-500">{METHOD_CONFIG[selectedMethod].description}</p>
                          </div>
                        </div>

                        {/* Card Form (only for card method) */}
                        {selectedMethod === "card" && (
                          <div className="space-y-3 mb-6">
                            {/* Card Visual */}
                            <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-xl p-5 text-white relative overflow-hidden shadow-md">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
                              <div className="flex justify-between items-center mb-4 relative z-10">
                                <span className="font-bold tracking-widest text-sm opacity-80">VISA</span>
                              </div>
                              <div className="text-lg tracking-[0.2em] mb-3 relative z-10 opacity-90">
                                **** **** **** 4242
                              </div>
                              <div className="flex justify-between text-xs relative z-10 opacity-70">
                                <div className="uppercase">CARDHOLDER</div>
                                <div>12/28</div>
                              </div>
                            </div>

                            <input
                              type="text"
                              placeholder="Card Number"
                              className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#3B4FE8]/10 transition-all"
                            />
                            <input
                              type="text"
                              placeholder="Cardholder Name"
                              className="w-full text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#3B4FE8]/10 transition-all"
                            />
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-1/2 text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#3B4FE8]/10 transition-all"
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                className="w-1/2 text-sm border border-[#E2E8F0] dark:border-slate-700 p-2.5 rounded-lg outline-none focus:border-[#3B4FE8] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#3B4FE8]/10 transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* Credit info */}
                        {selectedMethod === "credit" && (
                          <div className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-[#1E293B] dark:text-slate-100">Deferred Payment</p>
                                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                                  The penalty amount will be added to your account credit balance.
                                  You can settle it later through any other payment method.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Summary */}
                        <div className="border-t border-[#E2E8F0] dark:border-slate-700 pt-4 mb-5">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-[#64748B] dark:text-slate-400">Late penalty</span>
                            <span className="text-[#1E293B] dark:text-slate-100 font-medium">Rs.{selectedAmount}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-[#64748B] dark:text-slate-400">Service fee</span>
                            <span className="text-emerald-600 font-medium">Free</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#E2E8F0] dark:border-slate-700">
                            <span className="font-semibold text-[#1E293B] dark:text-slate-100">Total</span>
                            <span className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Rs.{selectedAmount}</span>
                          </div>
                        </div>

                        {/* Pay Button */}
                        <button
                          onClick={handlePayment}
                          disabled={processing}
                          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ backgroundColor: METHOD_CONFIG[selectedMethod].color }}
                        >
                          {processing ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            `Pay Rs.${selectedAmount} with ${METHOD_CONFIG[selectedMethod].label}`
                          )}
                        </button>

                        {/* Security note */}
                        <p className="text-center text-[10px] text-[#94A3B8] dark:text-slate-500 mt-3 flex items-center justify-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Secured by 256-bit SSL encryption
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
      </div>
    </AuthLayout>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-[#64748B] dark:text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-[#3B4FE8] dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading payments...</p>
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}

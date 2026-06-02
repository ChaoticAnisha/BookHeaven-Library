"use client";

import { useState, useEffect, Suspense } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentsContent() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [paySuccess, setPaySuccess] = useState(false);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if coming back from Khalti success
    const khaltiStatus = searchParams.get("khalti");
    const pidx = searchParams.get("pidx");
    
    if (khaltiStatus === "success" && pidx) {
      verifyKhalti(pidx);
    } else {
      fetchPendingPayments();
    }
  }, [searchParams]);

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
      toast({ title: "Verification Failed", description: "Could not verify payment", variant: "destructive" });
      fetchPendingPayments();
    }
  };

  const fetchPendingPayments = async () => {
    try {
      // Fetching active/overdue rentals to show penalties
      const res = await api.get("/rentals/my");
      if (res.data.success) {
        // Mock filtering out those with penalties for demo, 
        // normally backed by proper endpoint or calculated
        const withPenalty = res.data.data.filter((r: any) => 
          new Date(r.toDate) < new Date() && r.status !== 'returned' && !r.penaltyPaid
        );
        setPayments(withPenalty);
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (rentalId: string, amount: number) => {
    setSelectedRentalId(rentalId);
    setSelectedAmount(amount || 50); // Mock amount
    setPaySuccess(false);
    setPayModalOpen(true);
  };

  const handleCardPayment = async () => {
    try {
      const res = await api.post("/payments/card", { rentalId: selectedRentalId, amount: selectedAmount });
      if (res.data.success) {
        setPaySuccess(true);
        setTimeout(() => {
          setPayModalOpen(false);
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err) {
      toast({ title: "Payment Failed", variant: "destructive" });
    }
  };

  const handleKhaltiPayment = async () => {
    try {
      const res = await api.post("/payments/khalti/initiate", { rentalId: selectedRentalId, amount: selectedAmount });
      if (res.data.success && res.data.data.payment_url) {
        window.location.href = res.data.data.payment_url;
      }
    } catch (err) {
      toast({ title: "Khalti Error", variant: "destructive" });
    }
  };

  const getPenaltyAmount = (toDate: string) => {
    const due = new Date(toDate);
    const now = new Date();
    if (now <= due) return "0.00";
    const diffMs = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return (diffDays * 0.50).toFixed(2);
  };

  return (
    <AuthLayout>
      <div className="max-w-5xl mx-auto pb-10">
        <Link href="/dashboard" className="flex items-center text-sm font-medium text-[#64748B] hover:text-[#3B4FE8] mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">Pending Payments</h1>

        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#64748B]">Loading...</div>
          ) : payments.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Book Format</th>
                  <th className="p-4">Penalties</th>
                  <th className="p-4">Charges</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {payments.map(rental => {
                  const penalty = getPenaltyAmount(rental.toDate);
                  return (
                    <tr key={rental._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img src={rental.book?.coverUrl || "https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg"} alt="Cover" className="w-10 h-14 object-cover rounded shadow-sm" />
                          <h4 className="font-semibold text-[#1E293B] text-sm">{rental.book?.title || 'Unknown Book'}</h4>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#64748B]">
                        Overdue by {Math.ceil((new Date().getTime() - new Date(rental.toDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-[#1E293B] text-xs px-2 py-1 rounded">Hard Copy</span>
                      </td>
                      <td className="p-4 text-sm font-medium text-[#EF4444]">
                        Late Return
                      </td>
                      <td className="p-4 text-sm font-bold text-[#1E293B]">
                        ₹{penalty}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button onClick={() => openPayModal(rental._id, parseFloat(penalty))} className="bg-[#1A1A2E] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2d2d4a] transition-colors shadow-sm">
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No pending payments</h3>
              <p className="text-[#64748B] text-sm">You're all clear!</p>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        <Dialog.Root open={payModalOpen} onOpenChange={setPayModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-50">
              {!paySuccess ? (
                <>
                  <h2 className="text-xl font-bold text-[#1E293B] mb-6">PAYMENT</h2>
                  
                  {/* Card Visual */}
                  <div className="bg-gradient-card rounded-xl p-5 text-white mb-6 shadow-md relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <span className="font-bold tracking-widest text-sm opacity-80">VISA</span>
                    </div>
                    <div className="text-lg tracking-[0.2em] mb-4 relative z-10 opacity-90">
                      **** **** **** 4242
                    </div>
                    <div className="flex justify-between text-xs relative z-10">
                      <div className="uppercase opacity-80">ANISHA SAH</div>
                      <div className="opacity-80">12/24</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <input type="text" placeholder="Card Number" className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                    </div>
                    <div>
                      <input type="text" placeholder="Cardholder Name" className="w-full text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Expiry" className="w-1/2 text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                      <input type="text" placeholder="CVV" className="w-1/2 text-sm border border-[#E2E8F0] p-2.5 rounded-lg outline-none focus:border-[#3B4FE8]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="save" className="rounded text-[#3B4FE8]" />
                      <label htmlFor="save" className="text-xs text-[#64748B]">Save card for future payments</label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6 border-t border-[#E2E8F0] pt-4">
                    <span className="text-[#64748B] text-sm">TOTAL</span>
                    <span className="text-xl font-bold text-[#1E293B]">₹{selectedAmount}</span>
                  </div>

                  <div className="space-y-3">
                    <button onClick={handleCardPayment} className="w-full bg-[#3B4FE8] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
                      PROCEED TO PAY
                    </button>
                    
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-[#E2E8F0]"></div>
                      <span className="flex-shrink-0 mx-4 text-[#64748B] text-xs">OR</span>
                      <div className="flex-grow border-t border-[#E2E8F0]"></div>
                    </div>

                    <button onClick={handleKhaltiPayment} className="w-full bg-[#5C2D8F] text-white py-3 rounded-lg font-semibold hover:bg-[#4a2473] transition-colors shadow-md flex justify-center items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Pay with Khalti
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E293B] mb-2">PAYMENT COMPLETED</h3>
                  <p className="text-[#64748B] mb-2">Thank you for your payment.</p>
                  <p className="text-[#64748B] text-xs">You will be redirected to Main page...</p>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </AuthLayout>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#64748B]">Loading payments...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}

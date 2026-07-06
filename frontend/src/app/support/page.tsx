"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { useState } from "react";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Send, CheckCircle } from "lucide-react";

const faqs = [
  {
    q: "How do I rent a physical book?",
    a: "Go to the Rent page, find your desired book, click 'Rent', and follow the checkout process. Visit the library counter with your member ID to collect the book.",
  },
  {
    q: "Can I read e-books online?",
    a: "Yes! Books with the E-Book badge can be read directly in your browser. Go to the book's detail page and click 'Read Now' to start instantly.",
  },
  {
    q: "How long can I keep a rented book?",
    a: "Default rental period is 14 days. You can request an extension from the My Library page if no one else has reserved the book.",
  },
  {
    q: "How do I cancel or return a rental?",
    a: "Visit My Library → Active Rentals, and click 'Return' on the book you want to return. Then bring the physical copy to the library counter.",
  },
  {
    q: "How are late fees calculated?",
    a: "Late fees are charged per day beyond your return date at the rate shown on the book's detail page. You can view outstanding fees in Payments.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "On the Login page, click 'Forgot Password' and enter your registered email. You'll receive a reset link within a few minutes.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would call an API endpoint
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <AuthLayout>
      <div className="max-w-4xl mx-auto pb-16 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] dark:text-slate-100">Help & Support</h1>
          <p className="text-[#64748B] dark:text-slate-400 mt-1.5">We're here to help. Find answers or reach out to our team.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, label: "Live Chat", value: "Available 9am–5pm", color: "from-[#4F46E5] to-[#7C3AED]", note: "Mon–Fri" },
            { icon: Mail, label: "Email Us", value: "support@bookheaven.com", color: "from-[#059669] to-[#0891B2]", note: "Reply within 24h" },
            { icon: Phone, label: "Call Us", value: "+977 01-1234567", color: "from-[#F59E0B] to-[#EF4444]", note: "Business hours" },
          ].map((item) => (
            <div key={item.label} className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-5 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-sm`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-[#1E293B] dark:text-slate-100 text-sm">{item.label}</p>
              <p className="text-xs text-[#3B4FE8] dark:text-indigo-400 font-medium mt-0.5">{item.value}</p>
              <p className="text-xs text-[#94A3B8] dark:text-slate-500 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-5">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F8FAFC] dark:hover:bg-slate-900 transition-colors"
                >
                  <span className="font-medium text-sm text-[#1E293B] dark:text-slate-100">{faq.q}</span>
                  {openIndex === index
                    ? <ChevronUp className="w-4 h-4 text-[#3B4FE8] dark:text-indigo-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-[#94A3B8] dark:text-slate-500 shrink-0" />}
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-4 text-sm text-[#64748B] dark:text-slate-400 leading-relaxed border-t border-[#F1F5F9] dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100 mb-5">Send us a Message</h2>
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 flex flex-col items-center text-center gap-3">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <h3 className="font-bold text-emerald-800">Message Sent!</h3>
              <p className="text-emerald-700 text-sm">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full border border-[#E2E8F0] dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-[#1E293B] dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-[#94A3B8] dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full border border-[#E2E8F0] dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-[#1E293B] dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-[#94A3B8] dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Issue with rental return"
                  className="w-full border border-[#E2E8F0] dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-[#1E293B] dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-[#94A3B8] dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full border border-[#E2E8F0] dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-[#1E293B] dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#3B4FE8] dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </AuthLayout>
  );
}

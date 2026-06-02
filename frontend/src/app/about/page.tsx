"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { BookOpen, Users, Shield, Zap, Globe, Award } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BookOpen,
    title: "Vast Collection",
    description: "Access thousands of books across genres — fiction, academic, science, history and more.",
    color: "from-[#4F46E5] to-[#7C3AED]",
  },
  {
    icon: Zap,
    title: "Instant E-Books",
    description: "Read digital copies instantly in your browser. No downloads, no waiting.",
    color: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your data and transactions are encrypted and protected with industry-standard security.",
    color: "from-[#059669] to-[#0891B2]",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Ratings, reviews, and personalized recommendations from fellow readers.",
    color: "from-[#C026D3] to-[#7C3AED]",
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description: "Use BookHeaven on any device — laptop, tablet, or phone — from anywhere.",
    color: "from-[#3B82F6] to-[#06B6D4]",
  },
  {
    icon: Award,
    title: "Librarian Curated",
    description: "Our expert librarians continuously update and curate the collection for quality.",
    color: "from-[#F97316] to-[#EAB308]",
  },
];

const team = [
  { name: "Anisha Chaudhary", role: "Founder & Lead Developer", initials: "AC", color: "from-[#4F46E5] to-[#7C3AED]" },
  { name: "Library Team", role: "Curation & Content", initials: "LT", color: "from-[#059669] to-[#0891B2]" },
  { name: "Dev Team", role: "Engineering & Infrastructure", initials: "DT", color: "from-[#C026D3] to-[#7C3AED]" },
];

export default function AboutPage() {
  return (
    <AuthLayout>
      <div className="max-w-5xl mx-auto pb-16 space-y-14">

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#7C3AED] rounded-2xl p-10 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-3">About Us</span>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Welcome to <span className="text-yellow-300">BookHeaven</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              BookHeaven is a smart digital library management system designed to bring the joy of reading
              to everyone. We combine modern technology with a love for books to create a seamless,
              beautiful reading experience.
            </p>
            <div className="flex gap-6 mt-8 text-sm">
              <div>
                <p className="text-2xl font-bold text-yellow-300">10,000+</p>
                <p className="text-white/60">Books Available</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-yellow-300">500+</p>
                <p className="text-white/60">Active Readers</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-yellow-300">50+</p>
                <p className="text-white/60">Genres</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-4">Our Mission</h2>
          <p className="text-[#64748B] text-base leading-relaxed border-l-4 border-[#4F46E5] pl-5 italic">
            "To democratize access to knowledge by building a world-class library experience that is
            intuitive, beautiful, and accessible — making reading not just easy, but delightful."
          </p>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#C7D2FE] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-[#1E293B] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-6">The Team</h2>
          <div className="flex flex-wrap gap-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-4 bg-white rounded-xl border border-[#E2E8F0] px-5 py-4 hover:shadow-sm transition-all"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#1E293B] text-sm">{member.name}</p>
                  <p className="text-xs text-[#64748B]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-1">Ready to start reading?</h3>
            <p className="text-[#64748B] text-sm">Browse our collection and find your next favourite book today.</p>
          </div>
          <Link
            href="/browse"
            className="bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#4338CA] transition-colors shadow-sm whitespace-nowrap"
          >
            Browse Books →
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}

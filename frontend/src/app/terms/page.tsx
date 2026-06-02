"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { ScrollText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing and using BookHeaven, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and continued use of the platform constitutes acceptance of updated terms.",
  },
  {
    title: "2. Membership & Account",
    content:
      "You must be at least 13 years of age to use BookHeaven. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account.",
  },
  {
    title: "3. Book Rentals",
    content:
      "Rental periods are clearly stated at the time of booking. Books must be returned by the due date in the same condition as when borrowed. Damage to physical books may incur replacement fees. E-books are available for the stated rental duration and access is automatically revoked upon expiry.",
  },
  {
    title: "4. Late Returns & Fees",
    content:
      "Books returned after the due date will incur a late fee calculated at the per-day rate shown on the book detail page. Fees accumulate until the book is returned. Outstanding fees must be settled before further rentals can be made. We may suspend accounts with persistent outstanding balances.",
  },
  {
    title: "5. E-Book & Digital Content",
    content:
      "Digital content (e-books, audiobooks) is licensed, not sold. You may not copy, reproduce, distribute, or create derivative works from any digital content available on BookHeaven. Access is personal and non-transferable. Sharing account credentials to grant others access to digital content is prohibited.",
  },
  {
    title: "6. Payments & Refunds",
    content:
      "All payments are processed securely. Rental fees are non-refundable once the rental period has commenced. If a technical issue prevents access to digital content, please contact support within 48 hours for a review. Refunds are issued at our sole discretion.",
  },
  {
    title: "7. User Conduct",
    content:
      "You agree not to use BookHeaven for any unlawful purpose. You must not attempt to gain unauthorised access to any part of the system. You must not upload or transmit any malicious content. We reserve the right to terminate accounts that violate these conduct standards without prior notice.",
  },
  {
    title: "8. Privacy",
    content:
      "We collect and process your personal data in accordance with our Privacy Policy. By using BookHeaven, you consent to such processing. We do not sell your personal data to third parties. Data is used solely for providing and improving our library services.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "All content on BookHeaven — including the platform design, logo, code, and curated content — is the intellectual property of BookHeaven and its licensors. You may not reproduce or use any content without express written permission.",
  },
  {
    title: "10. Limitation of Liability",
    content:
      "BookHeaven is provided 'as is'. We make no warranties regarding availability, accuracy, or fitness for a particular purpose. To the fullest extent permitted by law, BookHeaven shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.",
  },
  {
    title: "12. Contact",
    content:
      "If you have any questions about these Terms and Conditions, please contact us at legal@bookheaven.com or visit our Support page.",
  },
];

export default function TermsPage() {
  return (
    <AuthLayout>
      <div className="max-w-3xl mx-auto pb-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#334155] p-2.5 rounded-xl shadow-sm">
            <ScrollText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">Terms & Conditions</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">Last updated: June 2026</p>
          </div>
        </div>

        {/* Intro Banner */}
        <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl p-5 mb-8 text-sm text-[#4338CA] leading-relaxed">
          Please read these Terms and Conditions carefully before using the BookHeaven platform.
          These terms govern your use of our services, including physical book rentals, e-book access,
          and all other features of the platform.
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-all">
              <h2 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#4F46E5] rounded-full inline-block shrink-0" />
                {section.title}
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#94A3B8] text-center mt-10">
          © 2026 BookHeaven. All rights reserved. By using our platform you acknowledge you have read and understood these terms.
        </p>
      </div>
    </AuthLayout>
  );
}

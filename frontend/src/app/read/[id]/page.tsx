"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Maximize, Settings2, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react";
import api from "@/lib/api";

export default function ReadNow() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data.success) {
          setBook(res.data.data);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  if (!book) return <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">Book not found</div>;

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Top bar */}
      <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#64748B] hover:text-[#3B4FE8]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-[#E2E8F0]"></div>
          <div>
            <h1 className="font-bold text-[#1E293B] text-sm leading-tight">{book.title}</h1>
            <span className="text-xs text-[#64748B]">Chapter 1: Introduction</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#64748B] font-medium">Page 1 / {book.pages}</span>
          <div className="h-6 w-px bg-[#E2E8F0]"></div>
          
          <select className="bg-transparent text-sm font-medium text-[#1E293B] outline-none cursor-pointer">
            <option>Single</option>
            <option>Double</option>
            <option>Continuous</option>
          </select>
          
          <button className="text-[#64748B] hover:text-[#3B4FE8]">
            <Settings2 className="w-5 h-5" />
          </button>
          <button className="text-[#64748B] hover:text-[#3B4FE8]">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left reading panel (70%) */}
        <div className="flex-[7] bg-[#F8FAFC] relative flex items-center justify-center">
          
          {/* Mock page turn buttons */}
          <button className="absolute left-6 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-[#64748B] hover:text-[#3B4FE8]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="bg-white shadow-lg h-[90%] w-[80%] max-w-3xl rounded-r-sm p-12 overflow-y-auto font-serif text-lg leading-relaxed text-[#1E293B]">
            <h2 className="text-3xl font-bold mb-8 font-sans">Chapter 1</h2>
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p className="mb-4">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </div>
          
          <button className="absolute right-6 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-[#64748B] hover:text-[#3B4FE8]">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Right notes panel (30%) */}
        <div className="flex-[3] bg-white border-l border-[#E2E8F0] flex flex-col relative shadow-[-4px_0_15px_rgba(0,0,0,0.03)]">
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
            <h3 className="font-bold text-[#1E293B]">Notes & Highlights</h3>
            <button className="text-[#3B4FE8]"><BookmarkPlus className="w-5 h-5" /></button>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <label className="text-xs font-semibold uppercase text-[#64748B] mb-2 tracking-wider">Add Note</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-40 border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#1E293B] outline-none focus:border-[#3B4FE8] focus:ring-1 focus:ring-[#3B4FE8] resize-none mb-4 shadow-sm"
              placeholder="Write your notes here..."
            ></textarea>
            
            <button className="bg-[#1A1A2E] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#2d2d4a] transition-colors shadow-sm self-end">
              Save Note
            </button>
            
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase text-[#64748B] mb-4 tracking-wider">Saved (1)</h4>
              <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-3 rounded text-sm text-[#92400E]">
                <p className="italic mb-2">"Sed ut perspiciatis unde omnis iste natus error"</p>
                <p className="font-medium text-xs text-[#B45309]">Important concept for the exam.</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

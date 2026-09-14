"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <img
              src="/logo.png"
              alt="DIGITπ"
              className="w-20 h-20 object-contain mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="text-2xl font-bold text-white tracking-wide">
              DIGITπ
            </h1>
            <p className="text-[13px] text-[#9BB5B4] mt-3 leading-relaxed">
              Your trusted partner for verified hardware
            </p>
          </div>

          <div className="px-6 pb-10 space-y-3">
            <Link href="/signup">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Create account
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full bg-[#1B3338] border border-white/10 text-white rounded-full py-3.5 text-[14px] font-medium">
                Log in
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
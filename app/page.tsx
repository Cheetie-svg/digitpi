"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <img
          src="/logo.png"
          alt="DIGITπ"
          className="w-20 h-20 object-contain mx-auto mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <h1 className="text-3xl font-bold tracking-wide">DIGITπ</h1>
        <p className="text-[#9BB5B4] mt-3 leading-relaxed">
          Your trusted partner for verified hardware
        </p>

        <div className="mt-10 space-y-3">
          <Link href="/signup">
            <button className="w-full bg-[#0F6E76] rounded-xl py-3.5 text-sm font-medium">
              Create account
            </button>
          </Link>
          <Link href="/login">
            <button className="w-full bg-[#1B3338] border border-white/10 rounded-xl py-3.5 text-sm font-medium">
              Log in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
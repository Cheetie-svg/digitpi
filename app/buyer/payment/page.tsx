"use client";

import { Suspense } from "react";
import Link from "next/link";

function PaymentContent() {
  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">Payment</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[14px] text-[#9BB5B4] leading-relaxed">
              M-Pesa checkout will connect here soon.
            </p>
            <p className="text-[12px] text-[#8B9998] mt-3">
              For now, orders are created from Marketplace and Cart.
            </p>
          </div>

          <div className="px-5 pb-6">
            <Link href="/buyer/orders">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Back to My Orders
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
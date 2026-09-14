"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const orderId = params.id as string;
  const status = searchParams.get("status") || "Pending";

  const showCancel = status === "Pending";
  const showReturn = status === "Delivered";

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/buyer/tracking" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <div>
              <h1 className="text-[15px] font-bold text-[#142A2E]">Order Details</h1>
              <p className="text-[11px] text-[#6B7A79]">{orderId}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Status</p>
              <p className="text-[14px] font-semibold text-[#0F6E76]">{status}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Product</p>
              <p className="text-[13px] font-medium text-[#142A2E]">PPR Gate Valve 32mm</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">Quantity: 1</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Total Paid</p>
              <p className="text-[15px] font-semibold text-[#142A2E]">KSh 1,450</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Order Date</p>
              <p className="text-[13px] text-[#142A2E]">16 Aug 2026, 10:15 AM</p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="px-5 pb-6 space-y-3">
            {showCancel && (
              <button className="w-full bg-[#C64435] text-white rounded-full py-3.5 text-[14px] font-medium active:scale-95 transition">
                Cancel Order
              </button>
            )}

           {showReturn && (
  <Link href="/buyer/return">
    <button className="w-full bg-[#E4A73B] text-white rounded-full py-3.5 text-[14px] font-medium active:scale-95 transition">
      Return & Refund
    </button>
  </Link>
)}

            {!showCancel && !showReturn && (
              <p className="text-center text-[12px] text-[#8B9998]">
                No actions available for this stage
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
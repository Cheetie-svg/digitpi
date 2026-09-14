"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/support/main" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <div>
              <h1 className="text-[15px] font-bold text-[#142A2E]">Complaint Handling</h1>
              <p className="text-[11px] text-[#6B7A79]">{orderId}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            {/* Product */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Product</p>
              <p className="text-[13px] font-medium text-[#142A2E]">
                PPR Gate Valve 32mm + Pipe Connector
              </p>
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Buyer Reference</p>
              <p className="text-[13px] text-[#142A2E]">John Mwangi • +254 712 345 678</p>
            </div>

            {/* Delivery Status */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Delivery Status</p>
              <p className="text-[13px] text-[#142A2E]">Delivered • Yesterday 19:40</p>
            </div>

            {/* Remaining Time */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Remaining Complaint Window</p>
              <p className="text-[15px] font-semibold text-[#C64435]">02 hrs 15 min left</p>
            </div>

            {/* Reason for Complaint */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Reason for Complaint</p>
              <p className="text-[13px] text-[#142A2E] leading-relaxed">
                The valve I received is leaking at the joint. It does not close properly and water is dripping continuously.
              </p>
            </div>

            {/* Picture Proof */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-2">Picture Proof from Buyer</p>
              <div className="w-full h-40 bg-[#E4F1EE] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl">🖼️</span>
                  <p className="text-[12px] text-[#6B7A79] mt-1">Buyer uploaded photo</p>
                </div>
              </div>
            </div>

            {/* Agent Notes */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Agent Notes</p>
              <textarea
                placeholder="Write your notes here..."
                className="w-full mt-1 text-[13px] text-[#142A2E] outline-none resize-none h-20"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="px-5 pb-6 space-y-3">
            <button className="w-full bg-[#C64435] text-white rounded-full py-3.5 text-[14px] font-medium active:scale-95 transition">
              Cancel Order (Trigger Return)
            </button>

            <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium active:scale-95 transition">
              Close Case (No Issue)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
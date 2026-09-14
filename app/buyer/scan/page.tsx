"use client";

import { useState } from "react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../../../lib/supabase";

export default function BuyerScanPage() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);

  const processCode = async (raw: string) => {
    setLoading(true);
    setMessage("");
    setIsError(false);

    let orderId = raw.trim();
    if (orderId.startsWith("DIGITPI-ORDER:")) {
      orderId = orderId.replace("DIGITPI-ORDER:", "").trim();
    }

    if (!orderId) {
      setIsError(true);
      setMessage("No order ID found");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsError(true);
      setMessage("Please log in first");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "Delivered" })
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .select();

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else if (!data || data.length === 0) {
      setIsError(true);
      setMessage("Order not found, or this order is not yours");
    } else {
      setIsError(false);
      setMessage("Success! Order is Delivered. Thank you.");
    }

    setLoading(false);
  };

  const startCamera = async () => {
    setMessage("");
    setIsError(false);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("qr-reader-buyer");
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await processCode(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setScanning(false);
      setIsError(true);
      setMessage(
        "Camera failed. Use phone or paste order ID. " + (err?.message || "")
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              ←
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-[#142A2E]">Confirm Delivery</h1>
              <p className="text-[11px] text-[#8B9998]">Scan Delivery QR</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[13px] text-[#142A2E] font-medium mb-2">
                Camera scan
              </p>
              <button
                onClick={startCamera}
                disabled={scanning || loading}
                className="w-full bg-[#0F6E76] text-white rounded-full py-3 text-[14px] font-medium"
              >
                {scanning ? "Scanning..." : "Open Camera"}
              </button>
              <div id="qr-reader-buyer" className="mt-3 rounded-xl overflow-hidden" />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <p className="text-[12px] text-[#8B9998] uppercase">Or paste order ID</p>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="w-full border border-[#DCE4E3] rounded-xl px-3 py-3 text-[13px] outline-none"
                placeholder="Order id or DIGITPI-ORDER:..."
              />
              <button
                onClick={() => processCode(manualId)}
                disabled={loading}
                className="w-full bg-white border border-[#0F6E76] text-[#0F6E76] rounded-full py-3 text-[14px] font-medium"
              >
                {loading ? "Confirming..." : "Confirm Received"}
              </button>
            </div>

            {message && (
              <div
                className={`rounded-xl p-4 text-[13px] text-center ${
                  isError
                    ? "bg-[#FDECEC] text-[#C64435]"
                    : "bg-[#E4F1EE] text-[#0F6E76]"
                }`}
              >
                {message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
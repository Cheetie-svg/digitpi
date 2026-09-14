"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function DeliveryOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    setOrder(data);
    setLoading(false);
  };

  useEffect(() => {
    if (orderId) load();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white">Order not found</p>
          <Link href="/delivery/orders" className="text-[#7EB6B8] text-sm mt-2 inline-block">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const qrData = `DIGITPI-ORDER:${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/delivery/orders"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-white">
                Job #{shortId(order.id)}
              </h1>
              <p className="text-[11px] text-[#7EB6B8]">{order.status}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
              <p className="text-[11px] text-[#8B9998] uppercase">Product</p>
              <p className="text-[15px] font-semibold text-white mt-1">
                {order.product_name}
              </p>
              <p className="text-[13px] text-[#9BB5B4] mt-2">
                Quantity: <strong className="text-white">{order.quantity}</strong>
              </p>
            </div>

            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">
                Instructions
              </p>
              <p className="text-[13px] text-[#C7D6D4] leading-relaxed">
                Collect from vendor after they mark Ready for Pickup. Show this QR
                at handover. Buyer scans on delivery to confirm.
              </p>
            </div>

            {/* QR — no prices for delivery */}
            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-[11px] text-[#8B9998] uppercase mb-3">
                Order QR
              </p>
              <div className="bg-white rounded-xl p-3 inline-block">
                <img src={qrUrl} alt="Order QR" width={200} height={200} />
              </div>
              <p className="text-[11px] text-[#8B9998] mt-3 break-all">
                {order.id}
              </p>
            </div>

            {message && (
              <p className="text-center text-[13px] text-[#7EB6B8]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6 space-y-2">
            <Link href="/vendor/scan">
              <button className="w-full bg-[#1B3338] border border-white/10 text-white rounded-full py-3 text-[14px]">
                Vendor scan (handover)
              </button>
            </Link>
            <Link href="/buyer/scan">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3 text-[14px] font-medium">
                Buyer confirm scan
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
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
  const [vendor, setVendor] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserId(user.id);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    setOrder(data);

    if (data?.vendor_id) {
      const { data: v } = await supabase
        .from("profiles")
        .select("full_name, phone, town, county, country")
        .eq("user_id", data.vendor_id)
        .maybeSingle();
      setVendor(v);
    }
    if (data?.buyer_id) {
      const { data: b } = await supabase
        .from("profiles")
        .select("full_name, phone, town, county, country")
        .eq("user_id", data.buyer_id)
        .maybeSingle();
      setBuyer(b);
    }

    // If already past accept and user previously confirmed, show QR
    if (
      data &&
      data.delivery_id === user.id &&
      ["Dispatched", "Delivered", "Completed"].includes(data.status)
    ) {
      setShowQr(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (orderId) load();
  }, [orderId, router]);

  const fee = Number(
    order?.delivery_fee ?? order?.delivery_price ?? 150
  );

  const placeLabel = (p: any, fallback: string) => {
    if (!p) return fallback;
    return [p.town, p.county, p.country].filter(Boolean).join(", ") || fallback;
  };

  const mapsLink = (p: any) => {
    const q = placeLabel(p, "");
    if (!q) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  const updateRank = async (delta: number) => {
    if (!userId) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("rank_points")
      .eq("user_id", userId)
      .maybeSingle();
    const current = Number(profile?.rank_points ?? 50);
    const next = Math.min(100, Math.max(0, current + delta));
    await supabase
      .from("profiles")
      .update({ rank_points: next })
      .eq("user_id", userId);
  };

  const accept = async () => {
    setAction(true);
    setMessage("");
    const { error } = await supabase
      .from("orders")
      .update({ status: "Accepted", delivery_id: userId })
      .eq("id", orderId)
      .eq("status", "Ready for Pickup");

    if (error) setMessage(error.message);
    else {
      await updateRank(1.5);
      setMessage("Accepted");
      await load();
    }
    setAction(false);
  };

  const reject = async () => {
    setAction(true);
    await updateRank(-2.0);
    setMessage("Rejected — back to jobs list");
    setAction(false);
    router.push("/delivery/orders");
  };

  // Confirmation → job mode with QR (after accept)
  const confirmStart = async () => {
    setAction(true);
    setMessage("");
    const { error } = await supabase
      .from("orders")
      .update({ status: "Dispatched" })
      .eq("id", orderId)
      .eq("delivery_id", userId);

    if (error) {
      // still allow QR view even if status update fails naming
      setMessage(error.message);
    }
    setShowQr(true);
    await load();
    setAction(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center">
        <p className="text-white">Order not found</p>
      </div>
    );
  }

  const isMine = order.delivery_id === userId;
  const isOpen =
    order.status === "Ready for Pickup" && !order.delivery_id;
  const isAccepted =
    isMine &&
    ["Accepted", "Assigned"].includes(order.status);
  const qrData = `DIGITPI-ORDER:${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  // —— JOB PAGE (QR only, no weed buttons) ——
  if (showQr && isMine) {
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
                  Active job #{shortId(order.id)}
                </h1>
                <p className="text-[11px] text-[#7EB6B8]">{order.status}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-6">
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
                <p className="text-[15px] font-semibold text-white">
                  {order.product_name}
                </p>
                <p className="text-[13px] text-[#9BB5B4] mt-1">
                  Qty {order.quantity}
                </p>
              </div>

              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 text-center">
                <p className="text-[11px] text-[#8B9998] uppercase mb-3">
                  Handover QR
                </p>
                <div className="bg-white rounded-xl p-3 inline-block">
                  <img src={qrUrl} alt="Order QR" width={200} height={200} />
                </div>
                <p className="text-[11px] text-[#8B9998] mt-3">
                  Vendor scans at pickup · Buyer scans on delivery
                </p>
                <p className="text-[10px] text-[#8B9998] mt-2 break-all">
                  {order.id}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // —— DETAILS (before / after accept) ——
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
                Order #{shortId(order.id)}
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
              <p className="text-[13px] text-[#9BB5B4] mt-1">
                Qty {order.quantity}
              </p>
            </div>

            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
              <p className="text-[11px] text-[#8B9998] uppercase">
                Offered delivery fee
              </p>
              <p className="text-[20px] font-bold text-[#7EB6B8] mt-1">
                KSh {fee.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
              <p className="text-[11px] text-[#8B9998] uppercase">
                Vendor (pickup)
              </p>
              <p className="text-[13px] text-white mt-1">
                {vendor?.full_name || "Vendor"}
              </p>
              <p className="text-[12px] text-[#9BB5B4]">
                {placeLabel(vendor, "Location not set")}
              </p>
              {vendor?.phone && (
                <p className="text-[12px] text-[#7EB6B8] mt-1">{vendor.phone}</p>
              )}
              {mapsLink(vendor) && (
                <a
                  href={mapsLink(vendor)!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-[12px] text-[#0F6E76] font-medium"
                >
                  Open vendor on map →
                </a>
              )}
            </div>

            <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
              <p className="text-[11px] text-[#8B9998] uppercase">
                Buyer (drop-off)
              </p>
              <p className="text-[13px] text-white mt-1">
                {buyer?.full_name || "Buyer"}
              </p>
              <p className="text-[12px] text-[#9BB5B4]">
                {placeLabel(buyer, "Location not set")}
              </p>
              {buyer?.phone && (
                <p className="text-[12px] text-[#7EB6B8] mt-1">{buyer.phone}</p>
              )}
              {mapsLink(buyer) && (
                <a
                  href={mapsLink(buyer)!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-[12px] text-[#0F6E76] font-medium"
                >
                  Open buyer on map →
                </a>
              )}
            </div>

            {message && (
              <p className="text-center text-[13px] text-[#7EB6B8]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6 space-y-2">
            {isOpen && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={reject}
                  disabled={action}
                  className="py-3.5 rounded-full bg-[#1B3338] border border-white/10 text-[#C64435] text-[14px] font-medium"
                >
                  Reject
                </button>
                <button
                  onClick={accept}
                  disabled={action}
                  className="py-3.5 rounded-full bg-[#0F6E76] text-white text-[14px] font-medium"
                >
                  {action ? "..." : "Accept"}
                </button>
              </div>
            )}

            {isAccepted && (
              <button
                onClick={confirmStart}
                disabled={action}
                className="w-full py-3.5 rounded-full bg-[#0F6E76] text-white text-[14px] font-medium"
              >
                {action ? "..." : "Confirm — open job QR"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
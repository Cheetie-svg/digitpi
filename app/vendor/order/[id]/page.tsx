"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function VendorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(false);
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

  const markReady = async () => {
    setAction(true);
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "Ready for Pickup" })
      .eq("id", orderId)
      .eq("vendor_id", user.id);

    if (error) setMessage(error.message);
    else {
      setMessage("Marked ready for pickup");
      await load();
    }
    setAction(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-2xl mx-auto p-6 lg:p-10">
        <Link href="/vendor/orders" className="text-sm text-[#7EB6B8]">
          ← Orders
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          Order #{shortId(order.id)}
        </h1>
        <p className="text-sm text-[#7EB6B8] mb-6">{order.status}</p>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5">
            <p className="text-xs text-[#8B9998] uppercase">Product</p>
            <p className="text-lg font-semibold mt-1">{order.product_name}</p>
            <p className="text-sm text-[#9BB5B4] mt-2">
              Quantity to pack: <strong className="text-white">{order.quantity}</strong>
            </p>
          </div>

          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5">
            <p className="text-xs text-[#8B9998] uppercase mb-2">Instructions</p>
            <p className="text-sm text-[#C7D6D4] leading-relaxed">
              Pack the exact item and quantity. When ready, mark Ready for
              Pickup so a delivery unit can collect.
            </p>
          </div>

          {message && (
            <p className="text-sm text-[#7EB6B8] text-center">{message}</p>
          )}

          {order.status === "Received" && (
            <button
              onClick={markReady}
              disabled={action}
              className="w-full py-3.5 rounded-xl bg-[#0F6E76] font-medium disabled:opacity-60"
            >
              {action ? "..." : "Ready for pickup"}
            </button>
          )}

          {order.status === "Ready for Pickup" && (
            <div className="rounded-xl bg-[#0F6E76]/20 border border-[#0F6E76] p-4 text-center text-sm text-[#7EB6B8]">
              Waiting for delivery pickup
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
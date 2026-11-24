"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function VendorPayoutPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Orders this vendor fulfilled (supply side — no retail price shown as "sale to customer")
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("vendor_id", user.id)
        .in("status", [
          "Received",
          "Ready for Pickup",
          "Assigned",
          "Accepted",
          "Dispatched",
          "Delivered",
          "Completed",
          "Reviewed",
        ])
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  // Supply amount owed to vendor = unit_price * quantity when unit_price is supply cost
  // If you store supply price on product, we could join; for now use order unit_price as recorded
  const lineAmount = (o: any) => {
    const unit = Number(o.unit_price ?? o.supply_price ?? 0);
    const qty = Number(o.quantity ?? 1);
    return unit * qty;
  };

  const pending = orders.filter((o) =>
    ["Received", "Ready for Pickup", "Assigned", "Accepted", "Dispatched"].includes(
      o.status
    )
  );
  const paid = orders.filter((o) =>
    ["Delivered", "Completed", "Reviewed"].includes(o.status)
  );

  const pendingTotal = pending.reduce((s, o) => s + lineAmount(o), 0);
  const paidTotal = paid.reduce((s, o) => s + lineAmount(o), 0);

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/vendor/orders" className="text-sm text-[#7EB6B8]">
              ← Orders
            </Link>
            <h1 className="text-2xl font-bold mt-1">Payout</h1>
            <p className="text-sm text-[#9BB5B4]">
              What DIGITπ owes you for supply
            </p>
          </div>
          <Link
            href="/vendor/profile"
            className="px-4 py-2 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
          >
            Profile
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5">
            <p className="text-xs text-[#8B9998] uppercase">Pending payout</p>
            <p className="text-3xl font-bold text-[#E4A73B] mt-2">
              KSh {pendingTotal.toLocaleString()}
            </p>
            <p className="text-sm text-[#9BB5B4] mt-1">
              {pending.length} order(s) not yet delivered
            </p>
          </div>
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5">
            <p className="text-xs text-[#8B9998] uppercase">Completed (delivered)</p>
            <p className="text-3xl font-bold text-[#7EB6B8] mt-2">
              KSh {paidTotal.toLocaleString()}
            </p>
            <p className="text-sm text-[#9BB5B4] mt-1">
              {paid.length} order(s) eligible for settlement
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : (
          <>
            <h2 className="text-xs text-[#8B9998] uppercase mb-3">
              Pending
            </h2>
            {pending.length === 0 ? (
              <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 text-center text-[#8B9998] mb-8">
                No pending amounts
              </div>
            ) : (
              <div className="space-y-2 mb-10">
                {pending.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl bg-[#1B3338] border border-white/10 px-4 py-3 flex justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#8B9998]">
                        #{shortId(o.id)}
                      </p>
                      <p className="text-sm font-medium">{o.product_name}</p>
                      <p className="text-xs text-[#9BB5B4]">
                        Qty {o.quantity} · {o.status}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#E4A73B]">
                      KSh {lineAmount(o).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-xs text-[#8B9998] uppercase mb-3">
              Delivered / completed
            </h2>
            {paid.length === 0 ? (
              <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 text-center text-[#8B9998]">
                No completed payouts yet
              </div>
            ) : (
              <div className="space-y-2">
                {paid.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl bg-[#1B3338] border border-white/10 px-4 py-3 flex justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#8B9998]">
                        #{shortId(o.id)}
                      </p>
                      <p className="text-sm font-medium">{o.product_name}</p>
                      <p className="text-xs text-[#9BB5B4]">
                        Qty {o.quantity} · {o.status}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#7EB6B8]">
                      KSh {lineAmount(o).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-[#8B9998] mt-8 leading-relaxed">
          Amounts use the supply price recorded on each order. Actual bank /
          M-Pesa settlement is handled by DIGITπ admin. When settlement is
          marked paid in admin, those rows can move to a separate “Paid out”
          list in a later update.
        </p>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function SupportMainPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", [
        "Return Requested",
        "Replace Requested",
        "Refund Requested",
      ])
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const markResolved = async (orderId: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "Completed" })
      .eq("id", orderId);
    if (error) alert(error.message);
    else await load();
    setUpdatingId(null);
  };

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
              ← Admin
            </Link>
            <h1 className="text-2xl font-bold mt-2">Support queue</h1>
            <p className="text-sm text-[#9BB5B4]">
              Return · Replace · Refund requests
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden">
          <div className="grid grid-cols-5 gap-3 px-6 py-4 text-xs uppercase text-[#8B9998] border-b border-white/10">
            <div>Product</div>
            <div>Type</div>
            <div>Issue</div>
            <div>Date</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">
              No open support requests
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((r) => {
                const note = r.review || "";
                const issueText = note
                  .replace("RETURN:", "")
                  .replace("REPLACE:", "")
                  .replace("REFUND:", "")
                  .trim();

                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-5 gap-3 px-6 py-4 text-sm items-center"
                  >
                    <div>
                      <p className="font-medium">{r.product_name}</p>
                      <p className="text-[11px] text-[#8B9998] break-all">
                        #{String(r.id).slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0F6E76]/40 text-[#C7F0E8]">
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[#9BB5B4]">{issueText || "—"}</div>
                    <div className="text-[12px] text-[#8B9998]">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : ""}
                    </div>
                    <div>
                      <button
                        onClick={() => markResolved(r.id)}
                        disabled={updatingId === r.id}
                        className="px-3 py-1.5 rounded-lg bg-[#0F6E76] text-[12px] font-medium"
                      >
                        {updatingId === r.id ? "..." : "Mark resolved"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
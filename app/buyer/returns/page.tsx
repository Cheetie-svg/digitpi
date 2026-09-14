"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ReturnsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [type, setType] = useState<"return" | "replace" | "">("");
  const [issue, setIssue] = useState("");
  const [otherIssue, setOtherIssue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const issues = [
    "Not working",
    "Damaged",
    "Wrong item",
    "Missing parts",
    "Other",
  ];

  useEffect(() => {
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
        .eq("buyer_id", user.id)
        .in("status", [
          "Received",
          "Ready for Pickup",
          "Assigned",
          "Dispatched",
          "Delivered",
        ])
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const submit = async () => {
    if (!selectedOrder) {
      setMessage("Select an order first");
      return;
    }
    if (!type) {
      setMessage("Choose Return or Replace");
      return;
    }
    if (!issue) {
      setMessage("Choose an issue");
      return;
    }
    if (issue === "Other" && !otherIssue.trim()) {
      setMessage("Describe the issue");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const issueText = issue === "Other" ? otherIssue.trim() : issue;
    const status =
      type === "return" ? "Return Requested" : "Replace Requested";
    const prefix = type === "return" ? "RETURN" : "REPLACE";

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        review: `${prefix}: ${issueText}`,
      })
      .eq("id", selectedOrder.id)
      .eq("buyer_id", user.id);

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
          <div className="bg-[#142A2E] rounded-[2rem] min-h-[640px] flex flex-col px-6 py-8">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F6E76] text-white text-2xl flex items-center justify-center mb-4">
                ✓
              </div>
              <h1 className="text-xl font-bold text-white">Submitted</h1>
              <p className="text-[13px] text-[#9BB5B4] mt-3 leading-relaxed">
                Your request is with support and awaiting review.
              </p>
            </div>
            <Link href="/buyer">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer/orders"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">
              Return or Replace
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
            
            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">
                Select order
              </p>
              {loading ? (
                <p className="text-[13px] text-[#8B9998]">Loading...</p>
              ) : orders.length === 0 ? (
                <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4 text-center text-[13px] text-[#8B9998]">
                  No eligible orders
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`w-full text-left rounded-xl p-3 border ${
                        selectedOrder?.id === o.id
                          ? "bg-[#0F6E76]/30 border-[#0F6E76]"
                          : "bg-[#1B3338] border-white/10"
                      }`}
                    >
                      <p className="text-[13px] font-semibold text-white">
                        {o.product_name}
                      </p>
                      <p className="text-[11px] text-[#9BB5B4]">
                        {o.status} · Qty {o.quantity}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">
                What are you filing for?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType("return")}
                  className={`py-3 rounded-xl text-[13px] font-medium ${
                    type === "return"
                      ? "bg-[#0F6E76] text-white"
                      : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
                  }`}
                >
                  Return
                </button>
                <button
                  onClick={() => setType("replace")}
                  className={`py-3 rounded-xl text-[13px] font-medium ${
                    type === "replace"
                      ? "bg-[#0F6E76] text-white"
                      : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
                  }`}
                >
                  Replace
                </button>
              </div>
              <p className="text-[11px] text-[#8B9998] mt-2">
                Return = send item back · Replace = exchange for another unit
              </p>
            </div>

            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">
                Report issue
              </p>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-3 py-3 text-[13px] text-white outline-none"
              >
                <option value="">Select issue</option>
                {issues.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {issue === "Other" && (
                <input
                  value={otherIssue}
                  onChange={(e) => setOtherIssue(e.target.value)}
                  placeholder="Describe the issue"
                  className="w-full mt-2 bg-[#1B3338] border border-white/10 rounded-xl px-3 py-3 text-[13px] text-white outline-none placeholder:text-[#8B9998]"
                />
              )}
            </div>

            {message && (
              <p className="text-center text-[13px] text-[#C64435]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6">
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
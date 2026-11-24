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
          "Accepted",
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
      <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F6E76] text-2xl flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold">Submitted</h1>
          <p className="text-[#9BB5B4] mt-3">
            Your request is with support and awaiting review.
          </p>
          <Link href="/buyer">
            <button className="mt-8 w-full py-3.5 rounded-xl bg-[#0F6E76] font-medium">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-xl mx-auto p-6 lg:p-10">
        <Link href="/buyer/orders" className="text-sm text-[#7EB6B8]">
          ← My Orders
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Return or Replace</h1>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-2">Select order</p>
            {loading ? (
              <p className="text-[#8B9998]">Loading...</p>
            ) : orders.length === 0 ? (
              <div className="rounded-xl bg-[#1B3338] border border-white/10 p-5 text-center text-[#8B9998]">
                No eligible orders
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`w-full text-left rounded-xl p-4 border ${
                      selectedOrder?.id === o.id
                        ? "bg-[#0F6E76]/30 border-[#0F6E76]"
                        : "bg-[#1B3338] border-white/10"
                    }`}
                  >
                    <p className="font-medium">{o.product_name}</p>
                    <p className="text-sm text-[#9BB5B4]">
                      {o.status} · Qty {o.quantity}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-2">
              What are you filing for?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setType("return")}
                className={`py-3 rounded-xl font-medium ${
                  type === "return"
                    ? "bg-[#0F6E76]"
                    : "bg-[#1B3338] border border-white/10"
                }`}
              >
                Return
              </button>
              <button
                onClick={() => setType("replace")}
                className={`py-3 rounded-xl font-medium ${
                  type === "replace"
                    ? "bg-[#0F6E76]"
                    : "bg-[#1B3338] border border-white/10"
                }`}
              >
                Replace
              </button>
            </div>
            <p className="text-xs text-[#8B9998] mt-2">
              Return = send item back · Replace = exchange for another unit
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-2">Report issue</p>
            <select
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
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
                className="w-full mt-2 bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#8B9998]"
              />
            )}
          </div>

          {message && (
            <p className="text-sm text-[#C64435] text-center">{message}</p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#0F6E76] font-medium disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("buyer_id", user.id)
        .single();

      setOrder(data);
      setLoading(false);
    };

    if (orderId) load();
  }, [orderId, router]);

  const submitReview = async () => {
    if (!text.trim()) {
      setMessage("Please write a short review");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({
        review: text.trim(),
        reviewed: true,
        status: "Reviewed",
      })
      .eq("id", orderId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Review saved. Thank you!");
      setTimeout(() => router.push("/buyer/orders"), 1200);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center">
        <p className="text-[#142A2E]">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center">
        <p className="text-[#142A2E]">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer/orders"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Leave a Review</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[13px] font-semibold text-[#142A2E]">
                {order.product_name}
              </p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Status: {order.status}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">Your review</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full border border-[#DCE4E3] rounded-xl px-3 py-3 text-[13px] outline-none resize-none"
                placeholder="How was the product and delivery?"
              />
            </div>

            {message && (
              <p className="text-center text-[13px] text-[#0F6E76]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6">
            <button
              onClick={submitReview}
              disabled={saving || order.reviewed}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {order.reviewed
                ? "Already reviewed"
                : saving
                ? "Saving..."
                : "Submit Review"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
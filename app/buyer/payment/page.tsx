"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const qty = Number(searchParams.get("qty") || 1);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    loadProduct();
  }, [productId]);

  const handlePay = async () => {
    setError("");
    setPaying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in");
        setPaying(false);
        return;
      }

      if (!product) {
        setError("Product not found");
        setPaying(false);
        return;
      }

      // Always charge the Admin selling price
      const unitPrice = Number(product.selling_price || product.price);
      const total = unitPrice * qty;

      const { error: orderError } = await supabase.from("orders").insert({
        buyer_id: user.id,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        total_amount: total,
        status: "Pending",
        vendor_id: product.vendor_id,
      });

      if (orderError) {
        setError(orderError.message);
        setPaying(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center">
        <p className="text-[#142A2E]">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col px-6 py-8">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl mb-4">
                ✓
              </div>
              <h1 className="text-xl font-bold text-[#142A2E]">Order Placed</h1>
              <p className="text-[13px] text-[#6B7A79] mt-3 leading-relaxed">
                Your order has been placed successfully and is now Pending.
              </p>
            </div>

            <Link href="/buyer/tracking">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium mb-3">
                Track Order
              </button>
            </Link>

            <Link href="/buyer">
              <button className="w-full bg-white text-[#142A2E] rounded-full py-3.5 text-[14px] font-medium border border-[#DCE4E3]">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center">
        <p className="text-[#142A2E]">Product not found</p>
      </div>
    );
  }

  const unitPrice = Number(product.selling_price || product.price);
  const subtotal = unitPrice * qty;
  const deliveryFee = 200;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link href={`/buyer/product/${productId}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-[#142A2E]">←</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Payment</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Product</p>
              <p className="text-[14px] font-medium text-[#142A2E]">{product.name}</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Qty: {qty} × KSh {unitPrice.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B7A79]">Subtotal</span>
                <span className="text-[#142A2E]">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B7A79]">Delivery Fee</span>
                <span className="text-[#142A2E]">KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#F0F4F3] pt-2 flex justify-between text-[14px] font-semibold">
                <span className="text-[#142A2E]">Total</span>
                <span className="text-[#0F6E76]">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase mb-1">Payment Method</p>
              <p className="text-[14px] font-medium text-[#142A2E]">M-Pesa</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                (Simulated for now – real M-Pesa coming later)
              </p>
            </div>

            {error && (
              <p className="text-[13px] text-[#C64435] text-center">{error}</p>
            )}

          </div>

          {/* Pay Button */}
          <div className="px-5 pb-6">
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium active:scale-95 transition disabled:opacity-60"
            >
              {paying ? "Processing..." : `Pay KSh ${total.toLocaleString()}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type CartItem = {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
  vendor_id?: string;
};

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("digitpi_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("digitpi_cart", JSON.stringify(items));
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState("");
  const [fullscreen, setFullscreen] = useState<string | null>(null);

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
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      setProduct(data);
      setLoading(false);
    };
    if (productId) load();
  }, [productId, router]);

  const images: string[] = (() => {
    if (!product) return [];
    if (Array.isArray(product.image_urls) && product.image_urls.length) {
      return product.image_urls.filter(Boolean);
    }
    if (product.image_url) return [product.image_url];
    return [];
  })();

  const unit = Number(
    product?.selling_price ?? product?.retail_price ?? product?.price ?? 0
  );
  const total = unit * qty;

  const addToCart = () => {
    if (!product) return;
    const cart = loadCart();
    const existing = cart.find((c) => c.product_id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        unit_price: unit,
        quantity: qty,
        image_url: images[0] || product.image_url,
        vendor_id: product.vendor_id,
      });
    }
    saveCart(cart);
    setMessage("Added to cart");
  };

  const orderNow = async () => {
    if (!product) return;
    setOrdering(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      buyer_id: user.id,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: unit,
      total_amount: total,
      status: "Pending",
      vendor_id: product.vendor_id || null,
    });

    if (error) {
      setMessage(error.message);
      setOrdering(false);
      return;
    }

    setMessage("Order placed");
    setOrdering(false);
    router.push("/buyer/orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
        <p className="text-white">Product not found</p>
      </div>
    );
  }

  // Full-screen image
  if (fullscreen) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={() => setFullscreen(null)}
            className="w-10 h-10 rounded-full bg-white/20 text-white text-lg"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src={fullscreen}
            alt="Product"
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
        <p className="text-center text-[12px] text-white/60 pb-6">
          Tap ✕ to close
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer/marketplace"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">Product details</h1>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            
            {/* Horizontal photo strip */}
            <div className="px-5 mb-3">
              {images.length === 0 ? (
                <div className="h-48 rounded-xl bg-[#1B3338] border border-white/10 flex items-center justify-center text-4xl text-[#7EB6B8]">
                  🔧
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFullscreen(src)}
                      className="snap-center flex-shrink-0 w-[85%] h-48 rounded-xl overflow-hidden bg-[#1B3338] border border-white/10"
                    >
                      <img
                        src={src}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <p className="text-[11px] text-[#8B9998] mt-1">
                  Swipe for more · tap photo for full screen
                </p>
              )}
            </div>

            <div className="px-5 space-y-3">
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
                <h2 className="text-[16px] font-bold text-white">
                  {product.name}
                </h2>
                <p className="text-[18px] font-bold text-[#7EB6B8] mt-2">
                  KSh {unit.toLocaleString()}
                </p>
                <p className="text-[13px] text-[#9BB5B4] mt-3 leading-relaxed">
                  {product.description || "No description"}
                </p>
                <p className="text-[12px] text-[#8B9998] mt-2">
                  Stock: {product.stock ?? product.stock_quantity ?? "—"}
                </p>
              </div>

              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
                <p className="text-[11px] text-[#8B9998] uppercase mb-2">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full bg-[#142A2E] border border-white/10 text-white text-lg"
                  >
                    −
                  </button>
                  <span className="text-white font-semibold text-[16px] w-8 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-10 rounded-full bg-[#142A2E] border border-white/10 text-white text-lg"
                  >
                    +
                  </button>
                  <span className="ml-auto text-[#7EB6B8] font-medium text-[14px]">
                    KSh {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {message && (
                <p className="text-center text-[13px] text-[#7EB6B8]">{message}</p>
              )}
            </div>
          </div>

          <div className="px-5 pb-6 grid grid-cols-2 gap-2">
            <button
              onClick={addToCart}
              className="py-3.5 rounded-full bg-[#1B3338] border border-white/10 text-white text-[14px] font-medium"
            >
              Add to cart
            </button>
            <button
              onClick={orderNow}
              disabled={ordering}
              className="py-3.5 rounded-full bg-[#0F6E76] text-white text-[14px] font-medium disabled:opacity-60"
            >
              {ordering ? "..." : "Order"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
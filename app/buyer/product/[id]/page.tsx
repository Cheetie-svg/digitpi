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
    if (Array.isArray(product.image_urls) && product.image_urls.length)
      return product.image_urls.filter(Boolean);
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
    if (existing) existing.quantity += qty;
    else
      cart.push({
        product_id: product.id,
        name: product.name,
        unit_price: unit,
        quantity: qty,
        image_url: images[0] || product.image_url,
        vendor_id: product.vendor_id,
      });
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
      <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center">
        Product not found
      </div>
    );
  }

  if (fullscreen) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={() => setFullscreen(null)}
            className="w-10 h-10 rounded-full bg-white/20 text-white"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <Link href="/buyer/marketplace" className="text-sm text-[#7EB6B8]">
          ← Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <div>
            {images.length === 0 ? (
              <div className="h-80 rounded-2xl bg-[#1B3338] border border-white/10 flex items-center justify-center text-5xl text-[#7EB6B8]">
                🔧
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFullscreen(images[0])}
                  className="w-full h-80 rounded-2xl overflow-hidden bg-[#1B3338] border border-white/10"
                >
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFullscreen(src)}
                        className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/10"
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-[#8B9998] mt-2">
                  Tap photo for full screen
                </p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-[#7EB6B8]">
              KSh {unit.toLocaleString()}
            </p>
            <p className="text-[#9BB5B4] leading-relaxed">
              {product.description || "No description"}
            </p>
            <p className="text-sm text-[#8B9998]">
              Stock: {product.stock ?? product.stock_quantity ?? "—"}
            </p>

            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-4">
              <p className="text-xs text-[#8B9998] uppercase mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full bg-[#142A2E] border border-white/10"
                >
                  −
                </button>
                <span className="font-semibold w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 rounded-full bg-[#142A2E] border border-white/10"
                >
                  +
                </button>
                <span className="ml-auto text-[#7EB6B8] font-medium">
                  Total KSh {total.toLocaleString()}
                </span>
              </div>
            </div>

            {message && (
              <p className="text-sm text-[#7EB6B8]">{message}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addToCart}
                className="py-3.5 rounded-xl bg-[#1B3338] border border-white/10 font-medium"
              >
                Add to cart
              </button>
              <button
                onClick={orderNow}
                disabled={ordering}
                className="py-3.5 rounded-xl bg-[#0F6E76] font-medium disabled:opacity-60"
              >
                {ordering ? "..." : "Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
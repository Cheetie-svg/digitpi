"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type CartItem = {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
  vendor_id?: string;
};

function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

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

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"cart" | "active" | "completed">("cart");
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
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
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    setCart(loadCart());
  }, [router]);

  useEffect(() => {
    if (tab === "cart") setCart(loadCart());
  }, [tab]);

  const active = orders.filter((o) =>
    ["Pending", "Received", "Ready for Pickup", "Assigned", "Dispatched"].includes(
      o.status
    )
  );
  const completed = orders.filter((o) =>
    ["Delivered", "Reviewed", "Completed"].includes(o.status)
  );

  const list = tab === "active" ? active : tab === "completed" ? completed : [];

  const cartTotal = cart.reduce(
    (sum, c) => sum + c.unit_price * c.quantity,
    0
  );

  const updateCartQty = (productId: string, delta: number) => {
    const next = cart
      .map((c) =>
        c.product_id === productId
          ? { ...c, quantity: Math.max(0, c.quantity + delta) }
          : c
      )
      .filter((c) => c.quantity > 0);
    setCart(next);
    saveCart(next);
  };

  const removeFromCart = (productId: string) => {
    const next = cart.filter((c) => c.product_id !== productId);
    setCart(next);
    saveCart(next);
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const placeCartOrders = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    for (const item of cart) {
      const { error } = await supabase.from("orders").insert({
        buyer_id: user.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.unit_price * item.quantity,
        status: "Pending",
        vendor_id: item.vendor_id || null,
      });
      if (error) {
        setMessage(error.message);
        setPlacing(false);
        return;
      }
    }

    clearCart();
    setMessage("Orders placed from cart");
    setPlacing(false);
    setTab("active");
    await loadOrders();
  };

  const cancel = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("orders")
      .update({ status: "Cancelled" })
      .eq("id", id)
      .eq("buyer_id", user.id)
      .eq("status", "Pending");
    await loadOrders();
  };

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/buyer"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">My Orders</h1>
          </div>

          <div className="px-5 flex gap-2 mb-3">
            {(
              [
                ["cart", "Cart"],
                ["active", "Active"],
                ["completed", "Completed"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-full text-[12px] font-medium ${
                  tab === key
                    ? "bg-[#0F6E76] text-white"
                    : "bg-[#1B3338] text-[#9BB5B4] border border-white/10"
                }`}
              >
                {label}
                {key === "cart" && cart.length > 0 ? ` (${cart.length})` : ""}
              </button>
            ))}
          </div>

          {message && (
            <p className="text-center text-[12px] text-[#7EB6B8] px-5 mb-2">
              {message}
            </p>
          )}

          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
            
            {/* CART */}
            {tab === "cart" && (
              <>
                {cart.length === 0 ? (
                  <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center">
                    <p className="text-[13px] text-[#8B9998]">Cart is empty</p>
                    <Link href="/buyer/marketplace">
                      <button className="mt-3 px-4 py-2 rounded-full bg-[#0F6E76] text-white text-[12px]">
                        Go to marketplace
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {cart.map((c) => (
                      <div
                        key={c.product_id}
                        className="bg-[#1B3338] border border-white/10 rounded-xl p-3 flex gap-3"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0F6E76]/20 flex-shrink-0">
                          {c.image_url ? (
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7EB6B8]">
                              🔧
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[12px] text-[#7EB6B8]">
                            KSh {c.unit_price.toLocaleString()} × {c.quantity}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateCartQty(c.product_id, -1)}
                              className="w-7 h-7 rounded-full bg-[#142A2E] border border-white/10 text-white text-sm"
                            >
                              −
                            </button>
                            <span className="text-white text-[13px]">
                              {c.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(c.product_id, 1)}
                              className="w-7 h-7 rounded-full bg-[#142A2E] border border-white/10 text-white text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(c.product_id)}
                              className="ml-auto text-[11px] text-[#C64435]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between text-[14px]">
                        <span className="text-[#9BB5B4]">Total</span>
                        <span className="font-bold text-[#7EB6B8]">
                          KSh {cartTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={placeCartOrders}
                      disabled={placing}
                      className="w-full py-3.5 rounded-full bg-[#0F6E76] text-white text-[14px] font-medium disabled:opacity-60"
                    >
                      {placing ? "Placing orders..." : "Order all in cart"}
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full py-3 rounded-full bg-[#1B3338] border border-white/10 text-[#C7D6D4] text-[13px]"
                    >
                      Clear cart
                    </button>
                  </>
                )}
              </>
            )}

            {/* ACTIVE / COMPLETED */}
            {tab !== "cart" && loading && (
              <p className="text-center text-[#8B9998] text-[13px]">Loading...</p>
            )}

            {tab !== "cart" && !loading && list.length === 0 && (
              <div className="bg-[#1B3338] border border-white/10 rounded-xl p-5 text-center text-[13px] text-[#8B9998]">
                No {tab} orders
              </div>
            )}

            {tab !== "cart" &&
              list.map((o) => (
                <div
                  key={o.id}
                  className="bg-[#1B3338] border border-white/10 rounded-xl p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[11px] text-[#8B9998]">
                        #{shortId(o.id)}
                      </p>
                      <p className="text-[13px] font-semibold text-white mt-0.5">
                        {o.product_name}
                      </p>
                      <p className="text-[11px] text-[#9BB5B4] mt-1">
                        {o.status}
                      </p>
                    </div>
                    <p className="text-[13px] text-[#7EB6B8] font-medium">
                      KSh {Number(o.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {o.status === "Pending" && (
                      <button
                        onClick={() => cancel(o.id)}
                        className="px-3 py-1.5 rounded-full text-[11px] bg-white/10 text-[#C64435]"
                      >
                        Cancel
                      </button>
                    )}
                    {o.status === "Delivered" && (
                      <Link href={`/buyer/review/${o.id}`}>
                        <button className="px-3 py-1.5 rounded-full text-[11px] bg-[#0F6E76] text-white">
                          Leave review
                        </button>
                      </Link>
                    )}
                    <Link href="/buyer/returns">
                      <button className="px-3 py-1.5 rounded-full text-[11px] bg-white/10 text-[#C7D6D4]">
                        Return / Replace
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>
    </div>
  );
}
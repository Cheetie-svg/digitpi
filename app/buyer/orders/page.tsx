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
    ["Pending", "Received", "Ready for Pickup", "Assigned", "Accepted", "Dispatched"].includes(
      o.status
    )
  );
  const completed = orders.filter((o) =>
    ["Delivered", "Reviewed", "Completed"].includes(o.status)
  );
  const list = tab === "active" ? active : tab === "completed" ? completed : [];

  const cartTotal = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0);

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
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <Link href="/buyer" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">My Orders</h1>

        <div className="flex gap-2 mb-6">
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
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                tab === key
                  ? "bg-[#0F6E76] text-white"
                  : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
              }`}
            >
              {label}
              {key === "cart" && cart.length > 0 ? ` (${cart.length})` : ""}
            </button>
          ))}
        </div>

        {message && (
          <p className="text-sm text-[#7EB6B8] mb-4">{message}</p>
        )}

        {tab === "cart" && (
          <div className="space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-10 text-center">
                <p className="text-[#8B9998]">Cart is empty</p>
                <Link href="/buyer/marketplace">
                  <button className="mt-4 px-5 py-2.5 rounded-xl bg-[#0F6E76] text-sm">
                    Go to marketplace
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {cart.map((c) => (
                  <div
                    key={c.product_id}
                    className="rounded-2xl bg-[#1B3338] border border-white/10 p-4 flex gap-4 items-center"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0F6E76]/20 flex-shrink-0">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          🔧
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-sm text-[#7EB6B8]">
                        KSh {c.unit_price.toLocaleString()} × {c.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQty(c.product_id, -1)}
                          className="w-8 h-8 rounded-full bg-[#142A2E] border border-white/10"
                        >
                          −
                        </button>
                        <span>{c.quantity}</span>
                        <button
                          onClick={() => updateCartQty(c.product_id, 1)}
                          className="w-8 h-8 rounded-full bg-[#142A2E] border border-white/10"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(c.product_id)}
                          className="ml-auto text-sm text-[#C64435]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-4 flex justify-between">
                  <span className="text-[#9BB5B4]">Total</span>
                  <span className="font-bold text-[#7EB6B8]">
                    KSh {cartTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={placeCartOrders}
                  disabled={placing}
                  className="w-full py-3.5 rounded-xl bg-[#0F6E76] font-medium disabled:opacity-60"
                >
                  {placing ? "Placing orders..." : "Order all in cart"}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-3 rounded-xl bg-[#1B3338] border border-white/10 text-sm"
                >
                  Clear cart
                </button>
              </>
            )}
          </div>
        )}

        {tab !== "cart" && (
          <div className="space-y-3">
            {loading ? (
              <p className="text-[#8B9998]">Loading...</p>
            ) : list.length === 0 ? (
              <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-10 text-center text-[#8B9998]">
                No {tab} orders
              </div>
            ) : (
              list.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl bg-[#1B3338] border border-white/10 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#8B9998]">
                        #{shortId(o.id)}
                      </p>
                      <p className="font-medium mt-0.5">{o.product_name}</p>
                      <p className="text-sm text-[#9BB5B4] mt-1">{o.status}</p>
                    </div>
                    <p className="text-[#7EB6B8] font-medium">
                      KSh {Number(o.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {o.status === "Pending" && (
                      <button
                        onClick={() => cancel(o.id)}
                        className="px-3 py-1.5 rounded-full text-xs bg-white/10 text-[#C64435]"
                      >
                        Cancel
                      </button>
                    )}
                    <Link href="/buyer/returns">
                      <button className="px-3 py-1.5 rounded-full text-xs bg-white/10">
                        Return / Replace
                      </button>
                    </Link>
                    <Link href="/buyer/tracking">
                      <button className="px-3 py-1.5 rounded-full text-xs bg-[#0F6E76]">
                        Track
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
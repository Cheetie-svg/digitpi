"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminMainPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    liveOrders: 0,
    buyers: 0,
    vendors: 0,
    delivery: 0,
    support: 0,
    partners: 0,
    pendingApps: 0,
  });
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

      const [{ count: liveOrders }, { data: profiles }, { count: pendingApps }] =
        await Promise.all([
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .in("status", [
              "Pending",
              "Received",
              "Ready for Pickup",
              "Assigned",
              "Dispatched",
            ]),
          supabase.from("profiles").select("role, is_active"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("is_active", false)
            .in("role", [
              "Vendor",
              "Partner",
              "Support",
              "vendor",
              "partner",
              "support",
              "Customer Support",
            ]),
        ]);

      const list = profiles || [];
      const countRole = (name: string) =>
        list.filter(
          (p) => (p.role || "").toLowerCase() === name.toLowerCase()
        ).length;

      setStats({
        liveOrders: liveOrders || 0,
        buyers: countRole("Buyer"),
        vendors: countRole("Vendor"),
        delivery: countRole("Delivery"),
        support: countRole("Support") + countRole("Customer Support"),
        partners: countRole("Partner"),
        pendingApps: pendingApps || 0,
      });
      setLoading(false);
    };
    load();
  }, [router]);

  const roleCards = [
    { label: "Buyers", value: stats.buyers, role: "buyer" },
    { label: "Vendors", value: stats.vendors, role: "vendor" },
    { label: "Delivery", value: stats.delivery, role: "delivery" },
    { label: "Partners", value: stats.partners, role: "partner" },
    { label: "Support", value: stats.support, role: "support" },
  ];

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#9BB5B4]">DIGITπ Admin</p>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">Dashboard</h1>
          </div>
          <Link
            href="/admin/profile"
            className="px-5 py-2.5 rounded-xl bg-[#0F6E76] text-sm font-medium"
          >
            Company control
          </Link>
        </div>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 mb-6">
          <p className="text-xs text-[#8B9998] uppercase">Live orders</p>
          <p className="text-4xl font-bold mt-2 text-[#C7F0E8]">
            {loading ? "—" : stats.liveOrders}
          </p>
        </div>

        <p className="text-sm text-[#9BB5B4] mb-3">
          Tap a role to open the full user list
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {roleCards.map((s) => (
            <Link key={s.role} href={`/admin/users?role=${s.role}`}>
              <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-4 hover:border-[#0F6E76] transition h-full">
                <p className="text-[11px] text-[#8B9998] uppercase">{s.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {loading ? "—" : s.value}
                </p>
                <p className="text-[11px] text-[#7EB6B8] mt-2">View list →</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/applications">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold">New applications</h2>
                  <p className="text-[13px] text-[#9BB5B4] mt-1">
                    Vendor · Partner · Support
                  </p>
                </div>
                {stats.pendingApps > 0 && (
                  <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#C64435] text-[12px] flex items-center justify-center">
                    {stats.pendingApps}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
            </div>
          </Link>
<Link href="/admin/delivery-fees">
  <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
    <h2 className="text-[16px] font-semibold">Delivery payment</h2>
    <p className="text-[13px] text-[#9BB5B4] mt-1">
      Fee by km · vendor → buyer
    </p>
    <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
  </div>
</Link>
          <Link href="/admin/inventory">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <h2 className="text-[16px] font-semibold">Inventory</h2>
              <p className="text-[13px] text-[#9BB5B4] mt-1">
                Average prices · set selling price
              </p>
              <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
            </div>
          </Link>
<Link href="/admin/orders">
  <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
    <h2 className="text-[16px] font-semibold">All orders</h2>
    <p className="text-[13px] text-[#9BB5B4] mt-1">
      Order no · date · status
    </p>
    <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
  </div>
</Link>
          <Link href="/admin/products">
            <div className="rounded-2xl bg-[#0F6E76] p-5 hover:brightness-110 transition h-full">
              <h2 className="text-[16px] font-semibold">Products</h2>
              <p className="text-[13px] text-white/80 mt-1">
                Vendors · stock · supply prices
              </p>
              <p className="text-[12px] text-white/90 mt-4 font-medium">Open →</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <h2 className="text-[16px] font-semibold">All users</h2>
              <p className="text-[13px] text-[#9BB5B4] mt-1">
                Every profile in one place
              </p>
              <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
            </div>
          </Link>

          <Link href="/support/main">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-5 hover:border-[#0F6E76] transition h-full">
              <h2 className="text-[16px] font-semibold">Support queue</h2>
              <p className="text-[13px] text-[#9BB5B4] mt-1">
                Returns & refunds
              </p>
              <p className="text-[12px] text-[#7EB6B8] mt-4 font-medium">Open →</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
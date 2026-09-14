"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminDeliveryFeesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [baseFee, setBaseFee] = useState("100");
  const [perKm, setPerKm] = useState("30");
  const [testKm, setTestKm] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("delivery_base_fee, delivery_per_km")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        if (data.delivery_base_fee != null)
          setBaseFee(String(data.delivery_base_fee));
        if (data.delivery_per_km != null)
          setPerKm(String(data.delivery_per_km));
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const base = Number(baseFee) || 0;
  const rate = Number(perKm) || 0;
  const km = Number(testKm) || 0;
  const preview = Math.round(base + rate * km);

  const save = async () => {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        delivery_base_fee: base,
        delivery_per_km: rate,
      })
      .eq("user_id", userId);

    if (error) {
      setMessage(
        error.message +
          " — Add columns delivery_base_fee and delivery_per_km on profiles."
      );
    } else {
      setMessage("Delivery rates saved");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-3xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">Delivery payment</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          One-way fee: vendor → buyer distance in kilometres
        </p>

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : (
          <div className="space-y-5">
            
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#C7F0E8]">
                Rate settings
              </h2>
              <p className="text-[13px] text-[#9BB5B4]">
                Fee = Base fee + (km × rate per km). Distance is measured one
                way only.
              </p>

              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">
                  Base fee (KSh)
                </p>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">
                  Rate per kilometre (KSh)
                </p>
                <input
                  type="number"
                  value={perKm}
                  onChange={(e) => setPerKm(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-[#0F6E76] text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save rates"}
              </button>

              {message && (
                <p
                  className={`text-sm ${
                    message.includes("saved")
                      ? "text-[#7EB6B8]"
                      : "text-[#C64435]"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#C7F0E8]">
                Preview calculator
              </h2>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">
                  Distance (km, one way)
                </p>
                <input
                  type="number"
                  value={testKm}
                  onChange={(e) => setTestKm(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="rounded-xl bg-[#142A2E] border border-white/10 px-4 py-4">
                <p className="text-[12px] text-[#8B9998]">Offered delivery fee</p>
                <p className="text-3xl font-bold text-[#7EB6B8] mt-1">
                  KSh {preview.toLocaleString()}
                </p>
                <p className="text-[12px] text-[#9BB5B4] mt-2">
                  {base} + ({km} × {rate})
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-[#C7F0E8] mb-2">
                How it applies
              </h2>
              <ul className="text-[13px] text-[#9BB5B4] space-y-2 list-disc pl-5">
                <li>
                  When a job is ready for pickup, the system uses these rates
                  with the vendor→buyer distance.
                </li>
                <li>
                  Delivery units see that fee on the job before they accept.
                </li>
                <li>
                  Until GPS distance is live, you can still set a default distance
                  or fee per order later.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await supabase.auth.signOut();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("Login failed");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profileError || !profile) {
        setError("Could not load profile");
        setLoading(false);
        return;
      }

      const role = (profile.role || "").toLowerCase().trim();
      const isActive = profile.is_active !== false;

      if (role === "vendor" && !isActive) {
        router.push("/vendor/apply");
        return;
      }
      if (role === "partner" && !isActive) {
        router.push("/partner/apply");
        return;
      }
      if ((role === "support" || role === "customer support") && !isActive) {
        router.push("/support/apply");
        return;
      }

      if (role === "buyer") router.push("/buyer");
      else if (role === "vendor") router.push("/vendor/orders");
      else if (role === "delivery") router.push("/delivery/orders");
      else if (role === "partner") router.push("/partner/main");
      else if (role === "support" || role === "customer support")
        router.push("/support/main");
      else if (role === "admin") router.push("/admin/main");
      else router.push("/buyer");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">Log in</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-1">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none"
              />
            </div>
            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-1">Password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none"
              />
            </div>
            {error && (
              <p className="text-center text-[13px] text-[#C64435]">{error}</p>
            )}
          </div>

          <div className="px-5 pb-6 space-y-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            <Link href="/signup">
              <p className="text-center text-[13px] text-[#7EB6B8]">
                Create account
              </p>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
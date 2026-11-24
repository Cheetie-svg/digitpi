"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: FormEvent) => {
    e?.preventDefault();
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
    <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Log in</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-[#C64435] text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F6E76] rounded-xl py-3.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-[#7EB6B8] mt-6">
          <Link href="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}
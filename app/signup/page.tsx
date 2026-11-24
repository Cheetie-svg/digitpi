"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ROLES = ["Buyer", "Vendor", "Delivery"] as const;
const COUNTRIES = ["Kenya", "Uganda", "Tanzania", "Rwanda"];
const COUNTIES_BY_COUNTRY: Record<string, string[]> = {
  Kenya: [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Kiambu",
    "Machakos",
    "Kajiado",
    "Other",
  ],
  Uganda: ["Kampala", "Wakiso", "Other"],
  Tanzania: ["Dar es Salaam", "Arusha", "Other"],
  Rwanda: ["Kigali", "Other"],
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]>("Buyer");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [poBox, setPoBox] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const counties = country ? COUNTIES_BY_COUNTRY[country] || ["Other"] : [];

  const handleSignup = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");

    if (
      !fullName.trim() ||
      !username.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password
    ) {
      setError("Please fill all required fields");
      return;
    }
    if (!country || !county || !town.trim()) {
      setError("Please complete location");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signOut();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("Signup failed");
        setLoading(false);
        return;
      }

      const isActive = role === "Buyer" || role === "Delivery";
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        role,
        full_name: fullName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        email: email.trim(),
        country,
        county,
        town: town.trim(),
        po_box: poBox.trim() || null,
        is_active: isActive,
        rank_points: role === "Delivery" ? 50 : null,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (role === "Vendor") router.push("/vendor/apply");
      else if (role === "Delivery") router.push("/delivery/orders");
      else router.push("/buyer");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none";

  return (
    <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Create account</h1>

        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-2">I am a</p>
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium ${
                    role === r
                      ? "bg-[#0F6E76] text-white"
                      : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Full name</p>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Phone</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Country</p>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCounty("");
              }}
              className={inputClass}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {country && (
            <div>
              <p className="text-xs text-[#8B9998] uppercase mb-1">County</p>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className={inputClass}
              >
                <option value="">Select county</option>
                {counties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {county && (
            <>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Town</p>
                <input
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="e.g. Westlands"
                  className={inputClass}
                />
              </div>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">
                  P.O. Box (optional)
                </p>
                <input
                  value={poBox}
                  onChange={(e) => setPoBox(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-[#C64435] text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F6E76] rounded-xl py-3.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#7EB6B8] mt-6">
          <Link href="/login">Already have an account? Log in</Link>
        </p>
      </div>
    </div>
  );
}
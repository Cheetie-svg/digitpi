"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function VendorPendingPage() {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const requestVerification = async () => {
    if (!terms || !privacy) {
      setMessage("Please agree to Terms and Privacy Policy");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Mark vendor as pending verification
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        // optional note field if you have one; status stays Vendor
      })
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col px-6 py-8">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl mb-4">
                ✓
              </div>
              <h1 className="text-xl font-bold text-[#142A2E]">
                Request submitted
              </h1>
              <p className="text-[13px] text-[#6B7A79] mt-3 leading-relaxed">
                Your vendor verification request has been sent. DIGITπ will review
                and activate your account.
              </p>
            </div>
            <Link href="/login">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">
              Become a DIGITπ Vendor
            </h1>
            <p className="text-[12px] text-[#6B7A79] mt-1">
              Complete verification to list products
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm text-[13px] text-[#142A2E] leading-relaxed space-y-2">
              <p className="font-semibold">Requirements</p>
              <p>• Valid business or trading identity</p>
              <p>• Accurate product stock and quality</p>
              <p>• You sell to DIGITπ (not directly to buyers)</p>
              <p>• Prices you set are your supply prices to us</p>
              <p>• Account stays inactive until admin approval</p>
            </div>

            <label className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[13px] text-[#142A2E]">
                I agree to the Terms and Conditions
              </span>
            </label>

            <label className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[13px] text-[#142A2E]">
                I agree to the Privacy Policy
              </span>
            </label>

            {message && (
              <p className="text-center text-[13px] text-[#C64435]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6">
            <button
              onClick={requestVerification}
              disabled={submitting}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Request field verification"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
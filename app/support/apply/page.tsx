"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function SupportApplyPage() {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const requestSupport = async () => {
    if (!terms || !privacy) {
      setMessage("Please agree to Terms and Privacy Policy");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("user_id", user.id);

      if (error) {
        setMessage(error.message);
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
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
                Application received
              </h1>
              <p className="text-[13px] text-[#6B7A79] mt-4 leading-relaxed">
                Your request to join DIGITπ Customer Support has been submitted.
              </p>
              <p className="text-[13px] text-[#6B7A79] mt-3 leading-relaxed">
                Only Admin can approve support agents. You will be notified once
                your access is activated.
              </p>
              <p className="text-[13px] text-[#0F6E76] font-medium mt-4">
                Typical review: 5–7 working days
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
              Support Agent Application
            </h1>
            <p className="text-[12px] text-[#6B7A79] mt-1">
              Join the DIGITπ customer care team
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm text-[13px] text-[#142A2E] leading-relaxed space-y-2">
              <p className="font-semibold">Requirements</p>
              <p>• Invited or authorised by DIGITπ Admin only</p>
              <p>• Handle returns, refunds and customer issues</p>
              <p>• Follow company support rules and privacy</p>
              <p>• Account stays inactive until Admin approves</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm text-[13px] text-[#6B7A79] leading-relaxed">
              <p className="font-semibold text-[#142A2E] mb-1">What happens next?</p>
              Admin reviews your application. Public random signups are not
              accepted. Once approved, you access the Support dashboard.
            </div>

            <label className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[13px] text-[#142A2E]">
                I agree to the Terms & Conditions
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
              onClick={requestSupport}
              disabled={submitting}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Request Support Access"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
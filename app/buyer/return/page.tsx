"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReturnPage() {
  const router = useRouter();
  const [type, setType] = useState<"return" | "refund" | null>(null);
  const [issue, setIssue] = useState("");
  const [otherIssue, setOtherIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const issues = [
    "Not working",
    "Damaged",
    "Wrong item received",
    "Missing parts",
    "Poor quality",
    "Other",
  ];

  const handleSubmit = () => {
    if (!type || !issue) return;
    if (issue === "Other" && !otherIssue.trim()) return;
    setSubmitted(true);
  };

  // Confirmation Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col px-6 py-8">
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl mb-4">
                ✓
              </div>
              <h1 className="text-xl font-bold text-[#142A2E]">Issue Submitted</h1>
              <p className="text-[13px] text-[#6B7A79] mt-3 leading-relaxed">
                Your request has been sent to Customer Support and is now awaiting review.
              </p>
              <p className="text-[12px] text-[#8B9998] mt-4">
                You will be notified once a decision is made.
              </p>
            </div>

            <Link href="/buyer">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Return to Home
              </button>
            </Link>

          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/buyer/tracking" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Returns & Refund</h1>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-5 space-y-5 pb-4">
            
            {/* Question 1 */}
            <div>
              <p className="text-[13px] font-medium text-[#142A2E] mb-2">
                What are you filing for?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType("return")}
                  className={`py-3 rounded-xl text-[13px] font-medium transition ${
                    type === "return"
                      ? "bg-[#0F6E76] text-white"
                      : "bg-white text-[#142A2E] border border-[#DCE4E3]"
                  }`}
                >
                  a. Return
                </button>
                <button
                  onClick={() => setType("refund")}
                  className={`py-3 rounded-xl text-[13px] font-medium transition ${
                    type === "refund"
                      ? "bg-[#0F6E76] text-white"
                      : "bg-white text-[#142A2E] border border-[#DCE4E3]"
                  }`}
                >
                  b. Refund
                </button>
              </div>
            </div>

            {/* Question 2 - Report Issue */}
            <div>
              <p className="text-[13px] font-medium text-[#142A2E] mb-2">
                Report Issue
              </p>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 text-[14px] outline-none"
              >
                <option value="">Select an issue</option>
                {issues.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              {issue && issue !== "Other" && (
                <p className="text-[12px] text-[#0F6E76] mt-2">
                  Selected: {issue}
                </p>
              )}

              {issue === "Other" && (
                <input
                  type="text"
                  value={otherIssue}
                  onChange={(e) => setOtherIssue(e.target.value)}
                  placeholder="Describe the issue"
                  className="w-full mt-2 bg-white rounded-xl px-4 py-3 text-[14px] outline-none"
                />
              )}
            </div>

            {/* Upload Proof */}
            <div>
              <p className="text-[13px] font-medium text-[#142A2E] mb-2">
                Upload Photo / Video Proof
              </p>
              <div className="bg-white rounded-xl border-2 border-dashed border-[#DCE4E3] p-6 text-center">
                <span className="text-3xl">📷</span>
                <p className="text-[12px] text-[#6B7A79] mt-2">
                  Tap to take a photo or upload a video of the damaged item
                </p>
                <button className="mt-3 text-[12px] text-[#0F6E76] font-medium">
                  Open Camera / Gallery
                </button>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="px-5 pb-6">
            <button
              onClick={handleSubmit}
              disabled={!type || !issue || (issue === "Other" && !otherIssue.trim())}
              className={`w-full py-3.5 rounded-full text-[14px] font-medium transition ${
                type && issue && (issue !== "Other" || otherIssue.trim())
                  ? "bg-[#0F6E76] text-white active:scale-95"
                  : "bg-[#B8C2C1] text-white cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
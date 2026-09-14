import Link from "next/link";

const payouts = [
  {
    id: "PAY-301",
    period: "August 2026",
    amount: "KSh 12,480",
    orders: 11,
    status: "Accruing",
  },
  {
    id: "PAY-288",
    period: "July 2026",
    amount: "KSh 18,750",
    orders: 16,
    status: "Settled",
  },
  {
    id: "PAY-271",
    period: "June 2026",
    amount: "KSh 9,320",
    orders: 8,
    status: "Settled",
  },
];

export default function PartnerHistoryPage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Payout History</h1>
            <p className="text-[12px] text-[#6B7A79] mt-0.5">
              Monthly commissions • Accruing → Settled
            </p>
          </div>

          {/* Current Month Summary */}
          <div className="px-5 mb-4">
            <div className="bg-[#0F6E76] rounded-xl p-4 text-white">
              <p className="text-[11px] text-[#BFE0DD] uppercase">Current Month (Accruing)</p>
              <p className="text-2xl font-bold mt-1">KSh 12,480</p>
              <p className="text-[11px] text-[#BFE0DD] mt-1">
                Will be paid at the end of the month
              </p>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#142A2E]">{payout.period}</p>
                    <p className="text-[11px] text-[#8B9998] mt-0.5">
                      {payout.orders} orders • {payout.id}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    payout.status === "Settled"
                      ? "bg-[#E4F1EE] text-[#0F6E76]"
                      : "bg-[#FFF3E0] text-[#E4A73B]"
                  }`}>
                    {payout.status}
                  </span>
                </div>

                <p className="text-[16px] font-bold text-[#0F6E76] mt-3">
                  {payout.amount}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/partner/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#8B9998]">Profile</span>
            </Link>

            <Link href="/partner/main" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📊</span>
              <span className="text-[10px] text-[#8B9998]">Home</span>
            </Link>

            <Link href="/partner/history" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📜</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">History</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
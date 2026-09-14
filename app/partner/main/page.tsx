import Link from "next/link";

const sales = [
  {
    user: "Buyer #4821",
    orderId: "ORD-78421",
    netSale: "KSh 1,850",
    commission: "KSh 1,110",
    time: "Today, 14:30",
  },
  {
    user: "Buyer #4790",
    orderId: "ORD-78310",
    netSale: "KSh 2,400",
    commission: "KSh 1,440",
    time: "Yesterday, 11:15",
  },
  {
    user: "Buyer #4755",
    orderId: "ORD-78190",
    netSale: "KSh 950",
    commission: "KSh 570",
    time: "2 days ago",
  },
];

export default function PartnerMainPage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Partner Home</h1>
            <p className="text-[12px] text-[#6B7A79] mt-0.5">
              Track referrals and earnings
            </p>
          </div>

          {/* Total Referrals */}
          <div className="px-5 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Total Referrals (PACs)</p>
              <p className="text-3xl font-bold text-[#0F6E76] mt-1">12</p>
              <p className="text-[11px] text-[#6B7A79] mt-1">
                Users who signed up with your code
              </p>
            </div>
          </div>

          {/* Daily Sales List */}
          <div className="px-5 flex-1 overflow-y-auto">
            <h2 className="text-[13px] font-semibold text-[#142A2E] mb-2">
              Sales & Commission
            </h2>
            <p className="text-[11px] text-[#8B9998] mb-3">
              Appears only after the 24-hour payment timer ends
            </p>

            <div className="space-y-3 pb-4">
              {sales.map((sale) => (
                <div key={sale.orderId} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[#142A2E]">{sale.user}</p>
                      <p className="text-[11px] text-[#8B9998] mt-0.5">{sale.orderId}</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#0F6E76]">{sale.commission}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0F4F3]">
                    <p className="text-[11px] text-[#8B9998]">Net Sale: {sale.netSale}</p>
                    <p className="text-[11px] text-[#8B9998]">{sale.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/partner/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#8B9998]">Profile</span>
            </Link>

            <Link href="/partner/main" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📊</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">Home</span>
            </Link>

            <Link href="/partner/history" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📜</span>
              <span className="text-[10px] text-[#8B9998]">History</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
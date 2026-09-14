import Link from "next/link";

const completedOrders = [
  {
    id: "ORD-78421",
    items: "PPR Gate Valve 32mm",
    amount: "KSh 1,200",
    delivered: "Today, 14:20",
    status: "timer", // timer | paid | returned
    timer: "18 hrs left",
  },
  {
    id: "ORD-78355",
    items: "32mm PPR Pipe + Connector",
    amount: "KSh 2,100",
    delivered: "Yesterday, 11:05",
    status: "paid",
    timer: "Paid",
  },
  {
    id: "ORD-78290",
    items: "Ball Valve 25mm",
    amount: "KSh 950",
    delivered: "2 days ago",
    status: "returned",
    timer: "Return requested",
  },
];

export default function VendorPayoutPage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Completed Orders</h1>
            <p className="text-[12px] text-[#6B7A79] mt-0.5">
              24-hour timer & payment status
            </p>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {completedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#142A2E]">{order.id}</p>
                    <p className="text-[12px] text-[#6B7A79] mt-0.5">{order.items}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    order.status === "paid" 
                      ? "bg-[#E4F1EE] text-[#0F6E76]" 
                      : order.status === "returned"
                      ? "bg-[#FDECEC] text-[#C64435]"
                      : "bg-[#FFF3E0] text-[#E4A73B]"
                  }`}>
                    {order.status === "paid" ? "✓ Paid" : order.status === "returned" ? "✕ Return" : "Timer"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0F4F3]">
                  <p className="text-[12px] text-[#8B9998]">{order.delivered}</p>
                  <p className={`text-[12px] font-medium ${
                    order.status === "paid" 
                      ? "text-[#0F6E76]" 
                      : order.status === "returned"
                      ? "text-[#C64435]"
                      : "text-[#E4A73B]"
                  }`}>
                    {order.timer}
                  </p>
                </div>

                <p className="text-[14px] font-semibold text-[#142A2E] mt-2">
                  {order.amount}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/vendor/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#8B9998]">Profile</span>
            </Link>

            <Link href="/vendor/orders" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] text-[#8B9998]">Home</span>
            </Link>

            <Link href="/vendor/payout" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">💰</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">Payout</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
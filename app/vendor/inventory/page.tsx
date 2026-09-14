import Link from "next/link";

const stockItems = [
  { name: "PPR Gate Valve 32mm", stock: 24, low: false },
  { name: "PPR Pipe 32mm (4m)", stock: 8, low: true },
  { name: "Pipe Connector 32mm", stock: 45, low: false },
  { name: "Ball Valve 25mm", stock: 12, low: false },
  { name: "Thread Seal Tape", stock: 3, low: true },
  { name: "Elbow Joint 32mm", stock: 31, low: false },
];

export default function VendorInventoryPage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/vendor/orders" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-[#142A2E]">Inventory</h1>
              <p className="text-[12px] text-[#6B7A79]">Current stock levels</p>
            </div>
          </div>

          {/* Stock List */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-6">
            {stockItems.map((item) => (
              <div 
                key={item.name}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#142A2E]">{item.name}</p>
                  <p className={`text-[12px] mt-0.5 ${item.low ? "text-[#C64435]" : "text-[#6B7A79]"}`}>
                    {item.low ? "Low stock" : "In stock"}
                  </p>
                </div>
                <p className={`text-[16px] font-bold ${item.low ? "text-[#C64435]" : "text-[#0F6E76]"}`}>
                  {item.stock}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
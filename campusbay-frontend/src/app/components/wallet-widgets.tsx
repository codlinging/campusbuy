"use client";

import { useEffect, useState } from "react";

interface WalletData {
  user_id: string; total_balance: number; locked_funds: number; available: number;
}

export default function WalletWidget() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, { credentials: "include" });
        if (res.ok) setWallet(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchWallet();
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const amount = parseFloat(topUpAmount);
    
    if (amount > 0) {
      await fetch(`http://${window.location.hostname}:8081/api/v1/wallet/topup`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount })
      });
      window.location.reload(); 
    }
    setIsProcessing(false);
  };

  if (!wallet) return <div className="animate-pulse w-24 h-10 bg-slate-200 rounded-lg"></div>;

  return (
    <>
      {/* Wallet Pill */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 pl-4 pr-2 py-1.5 rounded-full shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">Wallet</span>
          <span className="text-sm font-black text-green-600 leading-none">${wallet.available.toFixed(2)}</span>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="w-6 h-6 ml-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs transition-colors">
          +
        </button>
      </div>

      {/* Top Up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Add Funds</h2>
            <p className="text-slate-500 mb-6 text-sm">Transfer test money into your Campus Wallet.</p>
            
            <form onSubmit={handleTopUp}>
              <div className="relative mb-6">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold">$</span>
                <input
                  type="number" step="0.01" min="1" required autoFocus
                  value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full h-14 pl-8 pr-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-xl font-bold"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="flex-1 h-12 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {isProcessing ? "Processing..." : "Add Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
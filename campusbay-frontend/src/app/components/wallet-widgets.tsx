"use client";

import { useEffect, useState } from "react";

interface WalletData {
  user_id: string;
  total_balance: number;
  locked_funds: number;
  available: number;
}

export default function WalletWidget() {
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, { credentials: "include" });
        if (res.ok) setWallet(await res.json());
      } catch (err) {
        console.error("Failed to load wallet", err);
      }
    };
    fetchWallet();
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTopUp = async () => {
    const amountStr = prompt("Enter amount to add to your Campus Wallet:");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    await fetch(`http://${window.location.hostname}:8081/api/v1/wallet/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount })
    });
    window.location.reload(); // Refresh to show new balance!
  };

  if (!wallet) return <div className="animate-pulse w-24 h-10 bg-slate-200 rounded-lg"></div>;

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 pl-4 pr-2 py-1.5 rounded-full shadow-sm">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">Wallet</span>
        <span className="text-sm font-black text-green-600 leading-none">${wallet.available.toFixed(2)}</span>
      </div>
      
      {/* New Top Up Button! */}
      <button onClick={handleTopUp} title="Add Money" className="w-6 h-6 ml-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs transition-colors">
        +
      </button>

      {wallet.locked_funds > 0 && (
        <div className="group relative flex items-center justify-center w-6 h-6 bg-amber-100 rounded-full cursor-help">
          <span className="text-amber-600 text-xs">🔒</span>
        </div>
      )}
    </div>
  );
}
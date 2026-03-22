"use client";

import { useEffect, useState } from "react";

interface WalletData {
  total_balance: number;
  locked_funds: number;
  available: number;
}

export default function WalletWidget() {
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setWallet(data);
        }
      } catch (err) {
        console.error("Failed to load wallet", err);
      }
    };

    fetchWallet();

    // Optional: Refresh the wallet every 5 seconds to catch deductions from live bids
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!wallet) return <div className="animate-pulse w-24 h-10 bg-slate-200 rounded-lg"></div>;

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-1 py-1 rounded-full shadow-sm">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">
          Campus Wallet
        </span>
        <span className="text-sm font-black text-green-600 leading-none">
          ${wallet.available.toFixed(2)}
        </span>
      </div>
      
      {/* Visual Indicator of locked funds */}
      {wallet.locked_funds > 0 && (
        <div className="group relative flex items-center justify-center w-6 h-6 bg-amber-100 rounded-full cursor-help">
          <span className="text-amber-600 text-xs">🔒</span>
          {/* Tooltip */}
          <div className="absolute top-full mt-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            ${wallet.locked_funds.toFixed(2)} locked in active bids.
          </div>
        </div>
      )}
    </div>
  );
}
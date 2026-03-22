"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets"; // <-- Imported the wallet!

interface Listing {
  id: string; title: string; description: string; current_price: number; image_url?: string;
}

export default function LiveAuctionPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const ws = useRef<WebSocket | null>(null);

  // 1. Fetch Initial Item Data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/listings/${listingId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Item not found");
        const data = await res.json();
        setListing(data);
        setCurrentPrice(data.current_price);
        setBidAmount((data.current_price + 1).toFixed(2));
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    };
    fetchListing();
  }, [listingId, router]);

  // 2. Establish WebSocket Connection
  useEffect(() => {
    if (!listingId) return;

    const socket = new WebSocket(`ws://${window.location.hostname}:8081/api/v1/auctions/${listingId}/ws`);
    ws.current = socket;

    socket.onopen = () => setWsStatus("connected");
    socket.onclose = () => setWsStatus("disconnected");

    // THE FIX IS HERE 👇
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Check if the backend sent an error (e.g. insufficient funds)
        if (data.error) {
          alert("Bid Failed: " + data.error);
          return; // Stop executing so the app doesn't crash!
        }

        // 2. If no error, update the price safely
        if (data.amount !== undefined) {
          setCurrentPrice(data.amount);
          setBidAmount((data.amount + 1).toFixed(2));
        }
      } catch (error) {
        console.error("Error parsing live bid:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [listingId]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);

    if (amount <= currentPrice) {
      alert("Your bid must be higher than the current price!");
      return;
    }

    if (ws.current && wsStatus === "connected") {
      const bidPayload = {
        listing_id: listingId,
        user_id: "placeholder", // The backend ignores this now and uses your JWT!
        amount: amount,
      };
      ws.current.send(JSON.stringify(bidPayload));
    }
  };

  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse w-12 h-12 bg-indigo-200 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* NEW: Top Navigation Bar with Wallet */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-2">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            {/* HERE IS YOUR WALLET! */}
            <WalletWidget />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Column: Image */}
            <div className="md:w-1/2 bg-slate-100 min-h-[300px] relative">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Image</div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                {wsStatus === "connected" ? "Live Auction" : "Reconnecting..."}
              </div>
            </div>

            {/* Right Column: Auction Details & Bidding */}
            <div className="md:w-1/2 p-8 flex flex-col">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{listing.title}</h1>
              <p className="text-slate-500 mb-6 flex-grow">{listing.description}</p>
              
              <div className="mb-8">
                <Link 
                  href={`/chat/chat-${listingId}`} 
                  className="inline-flex items-center justify-center w-full bg-white border-2 border-slate-200 text-slate-700 h-12 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                >
                  💬 Message Seller
                </Link>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Current Highest Bid</p>
                <p className="text-5xl font-black text-green-600 transition-all duration-300 transform">
                  ${currentPrice.toFixed(2)}
                </p>
              </div>

              <form onSubmit={handlePlaceBid} className="flex gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={(currentPrice + 0.01).toFixed(2)}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full h-14 pl-8 pr-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-lg font-bold transition-colors"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={wsStatus !== "connected"}
                  className="bg-indigo-600 text-white px-8 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Place Bid
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
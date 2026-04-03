"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets";
import LogoutButton from "@/components/logout-button";
import Image from "next/image";

interface Listing { id: string; title: string; description: string; current_price: number; image_url?: string; seller_name?: string; created_at: string; expires_at: string; }

export default function LiveAuctionPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/listings/${listingId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Item not found");
        const data = await res.json();
        setListing(data); setCurrentPrice(data.current_price); setBidAmount((data.current_price + 1).toFixed(2));
      } catch (err) { router.push("/dashboard"); }
    };
    fetchListing();
  }, [listingId, router]);

  useEffect(() => {
    if (!listingId) return;
    const socket = new WebSocket(`ws://${window.location.hostname}:8081/api/v1/auctions/${listingId}/ws`);
    ws.current = socket;
    socket.onopen = () => setWsStatus("connected");
    socket.onclose = () => setWsStatus("disconnected");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) return alert("Bid Failed: " + data.error);
        if (data.amount !== undefined) {
          setCurrentPrice(data.amount); setBidAmount((data.amount + 1).toFixed(2));
        }
      } catch (error) { console.error("Error:", error); }
    };
    return () => socket.close();
  }, [listingId]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (amount <= currentPrice && (new Date(listing!.expires_at).getTime() - new Date(listing!.created_at).getTime()) / (1000 * 60 * 60) < 167) {
      return alert("Your bid must be higher than the current price!");
    }
    if (ws.current && wsStatus === "connected") {
      ws.current.send(JSON.stringify({ listing_id: listingId, user_id: "placeholder", amount }));
    }
  };

  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]"><div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  const isFixedPrice = (new Date(listing.expires_at).getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60) >= 167;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100 font-sans text-slate-900 selection:bg-indigo-200">
      
      {/* Glass Navbar */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-up">
          <Link href="/dashboard" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-md border border-slate-100">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-slate-500 hover:text-indigo-600 transition-colors">&larr; Back to Market</span>
          </Link>
          <div className="flex items-center gap-5">
            <WalletWidget />
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto animate-fade-up">
          
          {/* Frosted Glass Container */}
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden flex flex-col md:flex-row">
            
            {/* Left: Image */}
            <div className="md:w-1/2 bg-slate-100/50 min-h-[400px] relative p-4 flex items-center justify-center">
              <div className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-inner border border-slate-200/50">
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.title} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">No Image Provided</div>
                )}
              </div>
              <div className={`absolute top-8 left-8 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black shadow-lg flex items-center gap-2 border ${isFixedPrice ? "bg-white/90 border-slate-200 text-slate-700" : "bg-indigo-900/90 border-indigo-500 text-white"}`}>
                {!isFixedPrice && <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-400 animate-pulse" : "bg-red-500"}`}></span>}
                {isFixedPrice ? "Fixed Price Listing" : (wsStatus === "connected" ? "Live Auction Active" : "Reconnecting...")}
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{listing.title}</h1>
              
              <div className="flex items-center gap-3 mb-6 text-sm text-slate-500 font-medium bg-white/50 w-fit px-4 py-2 rounded-full border border-white shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {listing.seller_name ? listing.seller_name.charAt(0) : "S"}
                </div>
                Sold by <span className="text-slate-900 font-bold">{listing.seller_name || "CampusBay Student"}</span>
              </div>

              <p className="text-slate-600 mb-8 flex-grow leading-relaxed text-lg">{listing.description}</p>
              
              <div className="mb-8">
                <Link href={`/chat/chat-${listingId}`} className="inline-flex items-center justify-center w-full bg-white border-2 border-indigo-100 text-indigo-600 h-14 rounded-2xl font-black hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm text-lg">
                  💬 Message Seller
                </Link>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white shadow-sm mb-6">
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">{isFixedPrice ? "Asking Price" : "Current Highest Bid"}</p>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300">
                  ${currentPrice.toFixed(2)}
                </p>
              </div>

              {isFixedPrice ? (
                <button onClick={(e) => { setBidAmount(currentPrice.toString()); handlePlaceBid(e); }} disabled={wsStatus !== "connected"} className="relative w-full h-14 inline-flex overflow-hidden rounded-2xl p-[2px] hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-emerald-500/20 disabled:opacity-50">
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#86efac_0%,#10b981_50%,#86efac_100%)]" />
                  <span className="inline-flex h-full w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-lg font-black text-white backdrop-blur-3xl uppercase tracking-wider">
                    Buy Now for ${currentPrice.toFixed(2)}
                  </span>
                </button>
              ) : (
                <form onSubmit={handlePlaceBid} className="flex gap-3">
                  <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-400 font-black text-xl">$</span>
                    <input type="number" step="0.01" min={(currentPrice + 0.01).toFixed(2)} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required className="w-full h-14 pl-10 pr-4 rounded-2xl border-2 border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-xl font-black transition-all shadow-inner" />
                  </div>
                  <button type="submit" disabled={wsStatus !== "connected"} className="relative h-14 w-40 inline-flex overflow-hidden rounded-2xl p-[2px] hover:scale-[1.05] transition-transform duration-300 shadow-xl shadow-indigo-500/20 disabled:opacity-50">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white backdrop-blur-3xl uppercase tracking-wider">
                      Place Bid
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
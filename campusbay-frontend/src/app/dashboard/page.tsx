"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets";
import LogoutButton from "@/components/logout-button";
import Image from "next/image"; // Next.js optimized image component

interface Listing {
  id: string; title: string; description: string; current_price: number; image_url?: string; created_at: string; expires_at: string;
}

export default function DashboardPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]); 
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialListings = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:8081/api/v1/listings`, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setAllListings(data);
          setDisplayedListings(data);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInitialListings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDisplayedListings(allListings);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setDisplayedListings(allListings.filter(item => 
        item.title.toLowerCase().includes(lowercasedQuery) || item.description.toLowerCase().includes(lowercasedQuery)
      ));
    }
  }, [searchQuery, allListings]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100 font-sans text-slate-900 selection:bg-indigo-200">
      
      {/* 1. Glassmorphism Navigation Bar */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            {/* YOUR NEW LOGO GOES HERE */}
            <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-md border border-slate-100">
              <Image src="/logo.jpg" alt="CampusBay Logo" fill className="object-cover" />
            </div>
            {/* Gradient Text for the Brand */}
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CampusBay
            </h1>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, dorm gear..."
                className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 bg-slate-100/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-inner"
              />
              <span className="absolute left-4 top-3.5 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <WalletWidget />

            {/* Animated Gradient Button */}
            <Link href="/create-listing" className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-indigo-500/25">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-1 text-sm font-bold text-white backdrop-blur-3xl">
                + Sell Item
              </span>
            </Link>
            
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-indigo-500/30 transition-all hover:rotate-12 duration-300 text-white font-bold">
                JD
              </div>
            </Link>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-b from-indigo-50 to-transparent pt-12 pb-6 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">
            Discover the Best Deals on Campus.
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl font-medium">
            Join the ultimate student marketplace. Bid on live auctions or grab fixed-price essentials from your peers.
          </p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(n => <div key={n} className="h-80 bg-slate-200/60 rounded-3xl"></div>)}
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm animate-fade-up">
            <p className="text-slate-500 text-lg">No active items right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedListings.map((item, index) => {
              const isFixedPrice = (new Date(item.expires_at).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60) >= 167;
              
              return (
                <Link href={`/auction/${item.id}`} key={item.id} 
                  className={`animate-fade-up`} 
                  style={{ animationDelay: `${(index % 4) * 100}ms` }} // Staggered entrance
                >
                  {/* Floating Card Animation */}
                  <div className="group bg-white/60 backdrop-blur-lg border border-white/40 rounded-[2rem] overflow-hidden hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full shadow-lg shadow-slate-200/50">
                    
                    {/* Image Section */}
                    <div className="h-56 w-full bg-slate-100 relative overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Image</div>
                      )}
                      
                      {/* Dynamic Badge with Glowing Dot */}
                      <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border ${
                        isFixedPrice 
                        ? "bg-white/80 border-slate-200 text-slate-700" 
                        : "bg-indigo-900/80 border-indigo-500/50 text-white"
                      }`}>
                        {!isFixedPrice && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        {isFixedPrice ? "Fixed Price" : "Live Auction"}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-extrabold text-slate-900 line-clamp-1 mb-2 text-lg group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow leading-relaxed">{item.description}</p>

                      <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            {isFixedPrice ? "Asking Price" : "Current Bid"}
                          </p>
                          <p className="text-2xl font-black text-slate-900">${item.current_price.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          {isFixedPrice ? "Buy" : "Bid"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
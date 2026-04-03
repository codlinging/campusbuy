"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets"; // <-- Fixed typo here!

interface Listing {
  id: string; 
  title: string; 
  description: string; 
  current_price: number; 
  image_url?: string;
  created_at: string; 
  expires_at: string;
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
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchInitialListings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDisplayedListings(allListings);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = allListings.filter(item => 
        item.title.toLowerCase().includes(lowercasedQuery) || 
        item.description.toLowerCase().includes(lowercasedQuery)
      );
      setDisplayedListings(filtered);
    }
  }, [searchQuery, allListings]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">CampusBay</h1>
          </div>
          
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search textbooks, tech, dorm gear..."
              className="w-full h-10 px-4 rounded-full border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <WalletWidget />

            <Link href="/create-listing" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
              + Sell Item
            </Link>
            
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                <span className="text-indigo-700 font-bold">JD</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Fresh on Campus</h2>

        {loading ? (
          <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-40 bg-slate-200 rounded"></div></div></div>
        ) : displayedListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">No active items right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedListings.map((item) => (
              <Link href={`/auction/${item.id}`} key={item.id}>
                <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer h-full">
                  
                  {/* Image Section */}
                  <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    <div className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm ${
                      (new Date(item.expires_at).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60) >= 167 
                      ? "text-slate-700" 
                      : "text-indigo-700"
                    }`}>
                      {(new Date(item.expires_at).getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60) >= 167 
                        ? "Fixed Price" 
                        : "Live Auction"
                      }
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-grow">{item.description}</p>

                    <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Current Bid</p>
                        <p className="text-lg font-bold text-slate-900">${item.current_price.toFixed(2)}</p>
                      </div>
                      <button className="bg-slate-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
                        Bid
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
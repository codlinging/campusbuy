"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets";
import LogoutButton from "@/components/logout-button";
import Image from "next/image";

interface ProfileListing { id: string; title: string; current_price: number; image_url: string; status: string; }
interface ProfileBid { listing_id: string; title: string; my_bid_amount: number; current_price: number; image_url: string; }

export default function ProfilePage() {
  const [myListings, setMyListings] = useState<ProfileListing[]>([]);
  const [myBids, setMyBids] = useState<ProfileBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/profile`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMyListings(data.my_listings);
          setMyBids(data.my_bids);
        }
      } catch (err) { console.error("Failed to load profile", err); } finally { setLoading(false); }
    };
    fetchProfileData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-200">
      
      {/* 1. Reusable Glass Navbar (Matches Dashboard) */}
      <nav className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-up">
          <Link href="/dashboard" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-md border border-slate-100">
              <Image src="/logo.jpg" alt="CampusBay Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-slate-400 hover:text-indigo-600 transition-colors">&larr; Back to Market</span>
          </Link>
          <div className="flex items-center gap-5">
            <WalletWidget />
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* 2. Stunning Profile Banner */}
      <div className="bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 pt-16 pb-24 border-b-4 border-indigo-500 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-end gap-6 animate-fade-up">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 p-1 shadow-2xl transform translate-y-8">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-black text-white">
              JD
            </div>
          </div>
          <div className="mb-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">My Command Center</h1>
            <p className="text-indigo-200 font-medium mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Active Student Account
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-4">
        {loading ? (
          <div className="animate-pulse space-y-8"><div className="h-40 bg-slate-200/60 rounded-3xl"></div></div>
        ) : (
          <div className="space-y-16">
            
            {/* Section 1: Active Bids */}
            <section className="animate-fade-up delay-100">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">🎯</span> Auctions I'm Winning
              </h2>
              {myBids.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center shadow-sm">
                  <p className="text-slate-500 font-medium">You haven't placed any bids yet. Go find some deals!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBids.map((bid) => (
                    <Link href={`/auction/${bid.listing_id}`} key={bid.listing_id}>
                      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center p-4 gap-4 group">
                        <div className="w-24 h-24 relative rounded-2xl overflow-hidden">
                          <img src={bid.image_url || "/placeholder.jpg"} alt={bid.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-extrabold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{bid.title}</h3>
                          <div className="mt-2 text-sm bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-slate-500 flex justify-between">My Bid: <span className="font-bold text-slate-900">${bid.my_bid_amount.toFixed(2)}</span></p>
                            <p className="text-slate-500 flex justify-between mt-0.5">Current: <span className={bid.my_bid_amount >= bid.current_price ? "text-green-600 font-black" : "text-red-500 font-black"}>
                              ${bid.current_price.toFixed(2)}
                            </span></p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            {/* Section 2: My Listings */}
            <section className="animate-fade-up delay-200">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                  <span className="bg-purple-100 text-purple-600 p-2 rounded-xl">📦</span> Items I'm Selling
                </h2>
                <Link href="/create-listing" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  + Add New Item
                </Link>
              </div>
              
              {myListings.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center shadow-sm">
                  <p className="text-slate-500 font-medium">You aren't selling anything right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {myListings.map((item) => (
                    <div key={item.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative">
                      
                      {/* Beautiful Delete Button */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if(confirm("Are you sure you want to delete this listing?")) {
                            await fetch(`http://${window.location.hostname}:8081/api/v1/listings/${item.id}`, { method: 'DELETE', credentials: "include" });
                            window.location.reload();
                          }
                        }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 hover:text-white hover:bg-red-500 w-8 h-8 rounded-full font-black shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center scale-90 group-hover:scale-100"
                        title="Delete Item"
                      >
                        ✕
                      </button>

                      <Link href={`/auction/${item.id}`} className="flex flex-col h-full">
                        <div className="h-40 w-full relative overflow-hidden">
                          <img src={item.image_url || "/placeholder.jpg"} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out bg-slate-100" />
                        </div>
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <h3 className="font-extrabold text-slate-900 line-clamp-1 mb-3 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-xl font-black text-green-600">${item.current_price.toFixed(2)}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
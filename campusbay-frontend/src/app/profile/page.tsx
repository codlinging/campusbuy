"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WalletWidget from "@/components/wallet-widgets";

interface ProfileListing {
  id: string; title: string; current_price: number; image_url: string; status: string;
}

interface ProfileBid {
  listing_id: string; title: string; my_bid_amount: number; current_price: number; image_url: string;
}

export default function ProfilePage() {
  const [myListings, setMyListings] = useState<ProfileListing[]>([]);
  const [myBids, setMyBids] = useState<ProfileBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/v1/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setMyListings(data.my_listings);
          setMyBids(data.my_bids);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-2">
            &larr; Back to Marketplace
          </Link>
          <div className="flex items-center gap-4">
            <WalletWidget />
            <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-2">Manage your listings and track your active bids.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-8"><div className="h-40 bg-slate-200 rounded-2xl"></div></div>
        ) : (
          <div className="space-y-12">
            
            {/* Section 1: Active Bids */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🎯 Auctions I'm Winning
              </h2>
              {myBids.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                  You haven't placed any bids yet. Go find some deals!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBids.map((bid) => (
                    <Link href={`/auction/${bid.listing_id}`} key={bid.listing_id}>
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex items-center p-4 gap-4">
                        <img src={bid.image_url || "/placeholder.jpg"} alt={bid.title} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 line-clamp-1">{bid.title}</h3>
                          <div className="mt-2 text-sm">
                            <p className="text-slate-500">Your Bid: <span className="font-bold text-slate-900">${bid.my_bid_amount.toFixed(2)}</span></p>
                            <p className="text-slate-500">Current: <span className={bid.my_bid_amount >= bid.current_price ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
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

            <hr className="border-slate-200" />

            {/* Section 2: My Listings */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  📦 Items I'm Selling
                </h2>
                <Link href="/create-listing" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                  + Add New
                </Link>
              </div>
              
              {myListings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                  You aren't selling anything right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {myListings.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full relative">
                      
                      {/* NEW DELETE BUTTON */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if(confirm("Are you sure you want to delete this listing?")) {
                            await fetch(`http://${window.location.hostname}:8081/api/v1/listings/${item.id}`, { method: 'DELETE', credentials: "include" });
                            window.location.reload();
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full font-bold shadow-md z-10"
                      >
                        X
                      </button>

                      <Link href={`/auction/${item.id}`} className="flex flex-col h-full">
                        <img src={item.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"} alt={item.title} className="w-full h-40 object-cover bg-slate-100" />
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <h3 className="font-bold text-slate-900 line-clamp-1 mb-2">{item.title}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-black text-green-600">${item.current_price.toFixed(2)}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, active_listings: 0, total_bid_volume: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings">("overview");

  // Fetch all admin data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stats
        let res = await fetch(`http://${window.location.hostname}:8081/api/v1/admin/stats`, { credentials: "include" });
        if (res.ok) setStats(await res.json());

        // Fetch Users
        res = await fetch(`http://${window.location.hostname}:8081/api/v1/admin/users`, { credentials: "include" });
        if (res.ok) setUsers(await res.json());

        // Fetch Listings (Reusing your existing endpoint, but viewing as Admin)
        res = await fetch(`http://${window.location.hostname}:8081/api/v1/listings`, { credentials: "include" });
        if (res.ok) setListings(await res.json());
      } catch (err) {
        console.error("Admin fetch failed", err);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("WARNING: This will permanently delete the user, their wallet, and all their listings/bids. Continue?")) return;
    await fetch(`http://${window.location.hostname}:8081/api/v1/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    setUsers(users.filter(u => u.id !== id));
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Remove this listing from the marketplace?")) return;
    await fetch(`http://${window.location.hostname}:8081/api/v1/admin/listings/${id}`, { method: "DELETE", credentials: "include" });
    setListings(listings.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Dark Mode Admin Nav */}
      <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">A</div>
            <h1 className="text-xl font-extrabold tracking-widest text-white uppercase">Overwatch Admin</h1>
          </div>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm font-bold">
            Exit to Marketplace &rarr;
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Controls */}
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
          {["overview", "users", "listings"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors ${
                activeTab === tab ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">Total Registered Users</p>
              <p className="text-5xl font-black text-white">{stats.total_users}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">Active Listings</p>
              <p className="text-5xl font-black text-indigo-400">{stats.active_listings}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-2">Total Bid Volume</p>
              <p className="text-5xl font-black text-green-400">${stats.total_bid_volume.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Tab 2: User Moderation */}
        {activeTab === "users" && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-wider">
                <tr><th className="p-4">User ID / Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{u.email}</p>
                      <p className="text-xs text-slate-500">{u.id}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>{u.role}</span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Ban User</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Listing Moderation */}
        {activeTab === "listings" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden relative">
                <button onClick={() => handleDeleteListing(item.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full font-bold shadow-md z-10 flex items-center justify-center">X</button>
                <img src={item.image_url || "/placeholder.jpg"} className="w-full h-32 object-cover opacity-80" />
                <div className="p-4">
                  <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-green-400 font-bold mt-1">${item.current_price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
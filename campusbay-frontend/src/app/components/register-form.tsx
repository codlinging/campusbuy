"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error" | "success"; message: string }>({ type: "idle", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Creating account..." });

    try {
      const response = await fetch(`http://${window.location.hostname}:8081/api/v1/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      setStatus({ type: "success", message: "Account created! Please log in." });
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">First Name</label>
          <input name="first_name" required placeholder="Jane" onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Last Name</label>
          <input name="last_name" required placeholder="Doe" onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">University Email (.edu)</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">✉️</span>
          <input name="email" type="email" required placeholder="student@university.edu" onChange={handleChange} className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">🔒</span>
          <input name="password" type="password" required minLength={8} placeholder="••••••••" onChange={handleChange} className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" />
        </div>
      </div>

      {status.type === "error" && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold animate-fade-up">{status.message}</div>}
      {status.type === "success" && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold animate-fade-up">{status.message}</div>}

      <button type="submit" disabled={status.type === "loading"} className="relative w-full h-12 inline-flex overflow-hidden rounded-xl p-[2px] hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:hover:scale-100 mt-4">
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-black text-white backdrop-blur-3xl uppercase tracking-wider">
          {status.type === "loading" ? "Creating..." : "Join CampusBay"}
        </span>
      </button>
    </form>
  );
}
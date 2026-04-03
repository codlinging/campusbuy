"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error" | "success"; message: string }>({
    type: "idle",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Authenticating..." });

    try {
      // Note: If you changed your Go port to 8081 in the last step, update this URL!
      const response = await fetch("http://localhost:8081/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // REQUIRED to receive the HttpOnly cookie
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setStatus({ type: "success", message: "Welcome back!" });
      
      // NEW: Intelligent Redirection based on Role!
      setTimeout(() => {
        if (data.user.role === "admin") {
          router.push("/admin"); // Take the boss to the command center
        } else {
          router.push("/dashboard"); // Take students to the marketplace
        }
      }, 1000);
    } catch (error: any) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">University Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="student@university.edu"
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          onChange={handleChange}
        />
      </div>

      {status.type === "error" && (
        <div className="text-sm text-red-500 font-medium">{status.message}</div>
      )}
      {status.type === "success" && (
        <div className="text-sm text-green-600 font-medium">{status.message}</div>
      )}

      <button
        type="submit"
        disabled={status.type === "loading"}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-900/90 h-10 px-4 py-2 w-full"
      >
        {status.type === "loading" ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
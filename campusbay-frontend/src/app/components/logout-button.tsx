"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Hit the Go backend to destroy the HttpOnly cookie
      await fetch(`http://${window.location.hostname}:8081/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      // Redirect to the login page
      router.push("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors ml-2"
    >
      Log out
    </button>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Welcome to CampusBay
        </h1>
        <p className="text-xl text-slate-600">
          The verified, inter-university marketplace. Buy, sell, and bid safely within your trusted student network.
        </p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-900 text-white hover:bg-slate-900/90 h-11 px-8"
          >
            Create Account
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-900 h-11 px-8"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
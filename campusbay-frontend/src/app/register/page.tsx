import RegisterForm from "@/components/register-form";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden selection:bg-indigo-200 py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-up">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 mb-4 hover:rotate-6 transition-transform duration-500">
              <Image src="/logo.jpg" alt="CampusBay" fill className="object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Account</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium text-center">Join your university's marketplace.</p>
          </div>

          <RegisterForm />

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account? <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-black hover:underline transition-all">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
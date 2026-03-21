import LoginForm from "@/app/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Log in to access CampusBay.
          </p>
        </div>
        
        <LoginForm />
        
        <p className="text-center text-sm text-slate-500">
          Don't have an account? <a href="/register" className="font-medium text-slate-900 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}
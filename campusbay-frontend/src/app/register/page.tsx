import RegisterForm from "@/app/components/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            CampusBay
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Create an account to join your campus marketplace.
          </p>
        </div>
        
        <RegisterForm />
        
        <p className="text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="font-medium text-slate-900 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
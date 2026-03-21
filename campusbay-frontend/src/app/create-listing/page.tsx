import CreateListingForm from "@/components/create-listing-form";
import Link from "next/link";

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">List an Item</h1>
            <p className="mt-2 text-slate-500">Post your item to the trusted CampusBay network.</p>
          </div>
          <CreateListingForm />
        </div>
      </div>
    </div>
  );
}
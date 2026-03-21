"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateListingForm() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error" | "success"; message: string }>({ type: "idle", message: "" });
  
  // UI States
  const [listingType, setListingType] = useState<"auction" | "fixed">("auction");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State to hold the actual physical file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration_hours: "48",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate a local preview AND save the physical file for the Go backend
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save the physical file to state
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // Keep the UI preview working
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Posting your item..." });

    try {
      // If it's a fixed price, we default the duration to 1 week (168 hours) behind the scenes
      const finalDuration = listingType === "fixed" ? 168 : parseInt(formData.duration_hours);

      // We MUST use FormData instead of JSON.stringify to send physical files
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("starting_price", formData.price);
      submitData.append("duration_hours", finalDuration.toString());
      
      // Attach the physical file if the user selected one
      if (selectedFile) {
        submitData.append("image", selectedFile);
      }

      const response = await fetch("http://localhost:8081/api/v1/listings", {
        method: "POST",
        // CRITICAL: Do NOT set the "Content-Type" header here! 
        // The browser automatically sets it to 'multipart/form-data' when it detects FormData.
        credentials: "include", 
        body: submitData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create listing");

      setStatus({ type: "success", message: "Item posted successfully!" });
      setTimeout(() => router.push("/dashboard"), 1000); 
    } catch (error: any) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. Format Toggle (Auction vs Fixed Price) */}
      <div className="flex p-1 bg-slate-100 rounded-lg max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setListingType("auction")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            listingType === "auction" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Live Auction
        </button>
        <button
          type="button"
          onClick={() => setListingType("fixed")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            listingType === "fixed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Fixed Price
        </button>
      </div>

      {/* 2. Image Upload Area */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Item Photo</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors relative overflow-hidden group cursor-pointer">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">Click to change</p>
              </div>
            </>
          ) : (
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 justify-center">
                <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                  Upload a file
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          {/* Invisible file input covering the whole box */}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
      </div>

      {/* 3. Item Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
          <input name="title" required className="w-full h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="What are you selling?" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
          <textarea name="description" required rows={3} className="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Condition, brand, flaws, etc." onChange={handleChange} />
        </div>
      </div>

      {/* 4. Pricing & Duration (Dynamic based on toggle) */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {listingType === "auction" ? "Starting Bid ($)" : "Asking Price ($)"}
          </label>
          <input name="price" type="number" step="0.01" min="0" required className="w-full h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="0.00" onChange={handleChange} />
        </div>
        
        {listingType === "auction" && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Auction Duration</label>
            <select name="duration_hours" className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 transition-all" onChange={handleChange} defaultValue="48">
              <option value="12">12 Hours</option>
              <option value="24">24 Hours</option>
              <option value="48">2 Days</option>
              <option value="168">1 Week</option>
            </select>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {status.type === "error" && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{status.message}</div>}
      {status.type === "success" && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{status.message}</div>}

      <button type="submit" disabled={status.type === "loading"} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 h-12 rounded-xl font-bold text-lg shadow-sm transition-all disabled:opacity-70">
        {status.type === "loading" ? "Publishing..." : `Post ${listingType === "auction" ? "Auction" : "Item"}`}
      </button>
    </form>
  );
}
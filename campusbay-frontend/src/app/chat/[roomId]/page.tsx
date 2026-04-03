"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface ChatMessage { listing_id: string; sender_id: string; receiver_id: string; content: string; }

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const actualListingId = roomId.replace("chat-", "");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [myUserId, setMyUserId] = useState<string>("");
  const [listing, setListing] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, { credentials: "include" })
      .then(res => res.json()).then(data => setMyUserId(data.user_id)).catch(console.error);
    fetch(`http://${window.location.hostname}:8081/api/v1/listings/${actualListingId}`, { credentials: "include" })
      .then(res => res.json()).then(data => setListing(data)).catch(console.error);
  }, [actualListingId]);

  useEffect(() => {
    if (!roomId) return;
    const socket = new WebSocket(`ws://${window.location.hostname}:8081/api/v1/chat/${roomId}/ws`);
    ws.current = socket;
    socket.onopen = () => setWsStatus("connected");
    socket.onclose = () => setWsStatus("disconnected");
    socket.onmessage = (event) => {
      try { setMessages(prev => [...prev, JSON.parse(event.data)]); } catch (e) { console.error(e); }
    };
    return () => socket.close();
  }, [roomId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || wsStatus !== "connected" || !ws.current || !listing) return;
    ws.current.send(JSON.stringify({ listing_id: actualListingId, sender_id: myUserId, receiver_id: listing.seller_id, content: currentMessage.trim() }));
    setCurrentMessage("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100 flex flex-col items-center py-8 px-4 selection:bg-indigo-200">
      
      {/* Frosted Glass Chat Container */}
      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden flex flex-col h-[85vh] animate-fade-up">
        
        {/* Chat Header */}
        <div className="p-6 border-b border-white/50 bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:shadow-md transition-all font-bold">&larr;</button>
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-black shadow-inner text-lg">
              {listing?.seller_name ? listing.seller_name.charAt(0) : "S"}
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg">{listing ? listing.title : "Connecting to chat..."}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`}></span>
                {wsStatus === "connected" ? "Secure Connection" : "Connecting..."}
              </p>
            </div>
          </div>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 mb-4 opacity-50"><Image src="/logo.jpg" alt="Logo" width={64} height={64} className="rounded-2xl grayscale" /></div>
              <p className="font-bold text-lg text-slate-500">No messages yet.</p>
              <p className="text-sm font-medium">Send a message to start negotiating!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = myUserId && msg.sender_id === myUserId;
              const isSeller = listing && msg.sender_id === listing.seller_id;
              
              return (
                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-fade-up`} style={{ animationDuration: '0.3s' }}>
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 mx-3 ${isSeller ? "text-indigo-500" : "text-emerald-500"}`}>
                    {isSeller ? "Seller" : "Buyer"} {isMe ? "(You)" : ""}
                  </span>
                  <div className={`max-w-[80%] px-5 py-3.5 shadow-sm border ${
                    isMe 
                      ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-3xl rounded-tr-sm border-indigo-400/50" 
                      : "bg-white text-slate-900 rounded-3xl rounded-tl-sm border-white"
                  }`}>
                    <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} /> 
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white/60 border-t border-white/50 backdrop-blur-md">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} placeholder="Type your message..."
              className="flex-1 h-14 px-6 rounded-full border-2 border-white bg-white/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-inner"
            />
            <button type="submit" disabled={!currentMessage.trim() || wsStatus !== "connected"} className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
              <span className="transform translate-x-[-2px]">➤</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


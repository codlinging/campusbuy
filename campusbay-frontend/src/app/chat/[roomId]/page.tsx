"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ChatMessage {
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const actualListingId = roomId.replace("chat-", "");
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [myUserId, setMyUserId] = useState<string>("");
  
  // NEW: Store the listing data so we know who the seller is!
  const [listing, setListing] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Wallet (for myUserId) and Listing (for seller_id and title)
  useEffect(() => {
    fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setMyUserId(data.user_id))
      .catch(console.error);

    fetch(`http://${window.location.hostname}:8081/api/v1/listings/${actualListingId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setListing(data))
      .catch(console.error);
  }, [actualListingId]);

  // Establish WebSocket Connection
  useEffect(() => {
    if (!roomId) return;

    const wsUrl = `ws://${window.location.hostname}:8081/api/v1/chat/${roomId}/ws`;
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => setWsStatus("connected");
    socket.onclose = () => setWsStatus("disconnected");

    socket.onmessage = (event) => {
      try {
        const newMsg: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMsg]);
      } catch (error) {
        console.error("Error parsing chat message:", error);
      }
    };

    return () => socket.close();
  }, [roomId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || wsStatus !== "connected" || !ws.current || !listing) return;

    const payload: ChatMessage = {
      listing_id: actualListingId, 
      sender_id: myUserId,
      receiver_id: listing.seller_id, // Now dynamically sending to the actual seller!
      content: currentMessage.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    setCurrentMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-indigo-600 font-medium px-2">&larr; Back</button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {listing?.seller_name ? listing.seller_name.charAt(0) : "S"}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{listing ? `Chatting about: ${listing.title}` : "Loading Chat..."}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${wsStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}></span>
                {wsStatus === "connected" ? "Online" : "Connecting..."}
              </p>
            </div>
          </div>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p>No messages yet.</p>
              <p className="text-sm">Send a message to start negotiating!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = myUserId && msg.sender_id === myUserId;
              const isSeller = listing && msg.sender_id === listing.seller_id;
              
              return (
                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* NEW: Seller / Buyer Tag */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 mx-2 ${isSeller ? "text-indigo-500" : "text-emerald-500"}`}>
                    {isSeller ? "Seller" : "Buyer"} {isMe ? "(You)" : ""}
                  </span>

                  <div className={`max-w-[75%] px-4 py-3 ${
                    isMe 
                      ? "bg-indigo-600 text-white rounded-3xl rounded-tr-sm shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-900 rounded-3xl rounded-tl-sm shadow-sm"
                  }`}>
                    <p className="text-sm md:text-base">{msg.content}</p>
                  </div>

                </div>
              );
            })
          )}
          <div ref={messagesEndRef} /> 
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!currentMessage.trim() || wsStatus !== "connected"}
              className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
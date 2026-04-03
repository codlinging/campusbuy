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
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Hardcoded for testing. In Phase 5, this comes from your JWT!
const [myUserId, setMyUserId] = useState<string>("");

  useEffect(() => {
    // Fetch real ID from wallet securely
    fetch(`http://${window.location.hostname}:8081/api/v1/wallet`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setMyUserId(data.user_id))
      .catch(console.error);
  }, []);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    // Pro-Tip: Using window.location.hostname automatically uses 'localhost' 
    // on your laptop and '192.168.x.x' on your phone without you changing the code!
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
    if (!currentMessage.trim() || wsStatus !== "connected" || !ws.current) return;

    const payload: ChatMessage = {
      listing_id: roomId.replace("chat-", ""), // Extracting a rough ID for the DB
      sender_id: myUserId,
      receiver_id: "seller-id", // In a full app, you pass the actual seller ID here
      content: currentMessage.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    setCurrentMessage(""); // Clear input
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-indigo-600 font-medium px-2">&larr; Back</button>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              S
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Seller Chat</h2>
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
              const isMe = msg.sender_id === myUserId;
              return (
                <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm"
                  }`}>
                    <p className="text-sm md:text-base">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} /> {/* Invisible div to scroll to */}
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
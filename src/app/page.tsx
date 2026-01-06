"use client";

import TiptapEditor from "@/components/tiptap-editor";
import { useState } from "react";

export default function Home() {
  const [room, setRoom] = useState("default-room");
  const [inputRoom, setInputRoom] = useState("default-room");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="size-4 bg-primary rounded-full" />
          <span className="font-bold text-lg tracking-tight">SyncPad</span>
        </div>
        
        <div className="flex items-center gap-2">
             <input 
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setRoom(inputRoom)}
                className="bg-secondary/50 border border-input px-3 py-1.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
                placeholder="Enter room name..."
             />
             <button 
                onClick={() => setRoom(inputRoom)}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                Join or Create
             </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                {room}
            </h1>
            <p className="text-muted-foreground">
                Real-time collaborative pad. Type below to start syncing.
            </p>
        </div>
        
        <TiptapEditor room={room} />
      </main>
    </div>
  );
}

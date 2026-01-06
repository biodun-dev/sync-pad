"use client";

import { cn } from "@/lib/utils";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getRandomName = () => `User ${Math.floor(Math.random() * 100)}`;

export default function TiptapEditor({ room = "default-room" }: { room?: string }) {
  // We need to initialize YJS doc and providers only once or when room changes
  // Using a state initialization function prevents recreation
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Offline persistence
    const indexeddbProvider = new IndexeddbPersistence(room, doc);
    
    // Sync provider
    const wsProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: room,
      document: doc,
      onConnect: () => setStatus("connected"),
      onClose: () => setStatus("disconnected"),
    });

    setYdoc(doc);
    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      indexeddbProvider.destroy();
      doc.destroy();
    };
  }, [room]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
           // history: false, // Type error workaround
        }),
        Placeholder.configure({
            placeholder: 'Start typing...',
        }),
        Collaboration.configure({
          document: ydoc || undefined,
        }),
        CollaborationCursor.configure({
          provider: provider || undefined,
          user: {
            name: getRandomName(),
            color: getRandomColor(),
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "focus:outline-none min-h-[500px] prose prose-invert max-w-none p-4",
        },
      },
      immediatelyRender: false, // Fix SSR hydration mismatch
    },
    [ydoc, provider] // Re-initialize when these change
  );

  if (!editor || !ydoc || !provider) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
        Initializing Editor...
      </div>
    );
  }

  return (
    <div className="relative w-full border border-border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
        {/* Status Indicator */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
            <div className={cn("size-2 rounded-full", status === 'connected' ? 'bg-green-500' : 'bg-red-500')} />
        </div>
      <EditorContent editor={editor} />
    </div>
  );
}

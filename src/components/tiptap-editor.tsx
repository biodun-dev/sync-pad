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
  const [context, setContext] = useState<{
    ydoc: Y.Doc;
    provider: HocuspocusProvider;
  } | null>(null);
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    setStatus("disconnected");
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

    // @ts-ignore - Polyfill for extensions that might expect 'doc' property
    wsProvider.doc = doc;

    setContext({ ydoc: doc, provider: wsProvider });

    return () => {
      wsProvider.destroy();
      indexeddbProvider.destroy();
      // content is cleared on next effect run
    };
  }, [room]);

  // Ensure strict synchronization between room prop and provider
  if (!context || context.provider.configuration.name !== room) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
        Initializing Editor...
      </div>
    );
  }

  return <Editor room={room} ydoc={context.ydoc} provider={context.provider} status={status} />;
}

function Editor({ 
    room, 
    ydoc, 
    provider, 
    status 
}: { 
    room: string; 
    ydoc: Y.Doc; 
    provider: HocuspocusProvider; 
    status: "connected" | "disconnected" 
}) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
           // The Collaboration extension comes with its own history handling
           // @ts-ignore
           history: false,
        }),
        Placeholder.configure({
            placeholder: 'Start typing...',
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: provider,
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
      immediatelyRender: false, 
    },
    [ydoc, provider]
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
        Loading Editor...
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

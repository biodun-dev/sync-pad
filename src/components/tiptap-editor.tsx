"use client";

import { cn } from "@/lib/utils";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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

export interface TiptapEditorRef {
    getJSON: () => JSONContent | null;
    setContent: (content: JSONContent) => void;
}

interface TiptapEditorProps {
    ydoc: Y.Doc;
    provider: HocuspocusProvider | null;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({ ydoc, provider }, ref) => {
  if (!provider) {
       return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
        Initializing connection...
      </div>
    );
  }

  return <Editor ydoc={ydoc} provider={provider} ref={ref} />;
});

TiptapEditor.displayName = "TiptapEditor";
export default TiptapEditor;

interface EditorProps {
    ydoc: Y.Doc;
    provider: HocuspocusProvider;
}

const Editor = forwardRef<TiptapEditorRef, EditorProps>(({ 
    ydoc, 
    provider, 
}, ref) => {
    const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");
    
    useEffect(() => {
        const onStatus = ({ status }: { status: "connected" | "disconnected" }) => {
            setStatus(status);
        };
        
        provider.on('status', onStatus);
        
        return () => {
            provider.off('status', onStatus);
        };
    }, [provider]);

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
  
  useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON() || null,
      setContent: (content: JSONContent) => {
          if (editor) {
              editor.commands.setContent(content);
          }
      }
  }), [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
        Loading Editor...
      </div>
    );
  }

  return (
    <div className="relative w-full border border-border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
   
        <div className="absolute top-2 right-2 z-10 flex gap-2">
            <div className={cn("size-2 rounded-full", status === 'connected' ? 'bg-green-500' : 'bg-red-500')} />
        </div>
      <EditorContent editor={editor} />
    </div>
  );
});

Editor.displayName = "Editor";

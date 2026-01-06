"use client";

import TiptapEditor, { TiptapEditorRef } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Version, VersionHistoryList } from "@/components/version-history-list";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

export default function Home() {
  const [room, setRoom] = useState("default-room");
  const [inputRoom, setInputRoom] = useState("default-room");
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  
  // UI State
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
  const editorRef = useRef<TiptapEditorRef>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const indexeddbProvider = new IndexeddbPersistence(room, doc);
    
    const wsProvider = new HocuspocusProvider({
      url: "ws://localhost:1234",
      name: room,
      document: doc,
    });
    
    // @ts-ignore
    wsProvider.doc = doc;

    setYdoc(doc);
    setProvider(wsProvider);

    const versionsArray = doc.getArray<Version>('versions');
    setVersions(versionsArray.toArray());

    const observer = () => {
        setVersions(versionsArray.toArray());
    };
    versionsArray.observe(observer);

    return () => {
      wsProvider.destroy();
      indexeddbProvider.destroy();
      versionsArray.unobserve(observer);
      doc.destroy();
    };
  }, [room]);

  const handleSaveVersionClick = () => {
      if (!ydoc || !editorRef.current) return;
      setNewVersionName(`Version ${versions.length + 1}`);
      setIsSaveDialogOpen(true);
  };

  const confirmSaveVersion = () => {
      if (!ydoc || !editorRef.current) return;
      
      const content = editorRef.current.getJSON();
      if (!content) {
          toast.error("Could not capture editor content.");
          return;
      }

      const name = newVersionName || `Version ${versions.length + 1}`;
      
      const version: Version = {
          date: Date.now(),
          name,
          snapshot: content
      };
      
      ydoc.getArray<Version>('versions').push([version]);
      toast.success(`Version "${name}" saved!`);
      setIsSaveDialogOpen(false);
  };

  const handleRestoreVersionClick = (version: Version) => {
      setVersionToRestore(version);
      setIsRestoreDialogOpen(true);
  };

  const confirmRestoreVersion = () => {
      if (!editorRef.current || !versionToRestore) return;

      editorRef.current.setContent(versionToRestore.snapshot);
      toast.success(`Restored to "${versionToRestore.name}"`);
      setIsRestoreDialogOpen(false);
      setVersionToRestore(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="size-4 bg-primary rounded-full" />
          <span className="font-bold text-lg tracking-tight">SyncPad</span>
        </div>
        
        <div className="flex items-center gap-2">
             <Input 
                value={inputRoom}
                onChange={(e: any) => setInputRoom(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && setRoom(inputRoom)}
                className="w-48 bg-secondary/50 h-8"
                placeholder="Enter room name..."
             />
             <Button 
                onClick={() => setRoom(inputRoom)}
                size="sm"
            >
                Join or Create
             </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full overflow-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                    {room}
                </h1>
                <p className="text-muted-foreground">
                    Real-time collaborative pad.
                </p>
            </div>
            
            {ydoc && provider && provider.configuration.name === room ? (
                 <TiptapEditor 
                    ydoc={ydoc} 
                    provider={provider} 
                    ref={editorRef}
                 />
            ) : (
                <div className="flex items-center justify-center min-h-[500px] text-muted-foreground animate-pulse">
                    Initializing connection...
                </div>
            )}
          </main>
          
          <VersionHistoryList 
            versions={versions}
            onSave={handleSaveVersionClick}
            onRestore={handleRestoreVersionClick}
          />
      </div>

      {/* Save Version Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Save Version</DialogTitle>
                <DialogDescription>
                    Give a name to this snapshot of your document.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input 
                    value={newVersionName} 
                    onChange={(e) => setNewVersionName(e.target.value)} 
                    placeholder="Version Name"
                    onKeyDown={(e) => e.key === 'Enter' && confirmSaveVersion()}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmSaveVersion}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Version Confirmation Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Restore Version?</DialogTitle>
                <DialogDescription>
                    Are you sure you want to restore <strong>{versionToRestore?.name}</strong>?
                    <br />
                    This will overwrite the current document content for everyone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsRestoreDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmRestoreVersion}>Restore</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

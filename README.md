# SyncPad

A premium, local-first collaborative document editor built with **Next.js**, **Tiptap**, and **Yjs**.

![SyncPad Preview](/preview-image-placeholder.png)

## Features

-   **Real-time Collaboration:** Multiple users can edit the same document simultaneously.
-   **Local-First & Offline:** Changes are saved to your browser's database (`IndexedDB`) instantly. You can keep editing offline, and changes sync when you reconnect.
-   **Live Cursors:** See where others are typing in real-time.
-   **Premium UI:** Minimalist, high-contrast monochrome design inspired by Apple's aesthetic.

## Architecture

-   **Frontend:** Next.js 14+ (App Router), Tailwind CSS v4, Shadcn UI.
-   **Editor Engine:** Tiptap (Headless Rich Text).
-   **State Management:** Yjs (Conflict-free Replicated Data Types - CRDTs).
-   **Backend (Signaling):** Hocuspocus (A scalable WebSocket server based on Node.js).
-   **Persistence:**
    -   **Client:** `y-indexeddb` for offline capabilities.
    -   **Server:** In-memory relay (currently). Can be extended to Redis/Postgres.

## Getting Started

You need to run **two** processes: the Next.js frontend and the WebSocket server.

### 1. Start the WebSocket Server (Backend)
This handles the real-time syncing between users.

```bash
pnpm run server
```
_Runs on port 1234._

### 2. Start the Frontend Application
This serves the UI.

```bash
pnpm run dev
```
_Runs on port 3000._

### 3. Open the App
Visit [http://localhost:3000](http://localhost:3000).
- Open it in multiple windows to test collaboration.
- Type in a room name to create/join a specific document room.

## Database & Persistence FAQ

**Q: Is there a database connected?**
**A:** Yes, but it's a **Local-First** database.
-   **Primary Storage:** The application uses `IndexedDB` inside your browser to save data. This means your data works 100% offline.
-   **Syncing:** The WebSocket server relays changes between users. Currently, the server is "stateless" (in-memory) for simplicity, meaning it just passes messages. If the server restarts, clients re-sync from their local IndexedDB.
-   **Future Production:** For a production deployment, we would connect Hocuspocus to a Postgres or Redis database to keep a central backup copy.

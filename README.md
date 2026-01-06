# SyncPad: Real-time Collaborative Editor

> **Tagline:** A local-first, collaborative document editor (think Google Docs or Notion).

## 🚀 Project Overview

SyncPad is a high-performance, offline-first collaborative text editor built to demonstrate advanced distributed system concepts on the frontend. It allows multiple users to edit documents simultaneously with real-time updates, presence awareness (live cursors), and conflict-free synchronization.

Unlike traditional editors that rely on a central server for truth, SyncPad uses **CRDTs (Conflict-free Replicated Data Types)** to ensure that all peers eventually converge to the same state, regardless of network latency or offline intervals.

## ✨ Key Features

-   **Real-time Collaboration**: Changes from other users appear instantly via WebSockets.
-   **Offline-First Architecture**: Continue editing without an internet connection. Changes are persisted locally via `IndexedDB` and automatically merged when online.
-   **Multi-User Presence**: See who else is in the document and where their cursor is located.
-   **Time-Travel Version History**: Save named snapshots of the document and restore previous states instantly.
-   **Conflict-Free Merging**: Powered by Y.js to handle complex concurrent edits without data loss.

## 🛠 Tech Stack & Seniority Factors

This project implements senior-level engineering patterns:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16** (App Router) | React framework for performance and modern structure. |
| **Editor Engine** | **Tiptap** (Headless) | Framework-agnostic rich text editor. |
| **Distributed State** | **Y.js** (CRDTs) | The magic behind decentralized conflict resolution. |
| **Networking** | **Hocuspocus** | Scalable WebSocket server designed for Y.js. |
| **Persistence** | **IndexedDB** (`y-indexeddb`) | Local database for offline capability. |
| **Styling** | **Tailwind CSS 4** | Utility-first styling with a custom design system. |

## 🏗 Architecture

SyncPad utilizes a **decentralized state model**:

1.  **State Vector**: Each client maintains a local copy of the document state (Y.Doc).
2.  **Propagation**: Updates are broadcast as small binary "updates" efficiently over the wire.
3.  **Convergence**: The Hocuspocus server acts as a relay. Even if the server crashes, no data is lost because the "truth" lives on the clients (Local-First).
4.  **Sync Protocol**: On connection, clients exchange state vectors to determine missing updates.

## 🚦 Getting Started

### Prerequisites
-   Node.js 18+
-   pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the Application

Start both the Next.js frontend and the WebSocket server with one command:

```bash
pnpm dev
```

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **WebSocket Server**: `ws://localhost:1234`

### Usage
1.  Open `http://localhost:3000` in your browser.
2.  Type a room name (e.g., "demo") and click **Join**.
3.  Open the same URL in a second window or different browser.
4.  Join the **same room**.
5.  Start typing! You should see changes and cursors sync in real-time.
6.  Disconnect one client (simulate offline) -> Type -> Reconnect -> Observe auto-merge.

## 📜 License
MIT

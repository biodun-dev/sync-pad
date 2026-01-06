"use client"

import { Clock, RotateCcw, Save } from "lucide-react"

export interface Version {
  date: number
  name: string
  snapshot: any 
}

interface VersionHistoryListProps {
  versions: Version[]
  onRestore: (version: Version) => void
  onSave: () => void
}

export function VersionHistoryList({ versions, onRestore, onSave }: VersionHistoryListProps) {
  return (
    <div className="flex flex-col h-full border-l border-border bg-card w-80">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          History
        </h3>
        <button
          onClick={onSave}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Save Version"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {versions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No versions saved yet.
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.date}
              className="group flex items-start justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm">{version.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(version.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onRestore(version)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-background rounded-md transition-all border border-border shadow-sm"
                title="Restore this version"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

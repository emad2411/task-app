"use client";

import { useEffect, useCallback } from "react";

interface UseTaskKeyboardShortcutsOptions {
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  isEditing: boolean;
  onCycleStatus: () => void;
  onCyclePriority: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function useTaskKeyboardShortcuts({
  onStartEdit,
  isEditing,
  onCycleStatus,
  onCyclePriority,
  onDelete,
  onToggleComplete,
}: UseTaskKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditing) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "e":
          e.preventDefault();
          onStartEdit("title");
          break;
        case "d":
          e.preventDefault();
          onStartEdit("dueDate");
          break;
        case "s":
          e.preventDefault();
          onCycleStatus();
          break;
        case "p":
          e.preventDefault();
          onCyclePriority();
          break;
        case "c":
          e.preventDefault();
          onToggleComplete();
          break;
        case "backspace":
        case "delete":
          e.preventDefault();
          onDelete();
          break;
      }
    },
    [isEditing, onStartEdit, onCycleStatus, onCyclePriority, onDelete, onToggleComplete]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

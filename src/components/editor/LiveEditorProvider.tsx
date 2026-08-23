"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ElementData {
  pageKey: string;
  sectionKey: string;
  elementKey: string;
  type: "text" | "html" | "image";
  content: string | null;
  settings: Record<string, any>;
}

interface LiveEditorContextType {
  isEditingEnabled: boolean;
  setIsEditingEnabled: (val: boolean) => void;
  selectedElement: ElementData | null;
  setSelectedElement: (el: ElementData | null) => void;
  updateContent: (content: string) => void;
  updateSettings: (settings: Record<string, any>) => void;
  publishChanges: () => Promise<void>;
  unsavedChanges: boolean;
}

const LiveEditorContext = createContext<LiveEditorContextType | null>(null);

export function LiveEditorProvider({ children }: { children: ReactNode }) {
  const [isEditingEnabled, setIsEditingEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const updateContent = (content: string) => {
    if (selectedElement) {
      setSelectedElement({ ...selectedElement, content });
      setUnsavedChanges(true);
    }
  };

  const updateSettings = (settings: Record<string, any>) => {
    if (selectedElement) {
      setSelectedElement({ ...selectedElement, settings });
      setUnsavedChanges(true);
    }
  };

  const publishChanges = async () => {
    if (!selectedElement) return;

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: selectedElement.pageKey,
          sectionKey: selectedElement.sectionKey,
          elementKey: selectedElement.elementKey,
          contentType: selectedElement.type,
          contentValue: selectedElement.content,
          settingsJson: selectedElement.settings,
          isPublished: true, // Auto-publish for now
        })
      });

      const data = await res.json();
      if (data.success) {
        setUnsavedChanges(false);
        alert("Published successfully!");
      } else {
        alert("Failed to publish: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error publishing changes.");
    }
  };

  return (
    <LiveEditorContext.Provider
      value={{
        isEditingEnabled,
        setIsEditingEnabled,
        selectedElement,
        setSelectedElement,
        updateContent,
        updateSettings,
        publishChanges,
        unsavedChanges
      }}
    >
      {children}
    </LiveEditorContext.Provider>
  );
}

export function useLiveEditor() {
  const ctx = useContext(LiveEditorContext);
  if (!ctx) throw new Error("useLiveEditor must be used within LiveEditorProvider");
  return ctx;
}

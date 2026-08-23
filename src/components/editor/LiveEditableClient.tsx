"use client";

import React from "react";
import { useLiveEditor } from "./LiveEditorProvider";

interface LiveEditableClientProps {
  pageKey: string;
  sectionKey: string;
  elementKey: string;
  type: "text" | "html" | "image";
  as: any;
  className: string;
  initialContent: string | null;
  initialSettings: Record<string, any>;
  children: React.ReactNode;
}

export default function LiveEditableClient({
  pageKey,
  sectionKey,
  elementKey,
  type,
  as: Component,
  className,
  initialContent,
  initialSettings,
  children
}: LiveEditableClientProps) {
  const { isEditingEnabled, selectedElement, setSelectedElement } = useLiveEditor();

  const isSelected = selectedElement?.pageKey === pageKey && 
                     selectedElement?.sectionKey === sectionKey && 
                     selectedElement?.elementKey === elementKey;

  // Use the actively edited content/settings if selected, otherwise fallback to DB initial, otherwise fallback to standard children
  const currentContent = isSelected && selectedElement.content !== null ? selectedElement.content : initialContent;
  const currentSettings = isSelected ? selectedElement.settings : initialSettings;

  let displayContent = children;
  if (currentContent !== null) {
    if (type === "text") {
      displayContent = currentContent;
    } else if (type === "html") {
      displayContent = <span dangerouslySetInnerHTML={{ __html: currentContent }} />;
    } else if (type === "image") {
      // If it's an image, the children should be an img tag, or we render our own img
      displayContent = <img src={currentContent} alt="" className={className} />;
    }
  }

  if (!isEditingEnabled) {
    return (
      <Component className={className} style={currentSettings}>
        {displayContent}
      </Component>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement({
      pageKey,
      sectionKey,
      elementKey,
      type,
      content: currentContent !== null ? currentContent : "",
      settings: currentSettings
    });
  };

  return (
    <Component 
      className={`relative cursor-pointer transition-all duration-200 ${className} ${isSelected ? 'ring-2 ring-blue-500 z-10' : 'hover:ring-2 hover:ring-blue-300'}`}
      style={currentSettings}
      onClick={handleClick}
      title="Click to Edit"
    >
      {displayContent}
      
      {isSelected && (
        <span className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Editing: {elementKey}
        </span>
      )}
    </Component>
  );
}

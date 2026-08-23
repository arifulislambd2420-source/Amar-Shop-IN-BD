"use client";

import React from "react";
import { useLiveEditor } from "./LiveEditorProvider";

export default function AdminToolbar() {
  const { isEditingEnabled, setIsEditingEnabled, publishChanges, unsavedChanges } = useLiveEditor();

  return (
    <div className="fixed top-0 left-0 w-full h-12 bg-gray-900 text-white z-[9999] flex items-center justify-between px-6 shadow-md border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="font-bold text-sm bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AmarShop Admin Live Editor
        </div>
        
        <div className="h-4 w-px bg-gray-600 mx-2"></div>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isEditingEnabled}
            onChange={(e) => setIsEditingEnabled(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-800"
          />
          <span className="text-sm font-medium">Enable Edit Mode</span>
        </label>
      </div>

      <div className="flex items-center space-x-4">
        {unsavedChanges && (
          <span className="text-xs text-yellow-400 font-medium animate-pulse">Unsaved Changes</span>
        )}
        <button
          onClick={publishChanges}
          disabled={!unsavedChanges}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            unsavedChanges 
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" 
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          Publish Changes
        </button>
      </div>
    </div>
  );
}

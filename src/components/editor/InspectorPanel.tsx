"use client";

import React, { useRef, useState } from "react";
import { useLiveEditor } from "./LiveEditorProvider";

export default function InspectorPanel() {
  const { isEditingEnabled, selectedElement, setSelectedElement, updateContent, updateSettings } = useLiveEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!isEditingEnabled || !selectedElement) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateContent(e.target.value);
  };

  const handleSettingChange = (key: string, value: string) => {
    updateSettings({ ...selectedElement.settings, [key]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        updateContent(data.media.url);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed top-12 right-0 w-80 h-[calc(100vh-48px)] bg-white border-l border-gray-200 shadow-2xl z-[9998] flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-800">Inspector</h3>
        <button 
          onClick={() => setSelectedElement(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Content Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Content</h4>
          
          {selectedElement.type === 'text' || selectedElement.type === 'html' ? (
            <textarea
              className="w-full text-sm p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[120px]"
              value={selectedElement.content || ""}
              onChange={handleTextChange}
              placeholder="Enter text content..."
            />
          ) : selectedElement.type === 'image' ? (
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {selectedElement.content ? (
                  <img src={selectedElement.content} alt="Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
              <input 
                type="text" 
                className="w-full text-sm p-2 border border-gray-300 rounded-md"
                value={selectedElement.content || ""}
                onChange={handleTextChange}
                placeholder="Image URL"
              />
              <input 
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button 
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload New Image"}
              </button>
            </div>
          ) : null}
        </div>

        {/* Styles Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Styles</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Color (Hex/RGB)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  value={selectedElement.settings?.color || "#000000"} 
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer p-0"
                />
                <input 
                  type="text"
                  className="flex-1 text-sm p-1.5 border border-gray-300 rounded-md"
                  value={selectedElement.settings?.color || ""}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  placeholder="inherit"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input 
                type="text"
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md"
                value={selectedElement.settings?.fontSize || ""}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                placeholder="e.g. 1.5rem, 24px"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Background Color</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  value={selectedElement.settings?.backgroundColor || "#ffffff"} 
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer p-0"
                />
                <input 
                  type="text"
                  className="flex-1 text-sm p-1.5 border border-gray-300 rounded-md"
                  value={selectedElement.settings?.backgroundColor || ""}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  placeholder="transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Padding</label>
                <input 
                  type="text"
                  className="w-full text-sm p-1.5 border border-gray-300 rounded-md"
                  value={selectedElement.settings?.padding || ""}
                  onChange={(e) => handleSettingChange('padding', e.target.value)}
                  placeholder="e.g. 1rem"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Margin</label>
                <input 
                  type="text"
                  className="w-full text-sm p-1.5 border border-gray-300 rounded-md"
                  value={selectedElement.settings?.margin || ""}
                  onChange={(e) => handleSettingChange('margin', e.target.value)}
                  placeholder="e.g. 1rem"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
              <input 
                type="text"
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md"
                value={selectedElement.settings?.borderRadius || ""}
                onChange={(e) => handleSettingChange('borderRadius', e.target.value)}
                placeholder="e.g. 8px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

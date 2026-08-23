import { getSessionUsername } from "@/lib/auth";
import dynamic from "next/dynamic";
import React from "react";

const LiveEditorProvider = dynamic(() => import("./LiveEditorProvider").then(m => m.LiveEditorProvider));
const AdminToolbar = dynamic(() => import("./AdminToolbar"));
const InspectorPanel = dynamic(() => import("./InspectorPanel"));

export default async function AdminEditorInjector({ children }: { children: React.ReactNode }) {
  const username = await getSessionUsername();
  
  if (!username) {
    return <>{children}</>;
  }

  return (
    <LiveEditorProvider>
      <AdminToolbar />
      <div className="pt-12">
        {children}
      </div>
      <InspectorPanel />
    </LiveEditorProvider>
  );
}

import React from "react";
import { getSessionUsername } from "@/lib/auth";
import { getElementContent } from "@/lib/content";
import dynamic from "next/dynamic";

const LiveEditableClient = dynamic(() => import("./LiveEditableClient"));

interface LiveEditableProps {
  pageKey: string;
  sectionKey: string;
  elementKey: string;
  type?: "text" | "html" | "image";
  fallback: React.ReactNode;
  as?: any;
  className?: string;
  imageAlt?: string;
}

export default async function LiveEditable({
  pageKey,
  sectionKey,
  elementKey,
  type = "text",
  fallback,
  as: Component = "span",
  className = "",
  imageAlt = "",
}: LiveEditableProps) {
  const username = await getSessionUsername();
  const isAdmin = !!username;

  const content = await getElementContent(pageKey, sectionKey, elementKey, isAdmin);

  let displayContent = fallback;
  if (content && content.content_value) {
    if (type === "text") {
      displayContent = content.content_value;
    } else if (type === "html") {
      displayContent = <span dangerouslySetInnerHTML={{ __html: content.content_value }} />;
    } else if (type === "image") {
      displayContent = <img src={content.content_value} alt={imageAlt} className={className} />;
      // When it's an image, the wrapper itself might just wrap the img, or the img IS the component.
      // If `as="img"`, we need to handle it.
      if (Component === "img") {
        Component = "span"; // We render the img inside a span so the wrapper works nicely
      }
    }
  }

  // Parse custom settings (like color, font size, margins)
  let customStyle = {};
  if (content && content.settings_json) {
    customStyle = typeof content.settings_json === 'string' ? JSON.parse(content.settings_json) : content.settings_json;
  }

  if (isAdmin) {
    return (
      <LiveEditableClient
        pageKey={pageKey}
        sectionKey={sectionKey}
        elementKey={elementKey}
        type={type}
        as={Component}
        className={className}
        initialContent={content?.content_value || null}
        initialSettings={customStyle}
      >
        {displayContent}
      </LiveEditableClient>
    );
  }

  // For regular users, zero JS footprint!
  return (
    <Component className={className} style={customStyle}>
      {displayContent}
    </Component>
  );
}

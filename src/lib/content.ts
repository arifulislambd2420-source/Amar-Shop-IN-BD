import { getDb } from "./db";
import { cache } from "react";

export const getPageContents = cache(async (pageKey: string) => {
  const db = await getDb();
  // We only want published content for normal users, but for admins we might want to see drafts.
  // Let's fetch both and we'll decide in the component, or just fetch all for this page.
  const [rows] = await db.query(
    "SELECT section_key, element_key, content_type, content_value, settings_json, is_published FROM page_contents WHERE page_key = ?",
    [pageKey]
  );
  return rows as any[];
});

export const getElementContent = async (pageKey: string, sectionKey: string, elementKey: string, isAdmin: boolean) => {
  const allContents = await getPageContents(pageKey);
  const element = allContents.find(c => c.section_key === sectionKey && c.element_key === elementKey);
  
  if (!element) return null;
  
  // If not admin, only return if published
  if (!isAdmin && element.is_published === 0) {
    return null;
  }
  
  return element;
};

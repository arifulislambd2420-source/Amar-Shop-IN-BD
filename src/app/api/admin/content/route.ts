import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    if (!(await getSessionUsername())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey");
    
    // We can fetch all published and draft content if requested, or just specific page contents
    const db = await getDb();
    
    let query = "SELECT * FROM page_contents";
    const params: any[] = [];
    
    if (pageKey) {
      query += " WHERE page_key = ?";
      params.push(pageKey);
    }
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ success: true, contents: rows });
  } catch (error) {
    console.error("GET /api/admin/content Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pageKey, sectionKey, elementKey, contentType, contentValue, settingsJson, isPublished } = body;

    if (!pageKey || !sectionKey || !elementKey) {
      return NextResponse.json({ success: false, message: "Missing keys" }, { status: 400 });
    }

    const db = await getDb();

    // Check if it already exists
    const [existing] = await db.query(
      "SELECT id, version FROM page_contents WHERE page_key = ? AND section_key = ? AND element_key = ?",
      [pageKey, sectionKey, elementKey]
    );

    const existingRow = (existing as any[])[0];
    const settingsStr = settingsJson ? JSON.stringify(settingsJson) : null;
    let contentId: number;
    let newVersion = 1;

    if (existingRow) {
      contentId = existingRow.id;
      newVersion = existingRow.version + 1;

      // Update existing
      await db.execute(
        `UPDATE page_contents 
         SET content_type = ?, content_value = ?, settings_json = ?, is_published = ?, version = ?, updated_by = ?
         WHERE id = ?`,
        [contentType || 'text', contentValue, settingsStr, isPublished ? 1 : 0, newVersion, username, contentId]
      );
    } else {
      // Insert new
      const [result] = await db.execute(
        `INSERT INTO page_contents (page_key, section_key, element_key, content_type, content_value, settings_json, is_published, version, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pageKey, sectionKey, elementKey, contentType || 'text', contentValue, settingsStr, isPublished ? 1 : 0, newVersion, username]
      );
      contentId = (result as any).insertId;
    }

    // Insert into content_revisions
    await db.execute(
      `INSERT INTO content_revisions (content_id, content_value, settings_json, version, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [contentId, contentValue, settingsStr, newVersion, username]
    );

    return NextResponse.json({ success: true, message: "Content saved successfully", version: newVersion });
  } catch (error) {
    console.error("POST /api/admin/content Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

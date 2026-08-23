import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Simple validation
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Invalid file type" }, { status: 400 });
    }

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name);
    const safeName = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeName}-${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const db = await getDb();
    const [result] = await db.execute(
      `INSERT INTO media_library (file_name, file_path, mime_type, file_size) VALUES (?, ?, ?, ?)`,
      [file.name, publicUrl, file.type, file.size]
    );

    return NextResponse.json({ 
      success: true, 
      message: "File uploaded successfully",
      media: {
        id: (result as any).insertId,
        url: publicUrl
      }
    });
  } catch (error) {
    console.error("POST /api/admin/media Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const [rows] = await db.query("SELECT * FROM media_library ORDER BY created_at DESC");

    return NextResponse.json({ success: true, media: rows });
  } catch (error) {
    console.error("GET /api/admin/media Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

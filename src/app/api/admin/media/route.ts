import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUsername } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Configure Cloudinary from env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

    const publicUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "amarshopbd_media" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url as string);
          }
        }
      );
      uploadStream.end(buffer);
    });

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

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    
    // Fetch all active products
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `);
    
    const products = rows as (Product & { category_name?: string })[];
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amarshopbd.com";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>AmarShopBD Catalog</title>
    <link>${baseUrl}</link>
    <description>Dynamic product feed for Facebook and Google</description>
`;

    for (const product of products) {
      const link = `${baseUrl}/product/${product.slug}`;
      const imageLink = product.image ? 
        (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : 
        `${baseUrl}/placeholder.png`;
      
      const availability = product.stock > 0 ? "in stock" : "out of stock";
      const price = `${Number(product.price).toFixed(2)} BDT`;
      const salePrice = product.sale_price ? `${Number(product.sale_price).toFixed(2)} BDT` : price;

      // Escape special characters for XML
      const title = escapeXML(product.name);
      const description = escapeXML(product.description || product.name);
      const brand = escapeXML(product.category_name || "AmarShopBD");

      xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand>${brand}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      ${product.sale_price ? `<g:sale_price>${salePrice}</g:sale_price>` : ""}
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Facebook Feed Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function escapeXML(unsafe: string) {
  return unsafe
    .replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
}

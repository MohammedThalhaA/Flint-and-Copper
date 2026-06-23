import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { image_data, image_url, source_type } = await request.json();

    if (!['upload', 'instagram'].includes(source_type)) {
      return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
    }

    // Insert new image
    const result = await query(
      `INSERT INTO gallery_images (image_data, image_url, source_type) 
       VALUES ($1, $2, $3) RETURNING *`,
      [image_data || null, image_url || null, source_type]
    );

    // Auto-eviction logic: Enforce rolling window of 5 images
    // First check how many we have
    const countRes = await query(`SELECT COUNT(*) FROM gallery_images`);
    const count = parseInt(countRes.rows[0].count);

    if (count > 5) {
      // Find the oldest ids to delete
      const numToDelete = count - 5;
      await query(`
        DELETE FROM gallery_images 
        WHERE id IN (
          SELECT id FROM gallery_images 
          ORDER BY created_at ASC 
          LIMIT $1
        )
      `, [numToDelete]);
    }

    return NextResponse.json({ success: true, image: result.rows[0] });
  } catch (error: any) {
    console.error("POST /api/admin/gallery error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

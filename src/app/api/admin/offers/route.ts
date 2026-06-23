import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { title, description, discount_text, image_data, start_date, end_date, is_active } = await request.json();

    const result = await query(
      `INSERT INTO offers (title, description, discount_text, image_data, start_date, end_date, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, discount_text, image_data, start_date || null, end_date || null, is_active]
    );

    return NextResponse.json({ success: true, offer: result.rows[0] });
  } catch (error: any) {
    console.error("POST /api/admin/offers error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

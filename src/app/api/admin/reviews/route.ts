import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { author, text, rating, is_approved, is_featured, source } = await request.json();

    const result = await query(
      `INSERT INTO reviews (author, text, rating, is_approved, is_featured, source) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [author, text, rating, is_approved, is_featured, source]
    );

    return NextResponse.json({ success: true, review: result.rows[0] });
  } catch (error: any) {
    console.error("POST /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

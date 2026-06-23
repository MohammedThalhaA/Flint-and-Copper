import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const { title, description, discount_text, image_data, start_date, end_date, is_active } = await request.json();

    const result = await query(
      `UPDATE offers 
       SET title = $1, description = $2, discount_text = $3, image_data = $4, start_date = $5, end_date = $6, is_active = $7 
       WHERE id = $8 RETURNING *`,
      [title, description, discount_text, image_data, start_date || null, end_date || null, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer: result.rows[0] });
  } catch (error: any) {
    console.error("PUT /api/admin/offers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await query(`DELETE FROM offers WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/offers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}

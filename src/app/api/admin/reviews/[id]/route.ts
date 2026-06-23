import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const { is_approved, is_featured } = await request.json();

    const result = await query(
      `UPDATE reviews SET is_approved = $1, is_featured = $2 WHERE id = $3 RETURNING *`,
      [is_approved, is_featured, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: result.rows[0] });
  } catch (error: any) {
    console.error("PUT /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await query(`DELETE FROM reviews WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}

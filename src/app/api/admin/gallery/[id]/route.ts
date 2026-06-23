import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await query(`DELETE FROM gallery_images WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/gallery/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

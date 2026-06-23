import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const { name, category, description, duration_minutes, price, is_active } = await request.json();

    const result = await query(
      `UPDATE services 
       SET name = $1, category = $2, description = $3, duration_minutes = $4, price = $5, is_active = $6 
       WHERE id = $7 RETURNING *`,
      [name, category, description, duration_minutes, price, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: result.rows[0] });
  } catch (error: any) {
    console.error("PUT /api/admin/services/[id] error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Check for existing bookings
    const bookingsRes = await query(`SELECT COUNT(*) FROM bookings WHERE service_id = $1`, [id]);
    if (parseInt(bookingsRes.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: "Cannot delete service because it has existing bookings. Please deactivate it instead." 
      }, { status: 400 });
    }

    await query(`DELETE FROM services WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/services/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}

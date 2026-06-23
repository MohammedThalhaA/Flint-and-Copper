import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, category, description, duration_minutes, price, is_active } = await request.json();

    const maxOrderRes = await query(`SELECT MAX(display_order) as max_order FROM services WHERE category = $1`, [category]);
    const display_order = (parseInt(maxOrderRes.rows[0].max_order) || 0) + 1;

    const result = await query(
      `INSERT INTO services (name, category, description, duration_minutes, price, is_active, display_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, category, description, duration_minutes, price, is_active, display_order]
    );

    return NextResponse.json({ success: true, service: result.rows[0] });
  } catch (error: any) {
    console.error("POST /api/admin/services error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Reorder endpoint
  try {
    const { updates } = await request.json();
    // updates is an array of { id, display_order }
    
    // In raw SQL without ORM, we can do this in a loop or transaction
    for (const update of updates) {
      await query(`UPDATE services SET display_order = $1 WHERE id = $2`, [update.display_order, update.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/admin/services error:", error);
    return NextResponse.json({ error: "Failed to reorder services" }, { status: 500 });
  }
}

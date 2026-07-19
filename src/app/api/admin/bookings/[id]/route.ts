import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '@/lib/emails';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the booking first to know the customer email
    const bookingRes = await query(`
      SELECT b.*, s.name as service_name 
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `, [id]);

    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingRes.rows[0];

    // Update status
    await query(`UPDATE bookings SET status = $1 WHERE id = $2`, [status, id]);

    // Send email if confirmed or cancelled
    let emailSent = false;
    let emailError = undefined;

    if (process.env.SMTP_USER && (status === 'confirmed' || status === 'cancelled')) {
      try {
        if (status === 'confirmed') {
          await sendBookingConfirmationEmail(booking);
        } else if (status === 'cancelled') {
          await sendBookingCancellationEmail(booking);
        }
        emailSent = true;
      } catch (err: any) {
        console.error("Failed to send booking email:", err);
        emailError = err.message || "Email sending failed";
      }
    } else if (!process.env.SMTP_USER && (status === 'confirmed' || status === 'cancelled')) {
      emailError = "SMTP_USER is not configured";
    }

    return NextResponse.json({ success: true, status, emailSent, emailError });
  } catch (error: any) {
    console.error("PATCH /api/admin/bookings error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await query(`DELETE FROM bookings WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/bookings error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}

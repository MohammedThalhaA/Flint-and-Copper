import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Resend } from 'resend';

// Use a placeholder if not set to avoid crashing during development build/run
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, date, timeSlot, name, email, phone } = body;

    if (!serviceId || !date || !timeSlot || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Validate if slot is still available (Server-side re-check)
    const serviceRes = await query(`SELECT name, duration_minutes FROM services WHERE id = $1`, [serviceId]);
    if (serviceRes.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const serviceName = serviceRes.rows[0].name;

    // A robust app would do a strict overlap check here similar to the GET route.
    // For simplicity in this demo, we assume the frontend slot is valid, but we check if exact slot is taken:
    const overlapRes = await query(`
      SELECT id FROM bookings 
      WHERE date = $1 AND time_slot = $2 AND status != 'cancelled'
    `, [date, timeSlot]);

    if (overlapRes.rows.length > 0) {
      return NextResponse.json({ error: 'Time slot is no longer available.' }, { status: 409 });
    }

    // 2. Insert booking
    const insertRes = await query(`
      INSERT INTO bookings (service_id, customer_name, customer_email, customer_phone, date, time_slot, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
      RETURNING id
    `, [serviceId, name, email, phone, date, timeSlot]);

    const bookingId = insertRes.rows[0].id;

    // 3. Send emails via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      try {
        // To Customer
        await resend.emails.send({
          from: 'Flint & Copper <hello@flintandcopper.example.com>',
          to: email,
          subject: 'Your Booking Confirmation - Flint & Copper',
          html: `
            <div style="font-family: sans-serif; color: #111111;">
              <h2 style="color: #AD7D56;">Booking Confirmed</h2>
              <p>Hello ${name},</p>
              <p>Your appointment at Flint & Copper is confirmed.</p>
              <ul>
                <li><strong>Service:</strong> ${serviceName}</li>
                <li><strong>Date:</strong> ${date}</li>
                <li><strong>Time:</strong> ${timeSlot}</li>
              </ul>
              <p>We look forward to seeing you.</p>
            </div>
          `
        });

        // To Salon
        const salonEmail = process.env.SALON_NOTIFICATION_EMAIL || 'hello@flintandcopper.example.com';
        await resend.emails.send({
          from: 'System <notifications@flintandcopper.example.com>',
          to: salonEmail,
          subject: `New Booking: ${name} for ${serviceName}`,
          html: `
            <div>
              <h2>New Booking Received</h2>
              <ul>
                <li><strong>Customer:</strong> ${name} (${email}, ${phone})</li>
                <li><strong>Service:</strong> ${serviceName}</li>
                <li><strong>Date:</strong> ${date}</li>
                <li><strong>Time:</strong> ${timeSlot}</li>
              </ul>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
        // Continue, we still booked successfully
      }
    } else {
      console.log('Skipping email send. RESEND_API_KEY is not configured or is a placeholder.');
      console.log('Would have sent:', { to: email, subject: 'Booking Confirmed' });
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

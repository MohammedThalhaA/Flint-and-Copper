import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parse, addMinutes, isBefore, isAfter, isEqual, format } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 });
  }

  try {
    // 1. Get service duration
    const serviceRes = await query(`SELECT duration_minutes FROM services WHERE id = $1`, [serviceId]);
    if (serviceRes.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const duration = serviceRes.rows[0].duration_minutes;

    // 2. Get day of week (0-6, Sunday is 0)
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getUTCDay();

    // 3. Get business hours for that day
    const hoursRes = await query(`SELECT open_time, close_time, is_closed FROM business_hours WHERE day_of_week = $1`, [dayOfWeek]);
    if (hoursRes.rows.length === 0 || hoursRes.rows[0].is_closed) {
      return NextResponse.json({ slots: [] }); // Closed today
    }
    const { open_time, close_time } = hoursRes.rows[0];

    // 4. Get existing bookings for that date
    const bookingsRes = await query(`
      SELECT b.time_slot, s.duration_minutes
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.date = $1 AND b.status != 'cancelled'
    `, [dateStr]);

    const existingBookings = bookingsRes.rows.map((b: { time_slot: string; duration_minutes: number }) => ({
      start: parse(b.time_slot, 'HH:mm:ss', dateObj),
      end: addMinutes(parse(b.time_slot, 'HH:mm:ss', dateObj), b.duration_minutes)
    }));

    // 5. Generate possible slots (every 30 mins) from open to close
    const openDate = parse(open_time, 'HH:mm:ss', dateObj);
    const closeDate = parse(close_time, 'HH:mm:ss', dateObj);
    
    let currentSlot = openDate;
    const availableSlots = [];

    while (isBefore(addMinutes(currentSlot, duration), closeDate) || isEqual(addMinutes(currentSlot, duration), closeDate)) {
      const slotEnd = addMinutes(currentSlot, duration);
      
      // Check for overlap
      let isOverlapping = false;
      for (const b of existingBookings) {
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        if (isBefore(currentSlot, b.end) && isAfter(slotEnd, b.start)) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        availableSlots.push(format(currentSlot, 'HH:mm'));
      }

      // Increment by 30 minutes for the next potential start time
      currentSlot = addMinutes(currentSlot, 30);
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

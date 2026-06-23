import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const result = await query(
      `SELECT id, author, text, rating, created_at FROM reviews WHERE is_approved = true ORDER BY created_at DESC`
    );
    return NextResponse.json({ reviews: result.rows });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, text, rating } = body;

    if (!author || !text || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Insert into DB with is_approved = false
    const result = await query(
      `INSERT INTO reviews (author, text, rating, is_approved) VALUES ($1, $2, $3, false) RETURNING id`,
      [author, text, rating]
    );

    // Send email notification to owner
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Flint & Copper <sripadhmapiriya12@gmail.com>', // User's requested testing email
        to: 'hello@flintandcopper.example', // Salon owner email (mocked for demo, replace with real)
        subject: 'New Customer Review Pending Approval',
        html: `
          <h2>New Customer Review Pending</h2>
          <p><strong>Customer:</strong> ${author}</p>
          <p><strong>Rating:</strong> ${rating} / 5 Stars</p>
          <p><strong>Review:</strong></p>
          <blockquote style="border-left: 4px solid #AD7D56; padding-left: 1rem; color: #555;">
            ${text}
          </blockquote>
          <p>Please log into your database to approve this review so it appears on the website.</p>
        `,
      });
    }

    return NextResponse.json({ success: true, message: "Review submitted for approval", id: result.rows[0].id });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}

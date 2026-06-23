import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type BookingData = {
  customer_name: string;
  customer_email: string;
  service_name: string;
  date: string | Date;
  time_slot: string;
};

function getFirstName(fullName: string): string {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
}

const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flint & Copper</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F4F0; font-family: Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F5F4F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-top: 4px solid #AD7D56;">
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #111111; font-weight: 300; font-size: 24px; margin-top: 0; margin-bottom: 30px; letter-spacing: 2px; text-transform: uppercase;">Flint & Copper</h1>
              ${content}
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E6E1; font-size: 12px; color: #888888; line-height: 1.6;">
                <strong>Flint & Copper Salon & Spa</strong><br>
                123 Placeholder Avenue, Suite 400<br>
                New York, NY 10001<br>
                (555) 123-4567
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function sendBookingConfirmationEmail(booking: BookingData) {
  if (!booking.customer_email) {
    throw new Error("No customer email provided");
  }

  const firstName = getFirstName(booking.customer_name);
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const content = `
    <h2 style="color: #111111; font-weight: 300; font-size: 20px;">Hi ${firstName},</h2>
    <p style="color: #444444; line-height: 1.6; font-size: 16px;">We are delighted to confirm your upcoming appointment with Flint & Copper. Your reservation details are below:</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0; background-color: #F5F4F0; padding: 20px; border-left: 4px solid #AD7D56;">
      <tr>
        <td style="padding-bottom: 10px; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Service</td>
        <td style="padding-bottom: 10px; color: #111111; font-size: 16px; font-weight: bold;">${booking.service_name}</td>
      </tr>
      <tr>
        <td style="padding-bottom: 10px; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Date</td>
        <td style="padding-bottom: 10px; color: #111111; font-size: 16px;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
        <td style="color: #111111; font-size: 16px;">${booking.time_slot}</td>
      </tr>
    </table>
    
    <p style="color: #444444; line-height: 1.6; font-size: 16px;">Please arrive 10 minutes prior to your appointment time to settle in. If you need to make any changes to your booking, kindly contact us at least 24 hours in advance.</p>
    <p style="color: #444444; line-height: 1.6; font-size: 16px; margin-top: 30px;">We look forward to welcoming you.</p>
  `;

  const response = await transporter.sendMail({
    from: `"Flint & Copper" <${process.env.SMTP_USER}>`,
    to: booking.customer_email,
    subject: 'Your Flint & Copper Appointment is Confirmed',
    html: baseEmailTemplate(content),
  });

  return response;
}

export async function sendBookingCancellationEmail(booking: BookingData) {
  if (!booking.customer_email) {
    throw new Error("No customer email provided");
  }

  const firstName = getFirstName(booking.customer_name);
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const content = `
    <h2 style="color: #111111; font-weight: 300; font-size: 20px;">Hi ${firstName},</h2>
    <p style="color: #444444; line-height: 1.6; font-size: 16px;">We are writing to let you know that your appointment for a <strong>${booking.service_name}</strong> on <strong>${formattedDate}</strong> at <strong>${booking.time_slot}</strong> has been cancelled.</p>
    
    <p style="color: #444444; line-height: 1.6; font-size: 16px;">Unfortunately, we are unable to accommodate this booking at the requested time. We sincerely apologize for any inconvenience this may cause.</p>
    
    <p style="color: #444444; line-height: 1.6; font-size: 16px;">If you would like to select a new time that works for you, please feel free to book a new appointment through our website. We would love the opportunity to welcome you to our space.</p>
    
    <p style="color: #444444; line-height: 1.6; font-size: 16px; margin-top: 30px;">Warm regards,</p>
  `;

  const response = await transporter.sendMail({
    from: `"Flint & Copper" <${process.env.SMTP_USER}>`,
    to: booking.customer_email,
    subject: 'Your Flint & Copper Appointment Has Been Cancelled',
    html: baseEmailTemplate(content),
  });

  return response;
}

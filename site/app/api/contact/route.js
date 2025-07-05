import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET; // ✅ Match your other working version
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL; // ✅ Your email address

export async function POST(req) {
  try {
    const bodyText = await req.text(); // Required for x-www-form-urlencoded
    const params = new URLSearchParams(bodyText);

    const name = params.get('name');
    const email = params.get('email');
    const phone = params.get('phone');
    const contactMethod = params.get('contactMethod');
    const message = params.get('message');
    const turnstileToken = params.get('cf-turnstile-response');

    if (!name || !message || !turnstileToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ Verify Turnstile
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${TURNSTILE_SECRET}&response=${turnstileToken}`,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return NextResponse.json({ error: 'Turnstile verification failed' }, { status: 403 });
    }

    // ✅ Send email with Resend
    const response = await resend.emails.send({
      from: 'Website Contact Form Submission <noreply@theodore-miller.com>',
      to: CONTACT_TO_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Preferred Contact Method:</strong> ${contactMethod || 'Not specified'}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

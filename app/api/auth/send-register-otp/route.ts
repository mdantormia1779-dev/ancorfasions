import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Fallback handling in case registration_otps table doesn't exist yet
    const { error: dbError } = await supabase
      .from('registration_otps')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (dbError) {
      console.warn('Database error when saving OTP (table might not exist):', dbError);
      // In a real scenario with Resend, you'd still send the email here even if DB fails,
      // or at least notify the admin. But for now, we return error if DB insert fails.
      if (dbError.code === '42P01') {
         return NextResponse.json({ 
           error: 'Registration system is currently being set up. Please try again later.' 
         }, { status: 503 });
      }
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // TODO: Integrate Resend to actually email the OTP. 
    // For development/demo purposes, we might just log it or return success.
    console.log(`[DEMO] OTP for ${email} is ${otp}`);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in send-register-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

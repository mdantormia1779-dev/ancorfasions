import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, otp, name, password, phone } = await request.json();

    if (!email || !otp || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify OTP
    const { data: otpRecords, error: otpError } = await supabase
      .from('registration_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError) {
      console.error('Error verifying OTP:', otpError);
      return NextResponse.json({ error: 'Error verifying OTP' }, { status: 500 });
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Register user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone || '',
        }
      }
    });

    if (authError) {
       return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Note: If you have a trigger on auth.users to create profiles, it will run.
    // Otherwise, we manually insert or update the profile with the 'customer' role.
    if (authData.user) {
        // We explicitly set role to 'customer' to avoid them getting admin or employee roles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: name,
            role: 'customer' // Enforce customer role!
          });
          
        if (profileError) {
           console.warn('Failed to upsert profile role:', profileError);
        }
    }

    // Delete the used OTP
    await supabase.from('registration_otps').delete().eq('id', otpRecords[0].id);

    return NextResponse.json({ message: 'Registration successful', user: authData.user });
  } catch (error) {
    console.error('Error in verify-register-otp:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

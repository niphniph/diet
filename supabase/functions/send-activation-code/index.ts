import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, user_id } = await req.json()

    if (!email || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing email or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Generate a secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 2. Initialize Supabase client with Service Role Key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Save the code in public.email_activation_codes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins from now

    // First delete any existing codes for this user to avoid clutter
    await supabase
      .from('email_activation_codes')
      .delete()
      .eq('user_id', user_id)

    const { error: dbError } = await supabase
      .from('email_activation_codes')
      .insert({
        user_id,
        email: normalizedEmail,
        code,
        expires_at: expiresAt,
        attempts: 0
      })

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // 4. Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY secret')
    }

    const fromEmail = Deno.env.get('FROM_EMAIL') || 'NutriPlan Global <noreply@nine13.site>'

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [normalizedEmail],
        subject: 'Your NutriPlan Global verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333; background-color: #121212; color: #ffffff; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #6bfb9a; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NutriPlan Global</h2>
            </div>
            <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.5; color: #e0e0e0;">Thank you for signing up. Please use the following 6-digit verification code to activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; background-color: #1a1a1a; padding: 12px 24px; border-radius: 6px; border: 1px solid #333; color: #6bfb9a; display: inline-block;">
                ${code}
              </span>
            </div>
            <p style="color: #aaaaaa; font-size: 14px; text-align: center;">This code will expire in <strong style="color: #ffffff;">15 minutes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #333; margin: 25px 0;" />
            <p style="color: #777777; font-size: 12px; text-align: center; margin: 0;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        `
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      throw new Error(`Resend API error: ${errorText}`)
    }

    const resendData = await resendResponse.json()

    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const onboardingParam = searchParams.get('onboarding')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Persist onboarding data passed via OAuth redirect
      if (onboardingParam) {
        try {
          const onboardingData = JSON.parse(atob(onboardingParam))
          await supabase.from('couples').upsert({
            id: data.user.id,
            partner1_name: onboardingData.partner1_name,
            partner2_name: onboardingData.partner2_name,
            wedding_date: onboardingData.wedding_date || null,
            guest_count_range: onboardingData.guest_count_range,
            location: onboardingData.location,
            search_radius_km: onboardingData.search_radius_km,
            wedding_style: onboardingData.wedding_style,
            budget_total: onboardingData.budget_total,
            gdpr_consent_at: onboardingData.gdpr_consent_at,
            marketing_consent: onboardingData.marketing_consent,
            // UTM attribution
            utm_source: onboardingData.utm_source || null,
            utm_medium: onboardingData.utm_medium || null,
            utm_campaign: onboardingData.utm_campaign || null,
            onboarding_completed: true,
          })
        } catch (e) {
          console.error('Failed to parse onboarding data:', e)
        }
      }

      // Detect new vs returning user by checking couples table
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .eq('id', data.user.id)
        .single()

      const redirectTo = couple ? '/checklist' : '/onboarding'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Auth failed -- redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

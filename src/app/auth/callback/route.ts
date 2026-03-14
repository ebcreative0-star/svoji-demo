import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

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
      // Check if user has a couple record (completed onboarding)
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Returning user with couple record -> checklist
      // New user or no couple -> onboarding (which auto-completes from localStorage if data exists)
      const redirectTo = couple ? '/checklist' : '/onboarding'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Auth failed -- redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

import { NextResponse, type NextRequest } from 'next/server';

// Demo mode - skip all auth checks
const DEMO_MODE = true;

export async function updateSession(request: NextRequest) {
  // In demo mode, allow all routes without auth
  if (DEMO_MODE) {
    return NextResponse.next({ request });
  }

  // Production auth logic would go here
  return NextResponse.next({ request });
}

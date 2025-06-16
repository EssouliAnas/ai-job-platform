import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check for presence of environment variables (not their actual values for security)
  const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const openaiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    supabaseUrl,
    supabaseAnonKey,
    openaiKey
  });
} 
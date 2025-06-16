import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = createRouteHandlerClient({ cookies });

    let query = supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          name,
          industry,
          location,
          website
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status === 'open') {
      query = query.eq('status', 'PUBLISHED');
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data: jobsData, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const jobs = jobsData?.map(job => ({
      id: job.id,
      title: job.title,
      company: job.companies?.name || 'Unknown Company',
      company_name: job.companies?.name || 'Unknown Company',
      location: job.location,
      salary_range: job.salary_range || 'Competitive',
      type: job.job_type?.replace('_', '-').toLowerCase() || 'full-time',
      description: job.description,
      requirements: job.required_skills || [],
      posted: job.created_at?.split('T')[0] || '',
      created_at: job.created_at,
      status: job.status,
      company_id: job.company_id
    })) || [];

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error in jobs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
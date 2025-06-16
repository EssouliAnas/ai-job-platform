import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's applications
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings (
          title,
          companies (
            name
          )
        )
      `)
      .eq('applicant_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Transform the data for frontend consumption
    const transformedApplications = applications?.map(app => ({
      id: app.id,
      job_id: app.job_id,
      job_title: app.job_postings?.title || 'Unknown Job',
      company_name: app.job_postings?.companies?.name || 'Unknown Company',
      applied_at: app.created_at,
      status: app.status.toLowerCase()
    })) || [];

    return NextResponse.json({ 
      applications: transformedApplications,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 
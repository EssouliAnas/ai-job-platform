import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const supabase = createRouteHandlerClient({ cookies });

    console.log('Debug: Checking applications for company:', companyId);

    // First, let's check if there are any applications at all
    const { data: allApplications, error: allError } = await supabase
      .from('job_applications')
      .select('*');

    console.log('Debug: All applications count:', allApplications?.length);
    console.log('Debug: All applications error:', allError);

    // Check job postings for this company
    const { data: companyJobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('company_id', companyId);

    console.log('Debug: Company jobs count:', companyJobs?.length);
    console.log('Debug: Company jobs error:', jobsError);
    console.log('Debug: Company jobs:', companyJobs);

    // Check applications with basic join
    const { data: applicationsWithJobs, error: joinError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings (
          id,
          title,
          company_id
        ),
        users (
          email
        )
      `);

    console.log('Debug: Applications with jobs count:', applicationsWithJobs?.length);
    console.log('Debug: Applications with jobs error:', joinError);
    console.log('Debug: Applications with jobs:', applicationsWithJobs);

    // Filter applications for this company manually
    const companyApplications = applicationsWithJobs?.filter(app => 
      app.job_postings?.company_id === companyId
    );

    console.log('Debug: Filtered company applications:', companyApplications);

    return NextResponse.json({
      debug: {
        companyId,
        allApplicationsCount: allApplications?.length || 0,
        companyJobsCount: companyJobs?.length || 0,
        applicationsWithJobsCount: applicationsWithJobs?.length || 0,
        companyApplicationsCount: companyApplications?.length || 0,
        allApplications: allApplications?.slice(0, 3), // First 3 for debugging
        companyJobs: companyJobs,
        applicationsWithJobs: applicationsWithJobs?.slice(0, 3),
        companyApplications: companyApplications
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
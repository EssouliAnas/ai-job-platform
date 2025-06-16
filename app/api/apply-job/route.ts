import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobId, resumeId, resumeUrl, coverLetterUrl } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already applied to this job
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', session.user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Determine the resume URL to use
    let finalResumeUrl = resumeUrl;
    
    if (resumeId) {
      // If a specific resume ID is provided, use it
      const { data: selectedResume } = await supabase
        .from('resumes')
        .select('id')
        .eq('id', resumeId)
        .eq('user_id', session.user.id)
        .single();

      if (!selectedResume) {
        return NextResponse.json(
          { error: 'Selected resume not found or access denied' },
          { status: 400 }
        );
      }
      
      finalResumeUrl = `/api/resumes/${resumeId}`;
    } else if (!finalResumeUrl) {
      // If no resume URL or ID provided, try to get the user's latest resume
      const { data: latestResume } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestResume) {
        finalResumeUrl = `/api/resumes/${latestResume.id}`;
      } else {
        return NextResponse.json(
          { error: 'Please create a resume before applying to jobs' },
          { status: 400 }
        );
      }
    }

    // Create new application
    const { data: newApplication, error } = await supabase
      .from('job_applications')
      .insert([{
        job_id: jobId,
        applicant_id: session.user.id,
        resume_url: finalResumeUrl,
        cover_letter_url: coverLetterUrl || null,
        status: 'NEW'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      application: newApplication,
      success: true, 
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error in apply-job API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const jobId = searchParams.get('jobId');

    const supabase = createRouteHandlerClient({ cookies });

    console.log('Fetching applications with filters:', { companyId, jobId });

    // First, get job IDs for this company if companyId is provided
    let jobIds: string[] = [];
    if (companyId) {
      const { data: companyJobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('id')
        .eq('company_id', companyId);

      if (jobsError) {
        console.error('Error fetching company jobs:', jobsError);
        return NextResponse.json(
          { error: 'Failed to fetch company jobs', details: jobsError.message },
          { status: 500 }
        );
      }

      jobIds = companyJobs?.map(job => job.id) || [];
      console.log('Company job IDs:', jobIds);

      if (jobIds.length === 0) {
        console.log('No jobs found for company, returning empty applications');
        return NextResponse.json({ 
          applications: [],
          total: 0
        });
      }
    }

    // Build the applications query
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        job_postings (
          id,
          title,
          company_id,
          companies (
            name
          )
        ),
        users (
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by specific job ID if provided
    if (jobId) {
      query = query.eq('job_id', jobId);
    } 
    // Filter by company's job IDs if companyId is provided
    else if (companyId && jobIds.length > 0) {
      query = query.in('job_id', jobIds);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Found ${applications?.length || 0} applications`);

    // Process applications to extract candidate names from resume content
    const processedApplications = await Promise.all(applications?.map(async (app, index) => {
      // Extract resume ID from resume_url
      const resumeIdMatch = app.resume_url?.match(/\/api\/resumes\/([^?]+)/);
      const resumeId = resumeIdMatch ? resumeIdMatch[1] : null;
      
      // Try to get candidate name from resume content
      let candidateName = app.users?.email || `Applicant ${index + 1}`;
      
      if (resumeId) {
        try {
          // Get resume data to extract candidate name
          const { data: resumeData } = await supabase
            .from('resumes')
            .select('content')
            .eq('id', resumeId)
            .single();
            
          if (resumeData?.content?.personalInfo?.fullName) {
            candidateName = resumeData.content.personalInfo.fullName;
          }
        } catch (error) {
          console.log('Could not fetch resume data for candidate name:', error);
          // Fall back to numbered applicant if no email available
          if (!app.users?.email) {
            candidateName = `Applicant ${index + 1}`;
          }
        }
      }

      console.log('Processing application:', {
        id: app.id,
        candidateName,
        jobTitle: app.job_postings?.title,
        resumeId
      });

      return {
        ...app,
        candidate_name: candidateName,
        resume_id: resumeId
      };
    }) || []);
    
    return NextResponse.json({ 
      applications: processedApplications,
      total: processedApplications.length
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
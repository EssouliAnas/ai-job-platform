import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    console.log('Resume API called with ID:', params.id, 'Download:', download);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      console.log('Invalid UUID format:', params.id);
      return NextResponse.json(
        { error: 'Invalid resume ID format' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User ID:', session.user.id);

    // Get user info to check if they're a company
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('user_type, company_id')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching current user:', userError);
      return NextResponse.json(
        { error: 'Error fetching user information' },
        { status: 500 }
      );
    }

    console.log('Current user:', currentUser);

    let resume;

    if (currentUser?.user_type === 'company') {
      console.log('Company user accessing resume, company_id:', currentUser.company_id);
      
      // Company users can access resumes through job applications
      // First, check if this resume is associated with any application to jobs from this company
      const { data: applicationData, error: appError } = await supabase
        .from('job_applications')
        .select(`
          id,
          resume_url,
          job_postings!inner(
            id,
            company_id
          )
        `)
        .eq('job_postings.company_id', currentUser.company_id)
        .like('resume_url', `%${params.id}%`);

      if (appError) {
        console.error('Error fetching applications:', appError);
        return NextResponse.json(
          { error: 'Error checking access permissions' },
          { status: 500 }
        );
      }

      console.log('Found applications:', applicationData?.length || 0);

      if (!applicationData || applicationData.length === 0) {
        console.log('No applications found for resume access');
        return NextResponse.json(
          { error: 'Resume not found or access denied' },
          { status: 404 }
        );
      }

      // Now get the actual resume data
      console.log('Fetching resume with ID:', params.id);
      
      // First check if resume exists at all
      const { data: resumeCheck, error: checkError } = await supabase
        .from('resumes')
        .select('id, user_id')
        .eq('id', params.id);

      console.log('Resume check result:', resumeCheck, 'Error:', checkError);

      if (checkError) {
        console.error('Error checking resume existence:', checkError);
        return NextResponse.json(
          { error: 'Error checking resume existence' },
          { status: 500 }
        );
      }

      if (!resumeCheck || resumeCheck.length === 0) {
        console.log('Resume not found in database');
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }

      if (resumeCheck.length > 1) {
        console.log('Multiple resumes found with same ID (unexpected)');
        return NextResponse.json(
          { error: 'Multiple resumes found with same ID' },
          { status: 500 }
        );
      }

      // Now get the full resume data
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (resumeError) {
        console.error('Error fetching full resume data:', resumeError);
        return NextResponse.json(
          { error: 'Error fetching resume data' },
          { status: 500 }
        );
      }
      
      resume = resumeData;
    } else {
      console.log('Individual user accessing own resume');
      
      // First check if resume exists and belongs to user
      const { data: resumeCheck, error: checkError } = await supabase
        .from('resumes')
        .select('id, user_id')
        .eq('id', params.id)
        .eq('user_id', session.user.id);

      console.log('Individual user resume check:', resumeCheck, 'Error:', checkError);

      if (checkError) {
        console.error('Error checking resume existence for individual user:', checkError);
        return NextResponse.json(
          { error: 'Error checking resume existence' },
          { status: 500 }
        );
      }

      if (!resumeCheck || resumeCheck.length === 0) {
        console.log('Resume not found or access denied for individual user');
        return NextResponse.json(
          { error: 'Resume not found or access denied' },
          { status: 404 }
        );
      }

      // Now get the full resume data
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .single();

      if (resumeError) {
        console.error('Error fetching full resume data for individual user:', resumeError);
        return NextResponse.json(
          { error: 'Error fetching resume data' },
          { status: 500 }
        );
      }
      
      resume = resumeData;
    }

    console.log('Resume found:', resume?.id);

    // If download is requested, generate and return DOCX
    if (download) {
      try {
        console.log('Generating DOCX for download');
        const response = await fetch(`${request.nextUrl.origin}/api/generate-docx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resume.content),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DOCX generation failed:', errorText);
          throw new Error('Failed to generate DOCX');
        }

        const docxBuffer = await response.arrayBuffer();
        const fileName = `${resume.content.personalInfo?.fullName || 'resume'}_resume.docx`;

        console.log('DOCX generated successfully, size:', docxBuffer.byteLength);

        return new NextResponse(docxBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': docxBuffer.byteLength.toString(),
          },
        });
      } catch (docxError) {
        console.error('Error generating DOCX:', docxError);
        return NextResponse.json(
          { error: 'Failed to generate resume download' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ resume });

  } catch (error) {
    console.error('Error in resume API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, feedback } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    // Properly await cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update resume
    const { data: updatedResume, error } = await supabase
      .from('resumes')
      .update({
        content: content,
        feedback: feedback || null
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating resume:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Resume not found - multiple or no records returned' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      resume: updatedResume,
      success: true,
      message: 'Resume updated successfully'
    });

  } catch (error) {
    console.error('Error in resume API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete resume
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting resume:', error);
      return NextResponse.json(
        { error: 'Failed to delete resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error in resume API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
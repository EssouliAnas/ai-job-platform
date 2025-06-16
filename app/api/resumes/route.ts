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

    // Get user's resumes
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch resumes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      resumes: resumes || [],
      total: resumes?.length || 0
    });

  } catch (error) {
    console.error('Error in resumes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, feedback } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Resume content is required' },
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

    // Ensure user exists in users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them
      console.log('Creating user in users table:', session.user.id);
      const { error: userCreateError } = await supabase
        .from('users')
        .insert([{
          id: session.user.id,
          email: session.user.email || '',
          user_type: 'individual'
        }]);

      if (userCreateError) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try again.' },
          { status: 500 }
        );
      }
    } else if (userCheckError) {
      console.error('Error checking user:', userCheckError);
      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    // Validate content structure
    if (!content.personalInfo || !content.personalInfo.fullName) {
      return NextResponse.json(
        { error: 'Personal information is required' },
        { status: 400 }
      );
    }

    // Create new resume
    const { data: newResume, error } = await supabase
      .from('resumes')
      .insert([{
        user_id: session.user.id,
        content: content,
        feedback: feedback || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating resume:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: `Failed to save resume: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      resume: newResume,
      success: true,
      message: 'Resume saved successfully'
    });

  } catch (error) {
    console.error('Error in resumes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
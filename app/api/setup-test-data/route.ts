import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client with admin key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // First check if tables exist
    const { error: companiesError } = await supabase.from('companies').select('id').limit(1);
    if (companiesError) {
      return NextResponse.json({
        success: false,
        error: "Required tables don't exist. Please create the tables first.",
        message: "Please visit the /setup page and check the tables first, or run the SQL from the instructions in the Supabase dashboard."
      });
    }
    
    // Create test company first
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Test Company Inc.',
        description: 'A company for testing purposes',
        industry: 'Technology',
        size: '10-50',
        location: 'Remote',
        website: 'https://testcompany.example.com'
      })
      .select()
      .single();
    
    if (companyError) {
      throw new Error(`Failed to create test company: ${companyError.message}`);
    }
    
    // Create company user via auth
    const { data: companyUser, error: companyUserError } = await supabase.auth.admin.createUser({
      email: 'company@example.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (companyUserError) {
      throw new Error(`Failed to create company user: ${companyUserError.message}`);
    }
    
    // Wait a moment for the trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the user profile to be a company type and associate with company
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        user_type: 'company',
        company_id: company.id
      })
      .eq('id', companyUser.user.id);
    
    if (userUpdateError) {
      throw new Error(`Failed to associate user with company: ${userUpdateError.message}`);
    }
    
    // Create individual user via auth
    const { data: individualUser, error: individualUserError } = await supabase.auth.admin.createUser({
      email: 'individual@example.com',
      password: 'password123',
      email_confirm: true
    });
    
    if (individualUserError) {
      throw new Error(`Failed to create individual user: ${individualUserError.message}`);
    }
    
    // Wait a moment for the trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // The user should already be created as 'individual' by default from the trigger
    // But let's verify and update if needed
    const { data: individualUserProfile, error: individualCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', individualUser.user.id)
      .single();
    
    if (individualCheckError) {
      throw new Error(`Failed to verify individual user profile: ${individualCheckError.message}`);
    }
    
    // Create a job posting
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        title: 'Software Engineer',
        description: 'We are looking for a talented software engineer to join our team.',
        required_skills: ['JavaScript', 'React', 'Node.js'],
        location: 'Remote',
        job_type: 'FULL_TIME',
        salary_range: '$80,000 - $120,000',
        company_id: company.id,
        status: 'PUBLISHED'
      })
      .select()
      .single();
    
    if (jobError) {
      throw new Error(`Failed to create job posting: ${jobError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      testAccounts: {
        company: {
          email: 'company@example.com',
          password: 'password123',
          userType: 'company',
          companyId: company.id
        },
        individual: {
          email: 'individual@example.com',
          password: 'password123',
          userType: 'individual'
        }
      },
      data: {
        company,
        companyUser: companyUser.user,
        individualUser: individualUser.user,
        individualUserProfile,
        job
      }
    });
  } catch (error: any) {
    console.error('Error setting up test data:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
} 
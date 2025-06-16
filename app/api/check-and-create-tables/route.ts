import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client with admin key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Check if tables exist using a different approach
    // First, try to get data from users table to see if it exists
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    const usersExists = !usersError;

    // Check companies table
    const { error: companiesError } = await supabase.from('companies').select('id').limit(1);
    const companiesExists = !companiesError;

    // Check resumes table
    const { error: resumesError } = await supabase.from('resumes').select('id').limit(1);
    const resumesExists = !resumesError;

    // Check job_postings table
    const { error: jobPostingsError } = await supabase.from('job_postings').select('id').limit(1);
    const jobPostingsExists = !jobPostingsError;

    // Check job_applications table
    const { error: jobApplicationsError } = await supabase.from('job_applications').select('id').limit(1);
    const jobApplicationsExists = !jobApplicationsError;

    const existingTables: string[] = [];
    if (usersExists) existingTables.push('users');
    if (companiesExists) existingTables.push('companies');
    if (resumesExists) existingTables.push('resumes');
    if (jobPostingsExists) existingTables.push('job_postings');
    if (jobApplicationsExists) existingTables.push('job_applications');

    const requiredTables = ['companies', 'users', 'resumes', 'job_postings', 'job_applications'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All required tables exist',
        tables: existingTables
      });
    }

    // Let the user know we need to use a different approach
    return NextResponse.json({
      success: false,
      message: 'Missing tables detected',
      error: 'Supabase does not support direct SQL execution through the API. Please use the Supabase dashboard to create the required tables.',
      existingTables,
      missingTables,
      instructionsForSQL: `
        -- To create the missing tables, run this SQL in the Supabase SQL Editor:
        
        -- Create companies table
        CREATE TABLE IF NOT EXISTS public.companies (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          website TEXT,
          industry TEXT,
          size TEXT,
          location TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID DEFAULT auth.uid() PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'company')),
          company_id UUID REFERENCES companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Create resumes table
        CREATE TABLE IF NOT EXISTS public.resumes (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id),
          content JSONB NOT NULL,
          feedback JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Create job_postings table
        CREATE TABLE IF NOT EXISTS public.job_postings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          required_skills TEXT[] NOT NULL,
          location TEXT NOT NULL,
          job_type TEXT NOT NULL,
          salary_range TEXT,
          company_id UUID NOT NULL REFERENCES companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          status TEXT NOT NULL DEFAULT 'DRAFT',
          CONSTRAINT job_type_check CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP')),
          CONSTRAINT status_check CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
        CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
        
        -- Create job_applications table
        CREATE TABLE IF NOT EXISTS public.job_applications (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          job_id UUID NOT NULL REFERENCES job_postings(id),
          applicant_id UUID NOT NULL REFERENCES users(id),
          resume_url TEXT NOT NULL,
          cover_letter_url TEXT,
          status TEXT NOT NULL DEFAULT 'NEW',
          matching_score NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          CONSTRAINT status_check CHECK (status IN ('NEW', 'SHORTLISTED', 'REJECTED', 'HIRED'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
        CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
        CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
        
        -- Create trigger function for updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Create triggers for each table
        DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
        CREATE TRIGGER update_companies_updated_at
          BEFORE UPDATE ON companies
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
        CREATE TRIGGER update_resumes_updated_at
          BEFORE UPDATE ON resumes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
        CREATE TRIGGER update_job_postings_updated_at
          BEFORE UPDATE ON job_postings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
        CREATE TRIGGER update_job_applications_updated_at
          BEFORE UPDATE ON job_applications
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        -- Enable RLS on all tables
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Public can view company profiles"
          ON companies FOR SELECT
          USING (true);
        
        CREATE POLICY "Users can manage their own company"
          ON companies FOR ALL
          USING (id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));
        
        CREATE POLICY "Users can view their own profile"
          ON users FOR SELECT
          USING (id = auth.uid());
        
        CREATE POLICY "Company admins can view company users"
          ON users FOR SELECT
          USING (company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));
        
        CREATE POLICY "Users can manage their own resumes"
          ON resumes FOR ALL
          USING (user_id = auth.uid());
        
        CREATE POLICY "Public can view published jobs"
          ON job_postings FOR SELECT
          USING (status = 'PUBLISHED');
        
        CREATE POLICY "Company members can manage their jobs"
          ON job_postings FOR ALL
          USING (company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));
        
        CREATE POLICY "Candidates can view their own applications"
          ON job_applications FOR SELECT
          USING (applicant_id = auth.uid());
        
        CREATE POLICY "Candidates can create applications"
          ON job_applications FOR INSERT
          WITH CHECK (applicant_id = auth.uid());
        
        CREATE POLICY "Company members can view applications for their jobs"
          ON job_applications FOR SELECT
          USING (job_id IN (
            SELECT id FROM job_postings
            WHERE company_id IN (
              SELECT company_id FROM users
              WHERE id = auth.uid() AND user_type = 'company'
            )
          ));
        
        CREATE POLICY "Company members can manage applications for their jobs"
          ON job_applications FOR UPDATE
          USING (job_id IN (
            SELECT id FROM job_postings
            WHERE company_id IN (
              SELECT company_id FROM users
              WHERE id = auth.uid() AND user_type = 'company'
            )
          ));
      `
    });
  } catch (error: any) {
    console.error('Error checking tables:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
} 
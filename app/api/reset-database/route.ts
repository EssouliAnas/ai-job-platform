import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client with admin key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Drop tables in the correct order (respecting foreign key constraints)
    const dropTablesSQL = `
      -- Disable triggers to avoid issues during drops
      SET session_replication_role = 'replica';

      -- Drop tables in reverse dependency order
      DROP TABLE IF EXISTS job_applications CASCADE;
      DROP TABLE IF EXISTS job_postings CASCADE;
      DROP TABLE IF EXISTS resumes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;

      -- Re-enable triggers
      SET session_replication_role = 'origin';
    `;

    // Execute the drop tables SQL
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropTablesSQL });
    
    if (dropError) {
      throw new Error(`Failed to drop tables: ${dropError.message}`);
    }

    // Create companies table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
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
      `
    });

    // Create users table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT auth.uid() PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'company')),
          company_id UUID REFERENCES companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `
    });

    // Create resumes table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS resumes (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id),
          content JSONB NOT NULL,
          feedback JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `
    });

    // Create job_postings table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS job_postings (
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
      `
    });

    // Create job_applications table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS job_applications (
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
      `
    });

    // Create trigger for updated_at
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_companies_updated_at
          BEFORE UPDATE ON companies
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_resumes_updated_at
          BEFORE UPDATE ON resumes
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_job_postings_updated_at
          BEFORE UPDATE ON job_postings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_job_applications_updated_at
          BEFORE UPDATE ON job_applications
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    // Create RLS policies
    await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS
        ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

        -- Companies Policies
        CREATE POLICY "Public can view company profiles"
          ON companies FOR SELECT
          USING (true);

        CREATE POLICY "Users can manage their own company"
          ON companies FOR ALL
          USING (id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));

        -- Users Policies
        CREATE POLICY "Users can view their own profile"
          ON users FOR SELECT
          USING (id = auth.uid());

        CREATE POLICY "Company admins can view company users"
          ON users FOR SELECT
          USING (company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));

        -- Resumes Policies
        CREATE POLICY "Users can manage their own resumes"
          ON resumes FOR ALL
          USING (user_id = auth.uid());

        -- Job Postings Policies
        CREATE POLICY "Public can view published jobs"
          ON job_postings FOR SELECT
          USING (status = 'PUBLISHED');

        CREATE POLICY "Company members can manage their jobs"
          ON job_postings FOR ALL
          USING (company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type = 'company'
          ));

        -- Job Applications Policies
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

    return NextResponse.json({ 
      success: true,
      message: 'Database reset successfully. All tables dropped and recreated.' 
    });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
} 
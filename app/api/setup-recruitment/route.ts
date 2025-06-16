import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Create job_postings table
    await supabase.rpc('create_job_postings_table', {
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
    await supabase.rpc('create_job_applications_table', {
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
    await supabase.rpc('create_update_timestamp_trigger', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
        END;
        $$ language 'plpgsql';

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
    await supabase.rpc('create_rls_policies', {
      sql: `
        -- Enable RLS
        ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

        -- Job Postings Policies
        CREATE POLICY "Public can view published jobs"
          ON job_postings FOR SELECT
          USING (status = 'PUBLISHED');

        CREATE POLICY "Company members can manage their jobs"
          ON job_postings FOR ALL
          USING (company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND user_type IN ('recruiter', 'admin')
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
              WHERE id = auth.uid() AND user_type IN ('recruiter', 'admin')
            )
          ));

        CREATE POLICY "Company members can manage applications for their jobs"
          ON job_applications FOR UPDATE
          USING (job_id IN (
            SELECT id FROM job_postings
            WHERE company_id IN (
              SELECT company_id FROM users
              WHERE id = auth.uid() AND user_type IN ('recruiter', 'admin')
            )
          ));
      `
    });

    return NextResponse.json({ message: 'Recruitment system tables created successfully' });
  } catch (error: any) {
    console.error('Error setting up recruitment system:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
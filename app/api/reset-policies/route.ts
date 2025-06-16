import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a Supabase client with admin key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Note: This endpoint requires manual execution of SQL
    // Supabase doesn't allow policy creation via API
    
    const policiesSQL = `
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view company profiles" ON companies;
DROP POLICY IF EXISTS "Users can manage their own company" ON companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Company admins can view company users" ON users;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;
DROP POLICY IF EXISTS "Public can view published jobs" ON job_postings;
DROP POLICY IF EXISTS "Company members can manage their jobs" ON job_postings;
DROP POLICY IF EXISTS "Candidates can view their own applications" ON job_applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON job_applications;
DROP POLICY IF EXISTS "Company members can view applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Company members can manage applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Company users can update their company" ON companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view published jobs" ON job_postings;
DROP POLICY IF EXISTS "Company users can manage their jobs" ON job_postings;
DROP POLICY IF EXISTS "Users can view their own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can create applications" ON job_applications;
DROP POLICY IF EXISTS "Company users can view applications to their jobs" ON job_applications;
DROP POLICY IF EXISTS "Company users can update applications to their jobs" ON job_applications;

-- Companies policies
CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Company users can update their company"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.company_id = companies.id 
      AND u.user_type = 'company'
    )
  );

CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can manage their own resumes"
  ON resumes FOR ALL
  USING (user_id = auth.uid());

-- Job postings policies
CREATE POLICY "Anyone can view published jobs"
  ON job_postings FOR SELECT
  USING (status = 'PUBLISHED' OR auth.uid() IS NOT NULL);

CREATE POLICY "Company users can manage their jobs"
  ON job_postings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.company_id = job_postings.company_id 
      AND u.user_type = 'company'
    )
  );

-- Job applications policies
CREATE POLICY "Users can view their own applications"
  ON job_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Users can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Company users can view applications to their jobs"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN users u ON u.company_id = jp.company_id
      WHERE jp.id = job_applications.job_id
      AND u.id = auth.uid()
      AND u.user_type = 'company'
    )
  );

CREATE POLICY "Company users can update applications to their jobs"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN users u ON u.company_id = jp.company_id
      WHERE jp.id = job_applications.job_id
      AND u.id = auth.uid()
      AND u.user_type = 'company'
    )
  );
`;

    return NextResponse.json({
      success: false,
      message: 'Policy reset requires manual SQL execution',
      instructions: 'Please run the following SQL in the Supabase SQL Editor to reset policies and fix infinite recursion:',
      sql: policiesSQL,
      supabaseUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/sql`
    });

  } catch (error: any) {
    console.error('Error in reset policies:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
} 